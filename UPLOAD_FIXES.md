# Upload Fixes - Implementation Guide

## FIX 1: Remove blank space on Home.jsx initial load

The Home page has too much blank space above the fold before content appears. Fix:
- Reduce hero section padding/margin. Make it tight so the headline, subheadline, CTAs, AND the first row of alert cards are ALL visible above the fold without scrolling
- The hero should have minimal top padding (pt-4 or pt-6 max, not pt-16 or pt-20)
- Alert cards should be immediately visible below the hero, no big gap
- Consider making the hero more compact: headline, one line of subtext, two buttons, done
- The case study and "how it works" can be below the fold, that's fine
- Goal: within 0 seconds of landing, user sees headline + CTAs + first alert cards. Zero blank space.

## FIX 2: Column Mapping for CSV Upload in CustomerHealthScanner.jsx

Currently the scanner expects exact column names (Customer Name, Date, Amount). Real QuickBooks exports have different column headers. Build a column mapping step:

### Flow:
1. User uploads CSV (or drags and drops)
2. **NEW STEP: Column Mapping Modal/Panel appears**
   - Show a preview of the first 3-5 rows of their data in a small table
   - Show 3 dropdown selectors:
     - "Which column contains the **Customer Name**?" → dropdown of all CSV column headers
     - "Which column contains the **Order Date**?" → dropdown of all CSV column headers  
     - "Which column contains the **Order Amount**?" → dropdown of all CSV column headers
   - Auto-detect: try to guess which columns match (look for headers containing "customer", "name", "date", "amount", "total", "sum", "revenue", "sales", etc.)
   - Pre-select the best guesses but let user override
   - Show a "Confirm & Analyze" button
3. After mapping confirmed, run the existing analysis with the mapped columns

### Design:
- The mapping panel should appear as an inline section (not a modal popup) between the upload area and results
- Clean, simple design matching existing dashboard style
- Show column header names from THEIR file in the dropdowns
- Add a small data preview table showing first 3 rows with the selected columns highlighted
- If auto-detection is confident (exact match), show green checkmarks
- If auto-detection is uncertain, show yellow "please verify" indicators
- Include a "Cancel" button to go back to upload

### Auto-detection rules:
- Customer Name: match headers containing "customer", "name", "client", "account", "company", "bill to", "ship to"
- Order Date: match headers containing "date", "order date", "invoice date", "txn date", "transaction date"  
- Order Amount: match headers containing "amount", "total", "sum", "revenue", "sales", "value", "price", "balance"
- Case-insensitive matching
- If multiple matches, prefer the first/best one but don't auto-select, let user choose

### Technical:
- Use papaparse to parse headers first (just first 5 rows for preview)
- Store column mapping in component state
- After confirmation, re-parse full CSV using mapped column names
- The "Load Sample Data" button should skip the mapping step entirely (sample data has known columns)

## AFTER ALL CHANGES:
- npm run build
- git add -A && git commit -m "feat: fix homepage spacing, add CSV column mapping for custom uploads"
- DO NOT push
