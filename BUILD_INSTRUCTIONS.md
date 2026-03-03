# Dashboard Overhaul Build Instructions

## CONTEXT
This is a distributor market intelligence dashboard (React + Vite + Tailwind + Recharts + React Router).
Target user: CEO/COO of a 10-50 employee wholesale distributor ($5M-$100M revenue) on QuickBooks + spreadsheets.

## PHILOSOPHY
"The future of websites is that they are extremely interactive and evoke a sense of play, learning, and real value/usefulness."
Every page must answer: "What do I do Monday morning?" Not "here's an interesting macro chart."

## TASK OVERVIEW
1. Build the NEW "Customer Health Scanner" page (flagship interactive feature)
2. Restructure existing pages to be more actionable and interactive
3. Remove/consolidate weak pages
4. Make everything feel alive, interactive, and genuinely useful

---

## PART 1: NEW PAGE - Customer Health Scanner (/customer-scanner)
**This is the most important page. It's the sales hook.**

### How it works:
1. User uploads a CSV or pastes data (columns: Customer Name, Date, Amount, Product/Category optional)
2. Client-side JavaScript processes it instantly (no backend)
3. Shows interactive results:

### Analysis to perform (all client-side):
- **RFM Scoring**: Recency (days since last order), Frequency (orders per period), Monetary (total spend). Score each 1-5. Segment into: Champions, Loyal, At Risk, Hibernating, Lost
- **Dormant Account Detection**: Flag customers with no orders in 2x their average order interval
- **Declining Customers**: Compare last 3 months vs prior 3 months spend. Flag >20% decline
- **Revenue Concentration Risk**: Pie chart showing % of revenue from top 5, top 10, top 20 customers. Traffic light (red if top 5 = >40%)
- **"Call Monday" Priority List**: Ranked list of customers needing attention with specific reasons and recommended actions
- **Ghost Revenue Calculator**: Sum up the revenue from dormant + declining customers = "You're leaving $X on the table"

### UX Requirements:
- Drag-and-drop CSV upload zone with animated upload indicator
- Sample data button that loads demo data so people can try without uploading
- Results appear with staggered animations (framer-motion)
- Each customer row is expandable for details
- Export results as CSV button
- Ghost Revenue number should animate counting up dramatically
- Color-coded customer segments (green=champions, yellow=at risk, red=lost)
- Interactive segment pie chart - click a segment to see those customers

### Sample Data to Include:
Generate realistic sample data for a food distributor with ~50 customers, 6 months of orders. Include realistic patterns: some champions ordering weekly, some declining gradually, some gone dormant, one or two that just started.

---

## PART 2: RESTRUCTURE EXISTING PAGES

### Pages to REMOVE entirely (delete the files and routes):
- TechAdoption.jsx - Fortune 500 case studies irrelevant to SMB distributors
- AIPulse.jsx - Accenture survey data meaningless to target audience  
- SupplyChainReset.jsx - One-time report summary, no updating data
- CompetitiveLandscape.jsx - if it exists and is just static content

### Pages to RESTRUCTURE:

#### Market Overview → "Your Industry This Week" 
- Remove GDP chart (CEOs don't check GDP)
- Keep diesel prices but ADD a fuel surcharge calculator: input your base rate, see recommended surcharge %
- Replace "All Commodities PPI" with a category SELECTOR (dropdown: Food Products, Industrial Chemicals, Metals, Paper, Cleaning Supplies) that shows category-specific PPI. Use the BLS data already available, or mock different category trends
- Add a "Weekly Pulse" section at top: 3-4 key takeaway cards with arrows (up/down) and one-sentence impact statements like "Diesel up 4.2% this month → Review your freight surcharges"
- Make the Google Trends section interactive: let user type their own search terms

#### Freight & Supply Chain → "Freight & Logistics Command Center"
- Add an interactive fuel surcharge calculator (input: base rate per mile, current diesel → outputs recommended surcharge)
- Add a "Freight Cost Impact" simulator: if freight goes up X%, how does that affect a $1M, $5M, $10M distributor?
- Keep the freight PPI trend but add annotations for major events (tariff changes, port disruptions)
- Add driver shortage impact section with "what this means for YOUR rates" callout

#### Trade & Tariffs → keep but improve
- Add a tariff impact calculator: "I import $X from [country]. Here's my estimated cost increase."
- Make the timeline more interactive (click events for details)
- Add a "Pre-tariff buying window" alert section

#### Threat Intel → "Risk & Security Center"  
- Keep the 10-point vulnerability assessment (most engaging feature!)
- Make it more gameified: progress bar, completion certificate/score badge
- Add a "Print Report" button for the assessment results
- Consolidate fraud stats into a more impactful single-scroll story

### Pages to KEEP as-is (minor tweaks only):
- Food & Beverage (if it has real food commodity data)
- Regional Analysis (keep but note it's for context)
- Industry Deep Dive (keep for reference)

---

## PART 3: NAVIGATION & LAYOUT

### New Sidebar Organization:
Group nav items into sections:

**📊 MY BUSINESS** (top section, highlighted)
- Customer Health Scanner (NEW - star icon, featured)

**📈 MARKET INTEL**
- Your Industry This Week (was Market Overview)
- Freight & Logistics (was Freight & Supply Chain)
- Trade & Tariffs (keep)

**🏭 INDUSTRY**
- Food & Beverage
- Industry Deep Dive
- Regional Analysis (optional)

**🛡️ RISK**
- Risk & Security Center (was Threat Intel)

### Default route should be /customer-scanner (the flagship page)

---

## PART 4: GLOBAL IMPROVEMENTS

### Every page should have:
- A "Why This Matters" one-liner at the top (not a subtitle, but a sharp statement like "Your freight costs went up 4.2% this quarter. Here's what to do about it.")
- At least ONE interactive element (calculator, assessment, simulator, upload)
- Animated number counters for key stats (framer-motion)
- Hover tooltips explaining what metrics mean in plain English

### Interactive Elements to Add Across Pages:
- Fuel surcharge calculator (Freight page)
- Tariff impact calculator (Trade page)
- Security assessment tool (already exists, enhance it)
- Customer health scanner (new page)
- Category PPI selector (Market Overview)

### CTA Section Update:
Change the CTA from generic to specific based on page context. If user is on Customer Scanner, CTA should say "Want automated alerts when customers go dormant? Let's talk." If on Freight, "Want lane-specific rate intelligence? Let's talk."

---

## TECHNICAL NOTES
- All analysis is CLIENT-SIDE (no backend, no API calls for the scanner)
- Use papaparse for CSV parsing (install it: npm install papaparse)
- Use framer-motion for animations (already installed)
- Keep existing ChartCard/MetricCard components, create new ones as needed
- Match existing design system (indigo sidebar, gray-50 bg)
- All sample/demo data should be realistic and hardcoded in the component
- Build must pass: npm run build

## COMMIT
After ALL changes, run npm run build. If it passes:
git add -A && git commit -m "feat: dashboard overhaul - customer health scanner, interactive tools, restructured pages"
