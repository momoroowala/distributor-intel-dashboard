"""
Data validation checks for market intelligence dashboard.
Flags obvious errors, stale data, and anomalies.
"""

import json
import os
from datetime import datetime, timedelta
from config import DATA_DIR


def check_freshness(filepath, max_age_hours=48):
    """Check if data file is recent enough."""
    if not os.path.exists(filepath):
        return {"valid": False, "error": "File not found"}
    
    mtime = os.path.getmtime(filepath)
    age_hours = (datetime.now().timestamp() - mtime) / 3600
    
    if age_hours > max_age_hours:
        return {
            "valid": False,
            "error": f"Data is {age_hours:.1f}h old (max {max_age_hours}h)"
        }
    
    return {"valid": True, "age_hours": age_hours}


def validate_numeric_series(data, name, min_val=None, max_val=None, check_trend=False):
    """Validate a time series for anomalies."""
    issues = []
    
    if not data or len(data) == 0:
        return [f"{name}: No data points"]
    
    values = [float(d.get("value", 0)) for d in data if d.get("value") not in [".", None]]
    
    if not values:
        return [f"{name}: All values are null"]
    
    # Check for impossible values
    if min_val is not None:
        if any(v < min_val for v in values):
            issues.append(f"{name}: Values below {min_val}")
    
    if max_val is not None:
        if any(v > max_val for v in values):
            issues.append(f"{name}: Values above {max_val}")
    
    # Check for extreme volatility
    if len(values) > 2 and check_trend:
        changes = [(values[i] - values[i-1]) / values[i-1] * 100 
                   for i in range(1, len(values)) if values[i-1] != 0]
        
        if any(abs(c) > 50 for c in changes):
            issues.append(f"{name}: Extreme volatility detected (>50% change)")
    
    return issues


def validate_freight_data():
    """Validate freight cost data."""
    filepath = os.path.join(DATA_DIR, "freight_macro.json")
    
    freshness = check_freshness(filepath)
    if not freshness["valid"]:
        return [f"Freight data: {freshness['error']}"]
    
    with open(filepath) as f:
        data = json.load(f)
    
    issues = []
    
    # Check diesel/gas prices (should be $2-$6/gallon)
    if "macro_indicators" in data and "GASREGW" in data["macro_indicators"]:
        gas_data = data["macro_indicators"]["GASREGW"].get("data", [])
        gas_issues = validate_numeric_series(gas_data, "Gas prices", min_val=1.5, max_val=8.0)
        issues.extend(gas_issues)
    
    # Check PPI freight (should be 100-400 range)
    if "freight_indicators" in data and "WPUFD4111" in data["freight_indicators"]:
        ppi_data = data["freight_indicators"]["WPUFD4111"].get("data", [])
        ppi_issues = validate_numeric_series(ppi_data, "Freight PPI", min_val=100, max_val=500)
        issues.extend(ppi_issues)
    
    return issues


def validate_tariff_data():
    """Validate tariff/trade data."""
    filepath = os.path.join(DATA_DIR, "trade_tariffs.json")
    
    freshness = check_freshness(filepath, max_age_hours=72)  # Allow 3 days for tariff data
    if not freshness["valid"]:
        return [f"Tariff data: {freshness['error']}"]
    
    with open(filepath) as f:
        data = json.load(f)
    
    issues = []
    
    # Check for future-dated tariff changes
    tariff_changes = data.get("tariff_changes", [])
    today = datetime.now().date()
    
    for change in tariff_changes:
        change_date = datetime.fromisoformat(change["date"]).date()
        if change_date > today + timedelta(days=90):
            issues.append(f"Tariff change dated {change_date} is >90 days in future (verify source)")
    
    return issues


def validate_all():
    """Run all validation checks."""
    print("=" * 60)
    print("DATA VALIDATION REPORT")
    print("=" * 60)
    
    all_issues = []
    
    # Freight validation
    print("\nChecking freight data...")
    freight_issues = validate_freight_data()
    if freight_issues:
        all_issues.extend(freight_issues)
        for issue in freight_issues:
            print(f"  ⚠️  {issue}")
    else:
        print("  ✓ Freight data looks good")
    
    # Tariff validation
    print("\nChecking tariff data...")
    tariff_issues = validate_tariff_data()
    if tariff_issues:
        all_issues.extend(tariff_issues)
        for issue in tariff_issues:
            print(f"  ⚠️  {issue}")
    else:
        print("  ✓ Tariff data looks good")
    
    print("\n" + "=" * 60)
    if all_issues:
        print(f"VALIDATION FAILED: {len(all_issues)} issues found")
        return False
    else:
        print("VALIDATION PASSED: All data looks good")
        return True


if __name__ == "__main__":
    result = validate_all()
    exit(0 if result else 1)
