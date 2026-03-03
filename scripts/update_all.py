"""Run all data fetchers."""
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

scripts = [
    "scripts/fetch_bls.py",
    "scripts/fetch_fred.py",
    "scripts/fetch_census.py",
    "scripts/fetch_trends.py",
]

for script in scripts:
    print(f"\n{'='*60}")
    print(f"Running {script}...")
    print('='*60)
    subprocess.run([sys.executable, script])

print("\n\nAll data updated!")
