# Distribution Market Intelligence Dashboard

Free market intelligence for U.S. wholesale distributors. Live data from federal sources, updated daily.

## Live Demo

**React Version:** https://momoroowala.github.io/distributor-intel-dashboard/

## Features

- **Market Overview** - Wholesale sales trends, PPI, diesel prices
- **Food & Beverage** - Commodity prices, distributor metrics
- **Regional Analysis** - State-level employment and establishment data
- **Freight & Supply Chain** - Transportation costs, inventory ratios
- **Trade & Tariffs** - Import data, regulatory updates
- **Industry Deep Dive** - NAICS category breakdowns

## Data Sources

All data from public U.S. federal agencies:
- US Census Bureau (Wholesale Trade Survey, County Business Patterns)
- Bureau of Labor Statistics (Employment, PPI)
- Federal Reserve Economic Data (FRED)
- US International Trade Commission

## Auto-Updates

Data refreshes daily at 9 AM UTC via GitHub Actions. No manual intervention needed.

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Update Data Manually

```bash
cd scripts
cp config.example.py config.py
# Add your API keys to config.py
python update_all.py
```

Required API keys (free):
- FRED API: https://fred.stlouisfed.org/docs/api/api_key.html
- BLS API: https://www.bls.gov/developers/

## Tech Stack

- React 19 + Vite
- Recharts for visualizations
- Tailwind CSS v4
- GitHub Actions for automation
- GitHub Pages for hosting

## License

Dashboard code: Proprietary  
Data: Public domain (U.S. federal sources)

---

Built by [Deepline Operations](https://deeplineops.com)
