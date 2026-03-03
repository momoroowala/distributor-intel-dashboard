"""
Fetch Food Price Outlook data from USDA ERS.
Source: https://ers.usda.gov/data-products/food-price-outlook

No API available. Downloads the Excel/CSV data files directly.
Provides CPI food price forecasts and historical data.
"""

import requests
import json
import os
import csv
import io
from datetime import datetime
from config import DATA_DIR


# USDA ERS publishes food price data as downloadable files
# These URLs may change; we'll try multiple approaches
FOOD_CPI_URL = "https://www.ers.usda.gov/webdocs/DataFiles/50673/CPI_average_food_prices.xlsx"
FOOD_FORECAST_URL = "https://www.ers.usda.gov/webdocs/DataFiles/50673/all_food_cpi.csv"

# Alternative: use BLS CPI data for food categories directly
BLS_FOOD_SERIES = {
    "CUSR0000SAF": "Food at home",
    "CUSR0000SAF11": "Cereals & bakery",
    "CUSR0000SAF112": "Meats, poultry, fish, eggs",
    "CUSR0000SAF113": "Dairy & related",
    "CUSR0000SAF114": "Fruits & vegetables",
    "CUSR0000SAF115": "Nonalcoholic beverages",
    "CUSR0000SAF116": "Other food at home",
    "CUSR0000SEFV": "Food away from home",
}


def fetch_food_prices_via_bls(api_key):
    """
    Fetch food CPI data via BLS API (more reliable than scraping USDA).
    Uses CPI-U (Consumer Price Index for All Urban Consumers) food series.
    """
    from config import BLS_API_KEY, BLS_BASE_URL
    
    series_ids = list(BLS_FOOD_SERIES.keys())
    
    payload = {
        "seriesid": series_ids,
        "startyear": "2022",
        "endyear": "2026",
        "registrationkey": BLS_API_KEY,
        "calculations": True,
    }
    
    print("Fetching food price CPI data from BLS...")
    
    try:
        resp = requests.post(BLS_BASE_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "REQUEST_SUCCEEDED":
            print(f"  BLS API error: {data.get('message', 'Unknown error')}")
            return {}
        
        results = {}
        for series in data.get("Results", {}).get("series", []):
            series_id = series["seriesID"]
            name = BLS_FOOD_SERIES.get(series_id, series_id)
            
            points = []
            for item in series.get("data", []):
                period = item["period"]
                if period.startswith("M"):
                    month = int(period[1:])
                    year = int(item["year"])
                    raw_val = item.get("value", "")
                    if raw_val in ("-", "", "N/A"):
                        continue
                    try:
                        val = float(raw_val)
                    except ValueError:
                        continue
                    
                    points.append({
                        "year": year,
                        "month": month,
                        "period": f"{year}-{month:02d}",
                        "value": val,
                        "pct_change_12m": None,
                    })
                    
                    # Extract 12-month percent change if available
                    calcs = item.get("calculations", {})
                    pct = calcs.get("pct_changes", {}).get("12", None)
                    if pct is not None:
                        points[-1]["pct_change_12m"] = float(pct)
            
            points.sort(key=lambda x: x["period"])
            results[series_id] = {
                "name": name,
                "data": points,
            }
            print(f"  {name}: {len(points)} data points")
        
        return results
        
    except Exception as e:
        print(f"  Error: {e}")
        return {}


def fetch_usda_ers_download():
    """
    Try to download the USDA ERS food price outlook Excel file.
    Falls back gracefully if the URL changes.
    """
    print("Attempting USDA ERS food price download...")
    
    try:
        resp = requests.get(FOOD_FORECAST_URL, timeout=30)
        if resp.status_code == 200:
            reader = csv.DictReader(io.StringIO(resp.text))
            rows = list(reader)
            print(f"  Got {len(rows)} rows from USDA ERS")
            return rows
        else:
            print(f"  USDA ERS download returned {resp.status_code}, using BLS fallback")
            return None
    except Exception as e:
        print(f"  USDA ERS download failed: {e}, using BLS fallback")
        return None


def main():
    # Primary: BLS food CPI data (reliable API)
    bls_data = fetch_food_prices_via_bls(None)
    
    # Secondary: try USDA ERS download
    usda_data = fetch_usda_ers_download()
    
    output = {
        "source": "BLS CPI Food + USDA ERS Food Price Outlook",
        "urls": [
            "https://ers.usda.gov/data-products/food-price-outlook",
            "https://api.bls.gov/publicAPI/v2/timeseries/data/",
        ],
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "bls_food_cpi": bls_data,
        "usda_ers_available": usda_data is not None,
    }
    
    outpath = os.path.join(DATA_DIR, "food_prices.json")
    with open(outpath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
