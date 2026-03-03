"""
Fetch trade/tariff data from US International Trade Commission.
Source: https://dataweb.usitc.gov

USITC DataWeb has limited API access. We use their public data downloads
and the HTS (Harmonized Tariff Schedule) API for tariff rates.
"""

import requests
import json
import os
from datetime import datetime
from config import DATA_DIR


# USITC HTS API for tariff schedules
HTS_API_BASE = "https://hts.usitc.gov/api"

# Key HTS chapters relevant to distribution
DISTRIBUTION_HTS_CHAPTERS = {
    "02": "Meat & edible meat offal",
    "03": "Fish & crustaceans",
    "04": "Dairy, eggs, honey",
    "07": "Edible vegetables",
    "08": "Edible fruit & nuts",
    "09": "Coffee, tea, spices",
    "15": "Fats & oils",
    "16": "Prepared meat & fish",
    "17": "Sugars & confectionery",
    "18": "Cocoa & cocoa preparations",
    "19": "Cereal preparations",
    "20": "Preserved vegetables & fruit",
    "21": "Miscellaneous edible preparations",
    "22": "Beverages",
    "34": "Soap, cleaning preparations",
    "39": "Plastics",
    "44": "Wood & wood articles",
    "48": "Paper & paperboard",
    "73": "Iron & steel articles",
    "84": "Machinery & mechanical appliances",
    "85": "Electrical machinery",
}


def fetch_hts_chapter(chapter):
    """Fetch HTS tariff data for a chapter."""
    url = f"{HTS_API_BASE}/search"
    
    try:
        # Search by chapter heading
        params = {"query": chapter}
        resp = requests.get(url, params=params, timeout=30)
        
        if resp.status_code == 200:
            data = resp.json()
            return data
        else:
            return None
    except Exception as e:
        print(f"  Error fetching HTS chapter {chapter}: {e}")
        return None


def fetch_recent_tariff_changes():
    """
    Scrape/check for recent tariff modifications.
    Uses the USITC modifications page.
    """
    # USITC publishes tariff modifications — we'll track key ones
    # For now, we'll build a static tracker that gets updated
    
    known_changes = [
        {
            "date": "2026-02-04",
            "description": "Additional 10% tariff on Chinese imports (Executive Order)",
            "affected_chapters": ["39", "73", "84", "85"],
            "impact": "high",
            "source": "Federal Register",
        },
        {
            "date": "2026-03-04",
            "description": "25% tariff on Canadian and Mexican imports (scheduled)",
            "affected_chapters": ["02", "03", "04", "07", "08", "44"],
            "impact": "high",
            "source": "Executive Order",
        },
    ]
    
    return known_changes


def fetch_trade_data_census(hs_chapter="02", flow="imports"):
    """
    Use Census Bureau International Trade API for actual trade volumes.
    More reliable than USITC DataWeb for programmatic access.
    """
    from config import CENSUS_BASE_URL
    
    endpoint = f"{CENSUS_BASE_URL}/timeseries/intltrade/{flow}/hs"
    
    params = {
        "get": "GEN_VAL_MO,CON_VAL_MO,I_COMMODITY",
        "COMM_LVL": "HS2",
        "I_COMMODITY": hs_chapter,
        "time": "from+2024-01",
    }
    
    try:
        resp = requests.get(endpoint, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            if len(data) > 1:
                headers = data[0]
                records = []
                for row in data[1:]:
                    record = dict(zip(headers, row))
                    records.append(record)
                return records
        return []
    except Exception as e:
        print(f"  Error fetching trade data for HS {hs_chapter}: {e}")
        return []


def main():
    print("Fetching USITC / Trade data...")
    
    # 1. Recent tariff changes
    tariff_changes = fetch_recent_tariff_changes()
    print(f"Tracked tariff changes: {len(tariff_changes)}")
    
    # 2. Import volumes for key distribution commodities
    print("\nFetching import volumes from Census...")
    import_data = {}
    key_chapters = ["02", "03", "04", "07", "08", "09", "20", "22", "48", "39"]
    
    for chapter in key_chapters:
        name = DISTRIBUTION_HTS_CHAPTERS.get(chapter, f"Chapter {chapter}")
        print(f"  {name} (HS {chapter})...")
        records = fetch_trade_data_census(hs_chapter=chapter)
        import_data[chapter] = {
            "name": name,
            "records": records,
            "record_count": len(records),
        }
    
    output = {
        "source": "USITC + Census International Trade",
        "urls": [
            "https://dataweb.usitc.gov",
            "https://api.census.gov/data/timeseries/intltrade/",
        ],
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "tariff_changes": tariff_changes,
        "import_volumes": import_data,
        "hts_chapters_tracked": DISTRIBUTION_HTS_CHAPTERS,
    }
    
    outpath = os.path.join(DATA_DIR, "trade_tariffs.json")
    with open(outpath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved to {outpath}")
    return output


if __name__ == "__main__":
    main()
