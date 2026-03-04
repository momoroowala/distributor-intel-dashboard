# Mike DiNapoli Review - Implementation Fixes

## CRITICAL FIXES (must do)

### 1. Fix GitHub Pages SPA routing (direct link 404s)
Add `public/404.html` with redirect script:
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // Single Page App redirect for GitHub Pages
    var pathSegmentsToKeep = 1; // repo name segment
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body></body>
</html>
```
Also add redirect handling in index.html:
```html
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

### 2. Fix blank homepage - add a landing/welcome dashboard
Create `src/pages/Home.jsx` as the default route ("/"):
- Executive summary with top 3-4 alert cards pulled from market data
- "Your Industry Health" score or quick pulse
- Big prominent CTA button: "Scan Your Customer Health →" linking to /customer-scanner
- Brief value prop: "See what's happening in distribution this week and find the revenue you're leaving on the table"
- Quick stats grid showing key numbers from across the dashboard
- Make it feel like a command center landing page

### 3. Fix or remove Trade & Tariffs page
The page shows all zeros. Options:
- REMOVE from nav entirely until data is populated
- OR populate with hardcoded current tariff data (China 10-25%, Canada/Mexico USMCA context, EU dairy/cheese tariffs affecting food distributors)
Choose: REMOVE IT. An empty page kills credibility.

### 4. Fix Fuel Surcharge Calculator
On both Market Overview and Freight pages, the calculator doesn't show output. Make sure:
- When user enters base rate and clicks calculate, result is prominently displayed
- Show: recommended surcharge %, dollar amount per mile, monthly impact estimate
- Add animated result reveal

### 5. Expand Industry Deep Dive categories
Currently only shows Grocery and Lumber. Add food-specific subcategories:
- Frozen Foods
- Dairy Products
- Dry Goods/Grocery
- Beverages
- Paper/Disposables
- Fresh Produce
- Cleaning Supplies
Use realistic data (can be derived from Census/BLS proportions or realistic estimates)

## ENHANCEMENT FIXES

### 6. Add "Share/Export Report" to Customer Health Scanner
- "Generate PDF Report" button that creates a printable summary
- Or at minimum, a "Print This Page" styled view
- The export CSV already exists, enhance it

### 7. Add Price Increase Justification section
New interactive tool on Market Overview or as its own component:
- User selects product category affected
- Tool pulls current PPI trend for that category
- Generates a draft customer notification letter referencing real data
- "Dear [Customer], Due to a X.X% increase in [category] costs as reported by the Bureau of Labor Statistics..."

### 8. Improve Regional Analysis
- Add context about what the data means for different sized distributors
- Add a "Find Your State" quick filter
- Note: hyperlocal data (zip-level restaurant permits) is beyond current data sources, skip for now

### 9. Add "About" section or footer
- Brief credibility builder: "Built by Deepline Operations - we help distributors find revenue they're leaving on the table"
- Link to contact/discovery call

### 10. Customer Health Scanner improvements
- Add a note about product-level analysis: "Want product-level insights? That's what our full platform does. Let's talk."
- Improve the sample data labels to be even more food-distributor specific
- Add a "Trust" callout: "🔒 100% browser-based. Your data never leaves your computer. No servers, no uploads, no storage."

## TECHNICAL
- All changes on feature/mike-fixes branch
- After all changes: npm run build
- Commit: git add -A && git commit -m "feat: implement review fixes - homepage, SPA routing, calculators, expanded categories"
