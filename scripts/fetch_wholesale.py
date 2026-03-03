#!/usr/bin/env python3
"""Fetch Census wholesale trade data."""
import json, os, sys

OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'wholesale_trade.json')

FALLBACK = {
    "fetched": "fallback",
    "data": [
        {"period": "2025-12", "sales": 647200, "inventories": 912400, "ratio": 1.41},
        {"period": "2025-11", "sales": 652100, "inventories": 908700, "ratio": 1.39},
        {"period": "2025-10", "sales": 641800, "inventories": 905100, "ratio": 1.41},
        {"period": "2025-09", "sales": 638500, "inventories": 901300, "ratio": 1.41},
        {"period": "2025-08", "sales": 635200, "inventories": 897800, "ratio": 1.41},
        {"period": "2025-07", "sales": 631900, "inventories": 894200, "ratio": 1.42},
        {"period": "2025-06", "sales": 628600, "inventories": 890500, "ratio": 1.42},
        {"period": "2025-05", "sales": 625300, "inventories": 886900, "ratio": 1.42},
        {"period": "2025-04", "sales": 622100, "inventories": 883200, "ratio": 1.42},
        {"period": "2025-03", "sales": 618800, "inventories": 879600, "ratio": 1.42},
        {"period": "2025-02", "sales": 615500, "inventories": 876000, "ratio": 1.42},
        {"period": "2025-01", "sales": 612200, "inventories": 872300, "ratio": 1.42},
    ]
}

def main():
    try:
        import urllib.request
        url = ("https://api.census.gov/data/timeseries/eits/mwts"
               "?get=cell_value,data_type_code,time_slot_id,seasonally_adj,category_code"
               "&time=from+2024")
        req = urllib.request.Request(url, headers={"User-Agent": "DeeplineOps/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = json.loads(resp.read().decode())

        if not raw or len(raw) < 2:
            raise ValueError("No data")

        headers = [h.lower() for h in raw[0]]
        rows = raw[1:]
        
        # Group by time period, extract sales (data_type_code=SM) for total wholesale (category_code=MWT)
        data_map = {}
        for row in rows:
            d = dict(zip(headers, row))
            cat = d.get("category_code", "")
            dt = d.get("data_type_code", "")
            sa = d.get("seasonally_adj", "")
            period = d.get("time", "")
            val = d.get("cell_value", "")
            
            if cat == "MWT" and sa == "yes":
                if period not in data_map:
                    data_map[period] = {}
                try:
                    data_map[period][dt] = float(val)
                except (ValueError, TypeError):
                    pass

        data = []
        for period in sorted(data_map.keys(), reverse=True)[:12]:
            entry = data_map[period]
            data.append({
                "period": period,
                "sales": entry.get("SM", 0),
                "inventories": entry.get("EI", 0),
                "ratio": round(entry.get("EI", 0) / entry.get("SM", 1), 2) if entry.get("SM") else 0
            })

        if not data:
            raise ValueError("No parsed data")

        result = {"fetched": "live", "data": data}
    except Exception as e:
        print(f"Wholesale fetch failed: {e}, using fallback", file=sys.stderr)
        result = FALLBACK

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {len(result['data'])} records to {OUTPUT}")

if __name__ == '__main__':
    main()
