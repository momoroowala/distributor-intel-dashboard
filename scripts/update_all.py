"""
Master script to fetch all data sources for the Market Intel Dashboard.
Run this to update all JSON data files.
"""

import os
import sys
import json
from datetime import datetime

# Add script dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATA_DIR


def run_all():
    print("=" * 60)
    print("MARKET INTEL DASHBOARD - DATA UPDATE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    results = {}
    
    # 1. Census Wholesale Trade
    print("\n[1/5] Census Wholesale Trade Survey...")
    try:
        from fetch_census_wholesale import main as fetch_wholesale
        fetch_wholesale()
        results["census_wholesale"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["census_wholesale"] = f"FAILED: {e}"
    
    # 2. Food Prices (BLS CPI + USDA ERS)
    print("\n[2/5] Food Price Outlook...")
    try:
        from fetch_food_prices import main as fetch_food
        fetch_food()
        results["food_prices"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["food_prices"] = f"FAILED: {e}"
    
    # 3. County Business Patterns
    print("\n[3/5] County Business Patterns...")
    try:
        from fetch_cbp import main as fetch_cbp
        fetch_cbp()
        results["cbp"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["cbp"] = f"FAILED: {e}"
    
    # 4. Trade & Tariffs (USITC + Census International Trade)
    print("\n[4/5] Trade & Tariff Data...")
    try:
        from fetch_usitc import main as fetch_usitc
        fetch_usitc()
        results["trade_tariffs"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["trade_tariffs"] = f"FAILED: {e}"
    
    # 5. BLS Employment + PPI
    print("\n[5/5] BLS Employment & PPI...")
    try:
        from fetch_bls_employment import main as fetch_bls
        fetch_bls()
        results["bls_employment"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["bls_employment"] = f"FAILED: {e}"
    
    # 6. Freight & Macro (FRED + FHWA)
    print("\n[6/6] Freight & Macro Indicators...")
    try:
        from fetch_freight import main as fetch_freight
        fetch_freight()
        results["freight_macro"] = "OK"
    except Exception as e:
        print(f"  FAILED: {e}")
        results["freight_macro"] = f"FAILED: {e}"
    
    # Write manifest
    manifest = {
        "last_update": datetime.utcnow().isoformat() + "Z",
        "results": results,
        "data_files": os.listdir(DATA_DIR),
    }
    
    manifest_path = os.path.join(DATA_DIR, "_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print("\n" + "=" * 60)
    print("UPDATE COMPLETE")
    print("=" * 60)
    for source, status in results.items():
        icon = "[OK]" if status == "OK" else "[FAIL]"
        print(f"  {icon} {source}: {status}")
    print(f"\nData directory: {DATA_DIR}")
    
    return results


if __name__ == "__main__":
    run_all()
