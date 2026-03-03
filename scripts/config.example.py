"""
Market Intel Dashboard — API Configuration
Copy this to config.py and fill in your keys.
"""

FRED_API_KEY = "YOUR_FRED_API_KEY"
BLS_API_KEY = "YOUR_BLS_API_KEY"

# Census Bureau — no key needed for basic access
CENSUS_BASE_URL = "https://api.census.gov/data"

# FRED
FRED_BASE_URL = "https://api.stlouisfed.org/fred"

# BLS
BLS_BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Output directory for generated JSON
import os
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
