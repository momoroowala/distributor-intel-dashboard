"""
Fetch County Business Patterns data from Census Bureau.
Source: https://census.gov/programs-surveys/cbp.html
API: https://api.census.gov/data/timeseries/cbp

Provides: establishment counts, employment, and payroll
by industry (NAICS) and geography. Great for regional demand signals.
"""

import requests
import json
import os
from datetime import datetime
from config import CENSUS_BASE_URL, DATA_DIR


# Key NAICS codes for distribution
DISTRIBUTION_NAICS = {
    "423": "Merchant Wholesalers, Durable Goods",
    "424": "Merchant Wholesalers, Nondurable Goods",
    "4244": "Grocery & Related Product Wholesalers",
    "4241": "Paper & Paper Product Wholesalers",
    "4243": "Lumber & Other Construction Materials",
    "4246": "Chemical & Allied Products",
    "4248": "Beer, Wine & Distilled Alcoholic Beverage",
    "4249": "Miscellaneous Nondurable Goods",
    "493": "Warehousing & Storage",
}

# Top states for distribution
KEY_STATES = {
    "06": "California",
    "48": "Texas",
    "12": "Florida",
    "36": "New York",
    "17": "Illinois",
    "42": "Pennsylvania",
    "39": "Ohio",
    "34": "New Jersey",
    "13": "Georgia",
    "37": "North Carolina",
}


def fetch_cbp_national(year=2022, naics_code="423"):
    """
    Fetch national-level CBP data for a NAICS code.
    Note: CBP data has a 2-year lag. Latest is typically 2022.
    """
    url = f"{CENSUS_BASE_URL}/{year}/cbp"
    
    params = {
        "get": "ESTAB,EMP,PAYANN,NAICS2017",
        "for": "us:*",
        "NAICS2017": naics_code,
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if len(data) > 1:
            headers = data[0]
            row = dict(zip(headers, data[1]))
            return {
                "establishments": int(row.get("ESTAB", 0)),
                "employment": int(row.get("EMP", 0)),
                "annual_payroll_1000s": int(row.get("PAYANN", 0)),
            }
    except Exception as e:
        print(f"  Error fetching CBP for {naics_code}: {e}")
    
    return None


def fetch_cbp_by_state(year=2022, naics_code="423"):
    """Fetch state-level CBP data."""
    url = f"{CENSUS_BASE_URL}/{year}/cbp"
    
    params = {
        "get": "ESTAB,EMP,PAYANN,NAME",
        "for": "state:*",
        "NAICS2017": naics_code,
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if len(data) > 1:
            headers = data[0]
            states = []
            for row in data[1:]:
                record = dict(zip(headers, row))
                states.append({
                    "state_fips": record.get("state", ""),
                    "state_name": record.get("NAME", ""),
                    "establishments": int(record.get("ESTAB", 0)),
                    "employment": int(record.get("EMP", 0)),
                    "annual_payroll_1000s": int(record.get("PAYANN", 0)),
                })
            states.sort(key=lambda x: x["employment"], reverse=True)
            return states
    except Exception as e:
        print(f"  Error fetching state CBP for {naics_code}: {e}")
    
    return []


def fetch_cbp_trends(naics_code="423"):
    """Fetch multi-year CBP data to show trends."""
    years = [2018, 2019, 2020, 2021, 2022]
    trend = []
    
    for year in years:
        print(f"  Fetching CBP {year} for NAICS {naics_code}...")
        result = fetch_cbp_national(year=year, naics_code=naics_code)
        if result:
            result["year"] = year
            trend.append(result)
    
    return trend


def main():
    print("Fetching County Business Patterns data...")
    
    all_data = {}
    for code, name in DISTRIBUTION_NAICS.items():
        print(f"\n{name} ({code}):")
        
        # National totals
        national = fetch_cbp_national(naics_code=code)
        print(f"  National: {national}")
        
        # State breakdown
        states = fetch_cbp_by_state(naics_code=code)
        print(f"  States: {len(states)} states")
        
        # Multi-year trend (only for top-level codes to save API calls)
        trend = []
        if len(code) <= 3:
            trend = fetch_cbp_trends(naics_code=code)
            print(f"  Trend: {len(trend)} years")
        
        all_data[code] = {
            "name": name,
            "national": national,
            "top_states": states[:15] if states else [],
            "trend": trend,
        }
    
    output = {
        "source": "US Census Bureau - County Business Patterns",
        "url": "https://census.gov/programs-surveys/cbp.html",
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "note": "CBP data has ~2 year lag. Latest available is typically 2022.",
        "industries": all_data,
    }
    
    outpath = os.path.join(DATA_DIR, "county_business_patterns.json")
    with open(outpath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
