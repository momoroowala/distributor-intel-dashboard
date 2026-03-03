#!/usr/bin/env python3
"""Fetch EIA diesel prices by region."""
import json, os, sys

OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'eia_diesel.json')

FALLBACK = {
    "fetched": "fallback",
    "prices": [
        {"period": "2026-02-28", "region": "US", "value": 3.712},
        {"period": "2026-02-28", "region": "East Coast", "value": 3.845},
        {"period": "2026-02-28", "region": "Midwest", "value": 3.621},
        {"period": "2026-02-28", "region": "Gulf Coast", "value": 3.498},
        {"period": "2026-02-28", "region": "Rocky Mountain", "value": 3.789},
        {"period": "2026-02-28", "region": "West Coast", "value": 4.312},
        {"period": "2026-02-21", "region": "US", "value": 3.698},
        {"period": "2026-02-21", "region": "East Coast", "value": 3.831},
        {"period": "2026-02-21", "region": "Midwest", "value": 3.609},
        {"period": "2026-02-21", "region": "Gulf Coast", "value": 3.485},
        {"period": "2026-02-21", "region": "Rocky Mountain", "value": 3.775},
        {"period": "2026-02-21", "region": "West Coast", "value": 4.298},
        {"period": "2026-02-14", "region": "US", "value": 3.685},
        {"period": "2026-02-14", "region": "East Coast", "value": 3.818},
        {"period": "2026-02-14", "region": "Midwest", "value": 3.596},
        {"period": "2026-02-14", "region": "Gulf Coast", "value": 3.472},
        {"period": "2026-02-14", "region": "Rocky Mountain", "value": 3.762},
        {"period": "2026-02-14", "region": "West Coast", "value": 4.285},
        {"period": "2026-02-07", "region": "US", "value": 3.671},
        {"period": "2026-02-07", "region": "East Coast", "value": 3.804},
        {"period": "2026-02-07", "region": "Midwest", "value": 3.583},
        {"period": "2026-02-07", "region": "Gulf Coast", "value": 3.459},
        {"period": "2026-02-07", "region": "Rocky Mountain", "value": 3.748},
        {"period": "2026-02-07", "region": "West Coast", "value": 4.271},
    ]
}

def main():
    try:
        import urllib.request
        url = ("https://api.eia.gov/v2/petroleum/pri/gnd/data/"
               "?api_key=DEMO_KEY&frequency=weekly&data[0]=value"
               "&facets[product][]=EPD2D&sort[0][column]=period"
               "&sort[0][direction]=desc&length=52")
        req = urllib.request.Request(url, headers={"User-Agent": "DeeplineOps/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read().decode())

        rows = raw.get("response", {}).get("data", [])
        if not rows:
            raise ValueError("No data returned")

        prices = []
        for r in rows:
            prices.append({
                "period": r.get("period", ""),
                "region": r.get("area-name", r.get("duoarea", "")),
                "value": r.get("value")
            })

        result = {"fetched": "live", "prices": prices}
    except Exception as e:
        print(f"EIA fetch failed: {e}, using fallback", file=sys.stderr)
        result = FALLBACK

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {len(result['prices'])} records to {OUTPUT}")

if __name__ == '__main__':
    main()
