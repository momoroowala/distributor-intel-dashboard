#!/usr/bin/env python3
"""Fetch NOAA severe weather alerts."""
import json, os, sys

OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'weather_alerts.json')

FALLBACK = {
    "fetched": "fallback",
    "alerts": [
        {"event": "Winter Storm Warning", "severity": "Severe", "headline": "Winter Storm Warning for Northeast US", "areaDesc": "New York, CT, NJ, PA", "onset": "2026-03-02T18:00:00", "expires": "2026-03-04T06:00:00"},
        {"event": "Flood Warning", "severity": "Severe", "headline": "Flood Warning along Mississippi River", "areaDesc": "Southern IL, MO, AR", "onset": "2026-03-01T12:00:00", "expires": "2026-03-05T12:00:00"},
        {"event": "High Wind Warning", "severity": "Extreme", "headline": "Extreme winds expected across Great Plains", "areaDesc": "KS, OK, NE", "onset": "2026-03-03T06:00:00", "expires": "2026-03-03T23:00:00"},
    ]
}

def main():
    try:
        import urllib.request
        url = "https://api.weather.gov/alerts/active?status=actual&severity=Extreme,Severe"
        req = urllib.request.Request(url, headers={"User-Agent": "DeeplineOps/1.0", "Accept": "application/geo+json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read().decode())

        features = raw.get("features", [])
        alerts = []
        for f in features[:30]:
            p = f.get("properties", {})
            alerts.append({
                "event": p.get("event", ""),
                "severity": p.get("severity", ""),
                "headline": (p.get("headline") or "")[:150],
                "areaDesc": (p.get("areaDesc") or "")[:120],
                "onset": p.get("onset", ""),
                "expires": p.get("expires", ""),
            })

        if not alerts:
            raise ValueError("No alerts")

        result = {"fetched": "live", "alerts": alerts}
    except Exception as e:
        print(f"Weather fetch failed: {e}, using fallback", file=sys.stderr)
        result = FALLBACK

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {len(result['alerts'])} alerts to {OUTPUT}")

if __name__ == '__main__':
    main()
