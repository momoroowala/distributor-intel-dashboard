"""
Fetch Quarterly Census of Employment & Wages (QCEW) data from BLS.
Source: https://data.bls.gov/cew/

Also fetches Producer Price Index (PPI) for wholesale trade.
Provides: employment trends, wage data, and wholesale price changes.
"""

import requests
import json
import os
from datetime import datetime
from config import BLS_API_KEY, BLS_BASE_URL, DATA_DIR


# QCEW series for wholesale trade employment
# Format: ENU[state_fips][area_type][size][ownership][industry]
# We'll use the BLS QCEW flat files API instead (more reliable)
QCEW_BASE = "https://data.bls.gov/cew/data/api"

# PPI series for wholesale trade
PPI_SERIES = {
    "WPU00000000": "All commodities PPI",
    "WPU01": "Farm products PPI",
    "WPU02": "Processed foods & feeds PPI",
    "WPU03": "Textile products PPI",
    "WPU06": "Chemicals & allied products PPI",
    "WPU07": "Rubber & plastic products PPI",
    "WPU08": "Lumber & wood products PPI",
    "WPU09": "Pulp, paper & allied products PPI",
    "WPU10": "Metals & metal products PPI",
}

# CES (Current Employment Statistics) for wholesale employment
CES_SERIES = {
    "CES4142000001": "Wholesale trade employment (thousands)",
    "CES4142000003": "Wholesale trade avg weekly hours",
    "CES4142000008": "Wholesale trade avg hourly earnings",
    "CES4142000011": "Wholesale trade avg weekly earnings",
}


def fetch_ppi_data():
    """Fetch Producer Price Index for wholesale sectors."""
    series_ids = list(PPI_SERIES.keys())
    
    payload = {
        "seriesid": series_ids,
        "startyear": "2022",
        "endyear": "2026",
        "registrationkey": BLS_API_KEY,
        "calculations": True,
    }
    
    print("Fetching PPI data for wholesale trade...")
    
    try:
        resp = requests.post(BLS_BASE_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "REQUEST_SUCCEEDED":
            print(f"  BLS API error: {data.get('message', '')}")
            return {}
        
        results = {}
        for series in data.get("Results", {}).get("series", []):
            sid = series["seriesID"]
            name = PPI_SERIES.get(sid, sid)
            
            points = []
            for item in series.get("data", []):
                period = item["period"]
                if period.startswith("M"):
                    month = int(period[1:])
                    year = int(item["year"])
                    
                    pct_12m = None
                    calcs = item.get("calculations", {})
                    pct = calcs.get("pct_changes", {}).get("12")
                    if pct is not None:
                        pct_12m = float(pct)
                    
                    points.append({
                        "period": f"{year}-{month:02d}",
                        "value": float(item["value"]),
                        "pct_change_12m": pct_12m,
                    })
            
            points.sort(key=lambda x: x["period"])
            results[sid] = {"name": name, "data": points}
            print(f"  {name}: {len(points)} points")
        
        return results
        
    except Exception as e:
        print(f"  Error: {e}")
        return {}


def fetch_employment_data():
    """Fetch wholesale trade employment from CES."""
    series_ids = list(CES_SERIES.keys())
    
    payload = {
        "seriesid": series_ids,
        "startyear": "2022",
        "endyear": "2026",
        "registrationkey": BLS_API_KEY,
        "calculations": True,
    }
    
    print("Fetching wholesale employment data...")
    
    try:
        resp = requests.post(BLS_BASE_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "REQUEST_SUCCEEDED":
            print(f"  BLS API error: {data.get('message', '')}")
            return {}
        
        results = {}
        for series in data.get("Results", {}).get("series", []):
            sid = series["seriesID"]
            name = CES_SERIES.get(sid, sid)
            
            points = []
            for item in series.get("data", []):
                period = item["period"]
                if period.startswith("M"):
                    month = int(period[1:])
                    year = int(item["year"])
                    
                    net_change = None
                    calcs = item.get("calculations", {})
                    nc = calcs.get("net_changes", {}).get("12")
                    if nc is not None:
                        net_change = float(nc)
                    
                    points.append({
                        "period": f"{year}-{month:02d}",
                        "value": float(item["value"]),
                        "net_change_12m": net_change,
                    })
            
            points.sort(key=lambda x: x["period"])
            results[sid] = {"name": name, "data": points}
            print(f"  {name}: {len(points)} points")
        
        return results
        
    except Exception as e:
        print(f"  Error: {e}")
        return {}


def fetch_qcew_summary(year=2024, qtr=3):
    """
    Fetch QCEW data via BLS flat files API.
    Gives establishment counts, employment, and wages by area.
    """
    # QCEW API endpoint for CSV data
    url = f"{QCEW_BASE}/{year}/{qtr}/industry/4242.csv"
    
    print(f"Fetching QCEW data Q{qtr} {year}...")
    
    try:
        resp = requests.get(url, timeout=30)
        if resp.status_code == 200:
            import csv
            import io
            reader = csv.DictReader(io.StringIO(resp.text))
            rows = list(reader)
            
            # Filter to state-level data
            state_data = [r for r in rows if r.get("area_fips", "").endswith("000") and r.get("own_code") == "5"]
            print(f"  Got {len(state_data)} state-level records")
            
            results = []
            for r in state_data:
                results.append({
                    "area": r.get("area_title", ""),
                    "establishments": int(r.get("qtrly_estabs", 0) or 0),
                    "avg_employment": int(r.get("month3_emplvl", 0) or 0),
                    "total_wages": int(r.get("total_qtrly_wages", 0) or 0),
                    "avg_weekly_wage": int(r.get("avg_wkly_wage", 0) or 0),
                })
            
            results.sort(key=lambda x: x["avg_employment"], reverse=True)
            return results
        else:
            print(f"  QCEW API returned {resp.status_code}")
            return []
    except Exception as e:
        print(f"  Error: {e}")
        return []


def main():
    ppi_data = fetch_ppi_data()
    employment_data = fetch_employment_data()
    qcew_data = fetch_qcew_summary()
    
    output = {
        "source": "BLS - PPI, CES, QCEW",
        "url": "https://data.bls.gov/cew/",
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "ppi_wholesale": ppi_data,
        "employment": employment_data,
        "qcew_wholesale": {
            "period": "Q3 2024",
            "top_states": qcew_data[:20] if qcew_data else [],
        },
    }
    
    outpath = os.path.join(DATA_DIR, "bls_employment.json")
    with open(outpath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
