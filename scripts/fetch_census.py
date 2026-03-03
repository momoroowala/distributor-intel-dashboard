"""Fetch US Census Bureau import/export data for key distribution categories."""
import json
import urllib.request
import urllib.error
from datetime import datetime

BASE = "https://api.census.gov/data/timeseries/intltrade/imports/hs"

# Key HS codes for distribution categories
CATEGORIES = {
    "Food & Beverage": ["02", "03", "04", "08", "09", "16", "17", "18", "19", "20", "21", "22"],
    "Industrial Supplies": ["28", "29", "38", "39", "40"],
    "Building Materials": ["25", "68", "69", "70", "72", "73"],
}

def fetch_imports_by_year(hs2, year, month=None):
    """Fetch import value for a 2-digit HS code."""
    params = f"get=GEN_VAL_MO&COMM_LVL=HS2&I_COMMODITY={hs2}&time={year}"
    if month:
        params = f"get=GEN_VAL_MO&COMM_LVL=HS2&I_COMMODITY={hs2}&time={year}-{month:02d}"
    url = f"{BASE}?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data
    except Exception as e:
        print(f"  Error fetching HS {hs2} for {year}: {e}")
        return None

def main():
    print("Fetching Census import data...")
    results = {}
    current_year = datetime.now().year

    for category, codes in CATEGORIES.items():
        print(f"\n--- {category} ---")
        cat_data = {"monthly": [], "annual": []}

        # Get annual totals for last 5 years
        for year in range(current_year - 5, current_year + 1):
            year_total = 0
            for hs in codes:
                data = fetch_imports_by_year(hs, year)
                if data and len(data) > 1:
                    for row in data[1:]:
                        try:
                            year_total += int(row[0]) if row[0] else 0
                        except (ValueError, IndexError):
                            pass
            if year_total > 0:
                cat_data["annual"].append({"year": year, "value": year_total})
                print(f"  {year}: ${year_total:,.0f}")

        # Get monthly data for current and previous year
        for year in [current_year - 1, current_year]:
            for month in range(1, 13):
                month_total = 0
                fetched = False
                for hs in codes[:3]:  # Limit to top 3 codes to avoid rate limits
                    data = fetch_imports_by_year(hs, year, month)
                    if data and len(data) > 1:
                        fetched = True
                        for row in data[1:]:
                            try:
                                month_total += int(row[0]) if row[0] else 0
                            except (ValueError, IndexError):
                                pass
                if fetched and month_total > 0:
                    cat_data["monthly"].append({
                        "year": year,
                        "month": month,
                        "value": month_total
                    })

        results[category] = cat_data

    output = {
        "source": "US Census Bureau",
        "updated": datetime.now().isoformat(),
        "description": "Import values by distribution category (USD)",
        "data": results
    }

    out_path = "src/data/census_imports.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nSaved to {out_path}")

if __name__ == "__main__":
    main()
