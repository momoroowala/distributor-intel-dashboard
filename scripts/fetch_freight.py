"""
Fetch Freight Analysis Framework (FAF) data from FHWA.
Source: https://ops.fhwa.dot.gov/freight/freight_analysis/faf/

FAF5 provides commodity flow data by origin/destination regions.
No API, bulk CSV downloads only. We'll download and process.
Also supplements with FRED freight/transportation indicators.
"""

import requests
import json
import os
from datetime import datetime
from config import FRED_API_KEY, DATA_DIR


# FRED series related to freight and transportation costs
FRED_FREIGHT_SERIES = {
    "WPUFD4111": "PPI: Long-distance general freight trucking, truckload",
    "WPUFD4112": "PPI: Long-distance general freight trucking, LTL",
    "RAILFRTCARLOADSD11": "Rail freight carloads",
    "PCUATRANSATRANS": "PPI: Air transportation",
    "DFXARC1M027SBEA": "Real exports of goods: transport equipment",
}

# Additional FRED macro indicators useful for distribution
FRED_MACRO_SERIES = {
    "WHLSLRSMSA": "Wholesale trade sales (monthly)",
    "WHLSLRIMSA": "Wholesale trade inventories (monthly)",
    "ISRATIO": "Total business inventories/sales ratio",
    "RETAILSMNSA": "Retail sales (monthly)",
    "DEXCHUS": "China/US exchange rate",
    "DEXMXUS": "Mexico/US exchange rate",
    "DEXCAUS": "Canada/US exchange rate",
    "DCOILWTICO": "Crude oil WTI price",
    "GASREGW": "Regular gas price (weekly avg)",
}


def fetch_fred_series(series_dict, label=""):
    """Fetch multiple series from FRED API."""
    results = {}
    
    for series_id, name in series_dict.items():
        url = f"https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": FRED_API_KEY,
            "file_type": "json",
            "observation_start": "2022-01-01",
            "sort_order": "desc",
            "limit": 60,  # ~5 years monthly or ~1 year weekly
        }
        
        try:
            resp = requests.get(url, params=params, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            
            observations = data.get("observations", [])
            points = []
            for obs in observations:
                val = obs.get("value", ".")
                if val != ".":
                    points.append({
                        "date": obs["date"],
                        "value": float(val),
                    })
            
            points.sort(key=lambda x: x["date"])
            results[series_id] = {
                "name": name,
                "data": points,
                "latest": points[-1] if points else None,
            }
            print(f"  {name}: {len(points)} points")
            
        except Exception as e:
            print(f"  Error fetching {series_id}: {e}")
            results[series_id] = {"name": name, "data": [], "error": str(e)}
    
    return results


def fetch_faf5_summary():
    """
    FAF5 data is only available as bulk downloads.
    We'll download the summary CSV and parse key metrics.
    """
    # FAF5 data download page
    faf_url = "https://ops.fhwa.dot.gov/freight/freight_analysis/faf/fafdata/faf5_csv.zip"
    
    print("FAF5 bulk data requires manual download (large ZIP).")
    print("Using FRED freight indicators as proxy for real-time data.")
    
    # Return metadata about what FAF5 would provide
    return {
        "note": "FAF5 bulk data available at ops.fhwa.dot.gov. Using FRED freight indicators for dashboard.",
        "faf5_download_url": faf_url,
        "faf5_provides": [
            "Commodity flows by origin/destination (tons & value)",
            "Mode of transportation (truck, rail, water, air, pipeline)",
            "Domestic vs international flows",
            "Forecasts to 2050",
        ],
        "regions": 132,
        "commodities": 43,
    }


def main():
    print("Fetching freight & transportation data...\n")
    
    # 1. FRED freight indicators
    print("--- Freight & Transportation Costs ---")
    freight_data = fetch_fred_series(FRED_FREIGHT_SERIES, "freight")
    
    # 2. FRED macro indicators for distribution
    print("\n--- Macro Distribution Indicators ---")
    macro_data = fetch_fred_series(FRED_MACRO_SERIES, "macro")
    
    # 3. FAF5 summary
    print("\n--- FAF5 Summary ---")
    faf_summary = fetch_faf5_summary()
    
    output = {
        "source": "FRED + FHWA Freight Analysis Framework",
        "urls": [
            "https://ops.fhwa.dot.gov/freight/freight_analysis/faf/",
            "https://api.stlouisfed.org/fred/",
        ],
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "freight_indicators": freight_data,
        "macro_indicators": macro_data,
        "faf5": faf_summary,
    }
    
    outpath = os.path.join(DATA_DIR, "freight_macro.json")
    with open(outpath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
