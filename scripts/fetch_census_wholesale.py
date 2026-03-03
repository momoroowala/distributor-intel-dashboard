"""
Fetch Monthly Wholesale Trade Survey data from Census Bureau.
Source: https://census.gov/wholesale/
API: https://api.census.gov/data/timeseries/eits/mwts

Note: FRED already has aggregate wholesale sales/inventories (WHLSLRSMSA, WHLSLRIMSA).
This script adds NAICS-level breakdown for specific distribution categories.
"""

import requests
import json
import os
from datetime import datetime, timedelta
from config import CENSUS_BASE_URL, DATA_DIR


def get_recent_months(count=24):
    """Generate list of YYYY-MM strings for recent months."""
    now = datetime.now()
    months = []
    for i in range(count):
        dt = now - timedelta(days=30 * i)
        months.append(dt.strftime("%Y-%m"))
    return months


def fetch_mwts_single(category, data_type, month):
    """Fetch single data point from MWTS."""
    url = f"{CENSUS_BASE_URL}/timeseries/eits/mwts"
    try:
        resp = requests.get(url, params={
            "get": "cell_value,time_slot_id",
            "category_code": category,
            "data_type_code": data_type,
            "seasonally_adj": "yes",
            "time": month,
        }, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if len(data) > 1:
                val = data[1][0]
                if val and val not in ("N/A", "-"):
                    return {"period": month, "value": float(val)}
    except:
        pass
    return None


def fetch_category_data(category, name, months=18):
    """Fetch sales and inventory data for a NAICS category."""
    print(f"  {name} ({category})...")
    month_list = get_recent_months(months)
    
    sales = []
    inventories = []
    
    for m in month_list:
        pt = fetch_mwts_single(category, "SM", m)
        if pt:
            sales.append(pt)
        
        pt = fetch_mwts_single(category, "IM", m)
        if pt:
            inventories.append(pt)
    
    sales.sort(key=lambda x: x["period"])
    inventories.sort(key=lambda x: x["period"])
    
    print(f"    Sales: {len(sales)}, Inventories: {len(inventories)}")
    return {"sales": sales, "inventories": inventories}


def main():
    print("Fetching Census Monthly Wholesale Trade (NAICS breakdown)...")
    
    # Key categories only - limit API calls
    categories = {
        "42": "Total Wholesale Trade",
        "4244": "Grocery & Related Products",
        "4243": "Lumber & Construction Materials",
    }
    
    data = {}
    for code, name in categories.items():
        data[code] = {
            "name": name,
            "data": fetch_category_data(code, name, months=18),
        }
    
    output = {
        "source": "US Census Bureau - Monthly Wholesale Trade Survey",
        "url": "https://census.gov/wholesale/",
        "note": "NAICS-level detail. See freight_macro.json for aggregate wholesale data from FRED.",
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "categories": data,
    }
    
    outpath = os.path.join(DATA_DIR, "census_wholesale.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
