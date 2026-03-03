import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'
import {
  Upload, Users, AlertTriangle, TrendingDown, DollarSign,
  ChevronDown, ChevronUp, Download, Star, Phone,
  Target, Sparkles, FileText, Search
} from 'lucide-react'
import CTASection from '../components/CTASection'

// ── Constants ──────────────────────────────────────────────────────────────────

const SEGMENT_COLORS = {
  Champions: '#4caf50',
  Loyal: '#2196f3',
  'At Risk': '#f59e0b',
  Hibernating: '#f97316',
  Lost: '#ef4444',
  New: '#7c4dff',
}

const SEGMENT_ACTIONS = {
  Champions: 'Protect the relationship — send a thank-you, offer early access to new products',
  Loyal: 'Upsell opportunity — introduce adjacent product categories',
  'At Risk': 'Call Monday — ask what changed, offer incentive to re-engage',
  Hibernating: 'Win-back campaign — personalized outreach with a special offer',
  Lost: 'Last resort outreach — "We miss you" call with significant incentive',
  New: 'Nurture — ensure great onboarding experience, follow up on first orders',
}

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Dry Goods', 'Beverages', 'Frozen', 'Paper Goods']

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1a1d2e',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    color: '#e8e8ed',
    fontSize: '12px',
  },
  labelStyle: { color: '#9ca3af' },
}

// ── Seeded random for deterministic sample data ────────────────────────────────

function createRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

// ── Sample data generator ──────────────────────────────────────────────────────

function generateSampleData() {
  const rng = createRng(42)
  const randBetween = (min, max) => min + rng() * (max - min)
  const randCat = () => CATEGORIES[Math.floor(rng() * CATEGORIES.length)]
  const baseDate = new Date('2026-03-01')
  const dateStr = (daysAgo) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().slice(0, 10)
  }

  // [name, intervalDays, avgAmount, variance, startDaysAgo, lastOrderDaysAgo, declineAfterDay]
  // declineAfterDay: if > 0, orders more recent than this many days ago have declining amounts
  const profiles = [
    // Champions — weekly/biweekly, high value, very recent
    ['Metro Fresh Foods', 7, 3200, 500, 180, 2, 0],
    ['City Grill Supply Co', 7, 2800, 400, 180, 4, 0],
    ['Harbor Restaurant Group', 10, 4100, 600, 180, 3, 0],
    ['Golden Plate Catering', 7, 2500, 300, 180, 6, 0],
    ['Valley Diner Chain', 14, 3800, 500, 180, 1, 0],
    // Loyal — biweekly/triweekly, moderate value
    ['Sunrise Bakery', 14, 1200, 200, 180, 8, 0],
    ['East Side Pizza', 14, 950, 150, 180, 10, 0],
    ['Parkview Senior Living', 21, 1800, 300, 180, 5, 0],
    ['The Corner Bistro', 14, 800, 100, 180, 12, 0],
    ['Campus Dining Services', 21, 2200, 400, 180, 7, 0],
    ['Lake Shore Grill', 14, 1100, 200, 180, 9, 0],
    ['Mountain View Cafe', 21, 750, 100, 180, 14, 0],
    ['Blue Ocean Sushi', 14, 1400, 200, 180, 11, 0],
    ['Happy Kids Daycare', 21, 600, 100, 180, 15, 0],
    ['Riverside Inn', 14, 1600, 300, 180, 6, 0],
    // At Risk — still ordering but declining spend
    ['Westfield Hotel', 14, 2400, 300, 180, 18, 90],
    ['Oak Street Tavern', 14, 1100, 200, 180, 22, 90],
    ['Premier Events Co', 21, 3200, 400, 180, 28, 90],
    ['County Hospital Kitchen', 14, 2800, 300, 180, 16, 90],
    ['Thorntons BBQ', 14, 1500, 200, 180, 20, 90],
    ['Airport Lounge Group', 21, 2100, 300, 180, 25, 90],
    ['Silver Spoon Dining', 14, 1800, 200, 180, 30, 90],
    ['Budget Eats LLC', 21, 900, 150, 180, 28, 90],
    // Hibernating — no orders in 60-90 days
    ['Greenfield School District', 14, 2000, 300, 180, 65, 0],
    ['Hilltop Country Club', 21, 3500, 500, 180, 70, 0],
    ['Seaside Fish Market', 14, 1200, 200, 180, 75, 0],
    ['Downtown Deli', 14, 800, 100, 180, 80, 0],
    ['Northside Taqueria', 21, 1100, 200, 180, 68, 0],
    ['Pine Street Pub', 14, 950, 150, 180, 72, 0],
    ['Marina Bay Restaurant', 21, 2800, 400, 180, 85, 0],
    ['Old Town Brewery', 14, 1400, 200, 180, 78, 0],
    // Lost — no orders in 90+ days
    ['Cascade Steakhouse', 21, 2200, 300, 180, 120, 0],
    ['Route 66 Diner', 14, 900, 150, 180, 110, 0],
    ['Imperial Garden Chinese', 21, 1300, 200, 180, 130, 0],
    ['Victory Sports Bar', 14, 1100, 200, 180, 105, 0],
    ['Sunshine Smoothie Bar', 21, 500, 100, 180, 140, 0],
    ['Central Market Deli', 14, 750, 100, 180, 115, 0],
    // New — started within last month
    ['Farm Table Kitchen', 10, 1800, 300, 25, 3, 0],
    ['The Brunch Spot', 7, 1200, 200, 20, 2, 0],
    // Sporadic
    ['Pop-up Events Co', 40, 2500, 800, 180, 15, 0],
    ['Weekend Warriors Catering', 35, 1800, 600, 180, 40, 0],
    ['Holiday Inn Express', 30, 1500, 400, 180, 50, 0],
    ['Beach Club Restaurant', 40, 2100, 700, 150, 45, 0],
    ['Union Hall Banquets', 50, 3000, 900, 180, 55, 0],
    ['Crossroads Cafe', 35, 700, 200, 180, 48, 0],
    ['Garden Party Events', 55, 4000, 1000, 180, 65, 0],
    ['Stadium Concessions', 40, 5000, 1500, 120, 30, 0],
  ]

  const orders = []
  profiles.forEach(([name, interval, avgAmt, variance, startDaysAgo, lastOrderDaysAgo, declineAfterDay]) => {
    let day = startDaysAgo
    while (day > lastOrderDaysAgo) {
      let amount = avgAmt + randBetween(-variance, variance)
      // Apply decline for "at risk" customers
      if (declineAfterDay > 0 && day < declineAfterDay) {
        const progress = (declineAfterDay - day) / declineAfterDay
        amount *= Math.max(0.35, 1 - progress * 0.6)
      }
      orders.push({
        'Customer Name': name,
        Date: dateStr(day),
        Amount: Math.round(amount * 100) / 100,
        Category: randCat(),
      })
      day -= interval + Math.floor(randBetween(-2, 3))
    }
  })

  return orders
}

// ── Analysis engine ────────────────────────────────────────────────────────────

function assignScores(values, higherIsBetter) {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  return values.map(v => {
    let rank = sorted.filter(x => x <= v).length
    let score = Math.ceil((rank / n) * 5)
    if (score === 0) score = 1
    return higherIsBetter ? score : 6 - score
  })
}

function getSegment(r, f, m) {
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions'
  if (r >= 3 && f >= 3 && m >= 3) return 'Loyal'
  if (r >= 4 && f <= 2) return 'New'
  if (r <= 2 && f >= 3) return 'At Risk'
  if (r <= 2 && f <= 2 && m <= 2) return 'Lost'
  if (r <= 2) return 'Hibernating'
  return 'Loyal'
}

function analyzeCustomers(orders) {
  const now = new Date()

  // Group orders by customer
  const byCustomer = {}
  orders.forEach(o => {
    const name = o['Customer Name']
    if (!name) return
    if (!byCustomer[name]) byCustomer[name] = []
    byCustomer[name].push({
      date: new Date(o.Date),
      amount: parseFloat(o.Amount) || 0,
      category: o.Category || '',
    })
  })

  const customerNames = Object.keys(byCustomer)

  // Calculate raw metrics per customer
  const rawMetrics = customerNames.map(name => {
    const customerOrders = byCustomer[name].sort((a, b) => a.date - b.date)
    const totalSpend = customerOrders.reduce((s, o) => s + o.amount, 0)
    const orderCount = customerOrders.length
    const lastOrder = customerOrders[customerOrders.length - 1].date
    const daysSinceLastOrder = Math.floor((now - lastOrder) / (1000 * 60 * 60 * 24))

    // Average order interval
    let avgInterval = 0
    if (orderCount > 1) {
      const firstOrder = customerOrders[0].date
      avgInterval = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24) / (orderCount - 1)
    }

    // Declining check: last 3 months vs prior 3 months
    const threeMonthsAgo = new Date(now)
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentSpend = customerOrders
      .filter(o => o.date >= threeMonthsAgo)
      .reduce((s, o) => s + o.amount, 0)
    const priorSpend = customerOrders
      .filter(o => o.date >= sixMonthsAgo && o.date < threeMonthsAgo)
      .reduce((s, o) => s + o.amount, 0)

    const spendChange = priorSpend > 0 ? ((recentSpend - priorSpend) / priorSpend) * 100 : 0
    const isDeclining = priorSpend > 0 && spendChange < -20

    // Dormant: no orders in 2x average interval
    const isDormant = avgInterval > 0 && daysSinceLastOrder > avgInterval * 2 && daysSinceLastOrder > 30

    // Top categories
    const catSpend = {}
    customerOrders.forEach(o => {
      catSpend[o.category] = (catSpend[o.category] || 0) + o.amount
    })
    const topCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Monthly spend for trend
    const monthlySpend = {}
    customerOrders.forEach(o => {
      const key = o.date.toISOString().slice(0, 7)
      monthlySpend[key] = (monthlySpend[key] || 0) + o.amount
    })

    return {
      name,
      totalSpend,
      orderCount,
      daysSinceLastOrder,
      avgInterval,
      recentSpend,
      priorSpend,
      spendChange,
      isDeclining,
      isDormant,
      topCategory,
      monthlySpend,
      lastOrderDate: lastOrder.toISOString().slice(0, 10),
      avgOrderValue: totalSpend / orderCount,
    }
  })

  // RFM scoring
  const recencies = rawMetrics.map(c => c.daysSinceLastOrder)
  const frequencies = rawMetrics.map(c => c.orderCount)
  const monetaries = rawMetrics.map(c => c.totalSpend)

  const rScores = assignScores(recencies, false) // lower days = better
  const fScores = assignScores(frequencies, true)
  const mScores = assignScores(monetaries, true)

  // Build customer results
  const customers = rawMetrics.map((c, i) => {
    const r = rScores[i]
    const f = fScores[i]
    const m = mScores[i]
    const segment = getSegment(r, f, m)

    // Ghost revenue: estimated monthly revenue lost from dormant/declining
    let ghostRevenue = 0
    if (c.isDormant || c.isDeclining) {
      const avgMonthlySpend = c.totalSpend / 6 // assume 6 month window
      if (c.isDormant) {
        ghostRevenue = avgMonthlySpend * Math.min(c.daysSinceLastOrder / 30, 6)
      } else if (c.isDeclining) {
        ghostRevenue = Math.abs(c.priorSpend - c.recentSpend)
      }
    }

    // Priority score for "Call Monday" list (higher = more urgent)
    let priority = 0
    if (c.isDeclining && m >= 3) priority += 40
    if (c.isDormant && m >= 3) priority += 35
    if (segment === 'At Risk') priority += 30
    if (segment === 'Hibernating') priority += 20
    if (segment === 'Lost') priority += 10
    priority += m * 3 // higher monetary = more important

    // Determine trend
    let trend = 'Stable'
    if (c.isDeclining) trend = 'Declining'
    else if (c.spendChange > 20) trend = 'Growing'

    // Action recommendation
    let action = SEGMENT_ACTIONS[segment]
    if (c.isDeclining && segment !== 'Lost') {
      action = `Spend down ${Math.abs(c.spendChange).toFixed(0)}% — call to understand why and re-engage`
    }
    if (c.isDormant && segment !== 'Lost') {
      action = `No order in ${c.daysSinceLastOrder} days (${Math.round(c.daysSinceLastOrder / c.avgInterval)}x their normal pace) — reach out now`
    }

    return {
      ...c,
      recencyScore: r,
      frequencyScore: f,
      monetaryScore: m,
      segment,
      ghostRevenue,
      priority,
      trend,
      action,
    }
  })

  // Sort by priority descending for "Call Monday"
  const callMonday = [...customers]
    .filter(c => c.priority > 15)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10)

  // Revenue concentration
  const sortedByRevenue = [...customers].sort((a, b) => b.totalSpend - a.totalSpend)
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0)
  const top5Revenue = sortedByRevenue.slice(0, 5).reduce((s, c) => s + c.totalSpend, 0)
  const top10Revenue = sortedByRevenue.slice(0, 10).reduce((s, c) => s + c.totalSpend, 0)
  const top20Revenue = sortedByRevenue.slice(0, 20).reduce((s, c) => s + c.totalSpend, 0)

  const concentration = {
    top5: (top5Revenue / totalRevenue) * 100,
    top10: (top10Revenue / totalRevenue) * 100,
    top20: (top20Revenue / totalRevenue) * 100,
    risk: top5Revenue / totalRevenue > 0.4 ? 'high' : top5Revenue / totalRevenue > 0.25 ? 'medium' : 'low',
  }

  // Segment distribution
  const segmentCounts = {}
  customers.forEach(c => {
    segmentCounts[c.segment] = (segmentCounts[c.segment] || 0) + 1
  })
  const segmentData = Object.entries(segmentCounts).map(([name, value]) => ({
    name,
    value,
    color: SEGMENT_COLORS[name],
  }))

  // Ghost revenue total
  const totalGhostRevenue = customers.reduce((s, c) => s + c.ghostRevenue, 0)

  return {
    customers: customers.sort((a, b) => b.totalSpend - a.totalSpend),
    callMonday,
    concentration,
    segmentData,
    totalGhostRevenue,
    totalRevenue,
    totalCustomers: customers.length,
    atRiskCount: customers.filter(c => c.segment === 'At Risk' || c.segment === 'Hibernating').length,
    lostCount: customers.filter(c => c.segment === 'Lost').length,
    championCount: customers.filter(c => c.segment === 'Champions').length,
  }
}

// ── Animated counter ───────────────────────────────────────────────────────────

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    let raf
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(value * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CustomerHealthScanner() {
  const [analysis, setAnalysis] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef(null)

  const processData = useCallback((orders) => {
    const result = analyzeCustomers(orders)
    setAnalysis(result)
    setExpandedRows(new Set())
    setSelectedSegment(null)
    setSearchTerm('')
  }, [])

  const handleFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Normalize column names
          const normalized = results.data.map(row => {
            const out = {}
            Object.entries(row).forEach(([k, v]) => {
              const key = k.trim().toLowerCase()
              if (key.includes('customer') || key.includes('name')) out['Customer Name'] = v
              else if (key.includes('date')) out['Date'] = v
              else if (key.includes('amount') || key.includes('total') || key.includes('value')) out['Amount'] = v
              else if (key.includes('product') || key.includes('category')) out['Category'] = v
              else out[k] = v
            })
            return out
          }).filter(r => r['Customer Name'] && r['Date'] && r['Amount'])
          processData(normalized)
        }
      }
    })
  }, [processData])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const loadSampleData = useCallback(() => {
    const orders = generateSampleData()
    processData(orders)
  }, [processData])

  const toggleRow = useCallback((name) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }, [])

  const exportResults = useCallback(() => {
    if (!analysis) return
    const rows = analysis.customers.map(c => ({
      'Customer Name': c.name,
      Segment: c.segment,
      'RFM Score': `${c.recencyScore}-${c.frequencyScore}-${c.monetaryScore}`,
      'Total Spend': c.totalSpend.toFixed(2),
      'Order Count': c.orderCount,
      'Days Since Last Order': c.daysSinceLastOrder,
      'Avg Order Value': c.avgOrderValue.toFixed(2),
      Trend: c.trend,
      'Top Category': c.topCategory,
      'Priority Action': c.action || '',
      'Ghost Revenue': c.ghostRevenue.toFixed(2),
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer-health-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [analysis])

  const resetScanner = useCallback(() => {
    setAnalysis(null)
    setExpandedRows(new Set())
    setSelectedSegment(null)
    setSearchTerm('')
  }, [])

  // Filter customers by segment and search
  const filteredCustomers = analysis?.customers.filter(c => {
    if (selectedSegment && c.segment !== selectedSegment) return false
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  }) || []

  // ── Upload view ──────────────────────────────────────────────────────────────

  if (!analysis) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#7c4dff]" />
            <h2 className="text-xl font-bold text-white">Customer Health Scanner</h2>
          </div>
          <p className="text-[#9ca3af] text-sm">
            Upload your order history and instantly see which customers need attention Monday morning.
          </p>
        </div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#7c4dff] bg-[#7c4dff]/10'
              : 'border-[#2a2d3e] bg-[#1a1d2e] hover:border-[#7c4dff]/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
          <motion.div
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Upload className="w-16 h-16 text-[#7c4dff] mx-auto mb-4" />
          </motion.div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Drop your CSV here or click to upload
          </h3>
          <p className="text-[#9ca3af] text-sm mb-1">
            Columns needed: Customer Name, Date, Amount
          </p>
          <p className="text-[#9ca3af]/60 text-xs">
            Product/Category column is optional. All processing happens in your browser — nothing is uploaded.
          </p>
        </motion.div>

        {/* Sample data button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <button
            onClick={loadSampleData}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7c4dff]/10 border border-[#7c4dff]/30 text-[#7c4dff] hover:bg-[#7c4dff]/20 transition-all font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Load Sample Data (Food Distributor, 50 customers)
          </button>
          <p className="text-[#9ca3af]/60 text-xs mt-2">
            Try it out with realistic demo data before uploading your own
          </p>
        </motion.div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: FileText, title: 'Upload Order History', desc: 'CSV export from QuickBooks, your ERP, or a spreadsheet' },
            { icon: Target, title: 'Instant RFM Analysis', desc: 'Recency, Frequency, Monetary scoring segments your customers' },
            { icon: Phone, title: 'Get Your Call List', desc: 'Know exactly who to call Monday and what to say' },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 text-center"
            >
              <step.icon className="w-8 h-8 text-[#7c4dff] mx-auto mb-3" />
              <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
              <p className="text-[#9ca3af] text-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <CTASection />
      </div>
    )
  }

  // ── Results view ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-[#7c4dff]" />
            <h2 className="text-xl font-bold text-white">Customer Health Scanner</h2>
          </div>
          <p className="text-[#9ca3af] text-sm">
            {analysis.totalCustomers} customers analyzed — here is what needs your attention.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4caf50]/10 border border-[#4caf50]/30 text-[#4caf50] hover:bg-[#4caf50]/20 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={resetScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2d3e] border border-[#2a2d3e] text-[#9ca3af] hover:text-white transition-all text-sm"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Ghost Revenue Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-[#ef4444]/10 via-[#1a1d2e] to-[#f59e0b]/10 rounded-2xl border border-[#ef4444]/30 p-8 mb-8 overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-[#ef4444]/10 blur-3xl rounded-full" />
        <div className="relative text-center">
          <p className="text-[#9ca3af] text-sm mb-2">Revenue at risk from dormant + declining customers</p>
          <div className="text-5xl font-bold text-[#ef4444] mb-2">
            <AnimatedCounter value={Math.round(analysis.totalGhostRevenue)} prefix="$" duration={2500} />
          </div>
          <p className="text-[#9ca3af]/80 text-xs">
            This is the revenue you are leaving on the table. These customers used to buy regularly.
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: analysis.totalCustomers, icon: Users, color: '#7c4dff' },
          { label: 'Champions', value: analysis.championCount, icon: Star, color: '#4caf50' },
          { label: 'At Risk / Hibernating', value: analysis.atRiskCount, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Lost', value: analysis.lostCount, icon: TrendingDown, color: '#ef4444' },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: metric.color + '20' }}>
                <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={metric.value} duration={1500} />
            </div>
            <div className="text-[#9ca3af] text-xs mt-1">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Segment Pie Chart + Revenue Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6"
        >
          <h3 className="text-white font-semibold text-base mb-1">Customer Segments</h3>
          <p className="text-[#9ca3af] text-xs mb-4">Click a segment to filter the table below</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={analysis.segmentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                onClick={(entry) => {
                  setSelectedSegment(selectedSegment === entry.name ? null : entry.name)
                }}
                style={{ cursor: 'pointer' }}
              >
                {analysis.segmentData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={selectedSegment && selectedSegment !== entry.name ? 0.3 : 1}
                    stroke={selectedSegment === entry.name ? '#fff' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(value, name) => [`${value} customers`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {analysis.segmentData.map(seg => (
              <button
                key={seg.name}
                onClick={() => setSelectedSegment(selectedSegment === seg.name ? null : seg.name)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all ${
                  selectedSegment === seg.name ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-[#9ca3af]">{seg.name}</span>
                <span className="text-white font-medium">{seg.value}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6"
        >
          <h3 className="text-white font-semibold text-base mb-1">Revenue Concentration Risk</h3>
          <p className="text-[#9ca3af] text-xs mb-6">How dependent are you on your biggest accounts?</p>
          <div className="space-y-5">
            {[
              { label: 'Top 5 Customers', pct: analysis.concentration.top5 },
              { label: 'Top 10 Customers', pct: analysis.concentration.top10 },
              { label: 'Top 20 Customers', pct: analysis.concentration.top20 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#9ca3af]">{item.label}</span>
                  <span className="text-white font-medium">{item.pct.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-[#0f1117] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: item.pct > 60 ? '#ef4444' : item.pct > 40 ? '#f59e0b' : '#4caf50',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-6 p-4 rounded-lg border ${
            analysis.concentration.risk === 'high'
              ? 'bg-[#ef4444]/10 border-[#ef4444]/30'
              : analysis.concentration.risk === 'medium'
                ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30'
                : 'bg-[#4caf50]/10 border-[#4caf50]/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                analysis.concentration.risk === 'high'
                  ? 'bg-[#ef4444]'
                  : analysis.concentration.risk === 'medium'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#4caf50]'
              }`} />
              <span className="text-white text-sm font-medium">
                {analysis.concentration.risk === 'high'
                  ? 'High Risk — over-reliant on top accounts'
                  : analysis.concentration.risk === 'medium'
                    ? 'Moderate — some concentration risk'
                    : 'Healthy — well-diversified revenue'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call Monday Priority List */}
      {analysis.callMonday.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1d2e] rounded-xl border border-[#f59e0b]/30 p-6 mb-8"
        >
          <h3 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#f59e0b]" />
            Call Monday Priority List
          </h3>
          <p className="text-[#9ca3af] text-xs mb-4">Your top priority outreach — ranked by revenue impact and urgency</p>
          <div className="space-y-3">
            {analysis.callMonday.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center gap-4 bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]"
              >
                <div className="w-8 h-8 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-medium text-sm truncate">{c.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: SEGMENT_COLORS[c.segment] + '20',
                        color: SEGMENT_COLORS[c.segment],
                      }}
                    >
                      {c.segment}
                    </span>
                  </div>
                  <p className="text-[#9ca3af] text-xs truncate">{c.action}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-medium text-sm">${c.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-[#9ca3af] text-xs">total spend</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Customer Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] overflow-hidden mb-8"
      >
        <div className="p-4 border-b border-[#2a2d3e] flex items-center justify-between gap-4">
          <h3 className="text-white font-semibold text-base">All Customers</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#7c4dff]/50 w-48"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 text-xs text-[#9ca3af] font-medium border-b border-[#2a2d3e]">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Segment</div>
          <div className="col-span-1 text-right">RFM</div>
          <div className="col-span-2 text-right">Total Spend</div>
          <div className="col-span-1 text-right">Orders</div>
          <div className="col-span-2 text-right">Last Order</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#2a2d3e]">
          {filteredCustomers.map(c => (
            <div key={c.name}>
              <div
                className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 hover:bg-[#0f1117]/50 cursor-pointer transition-colors items-center"
                onClick={() => toggleRow(c.name)}
              >
                <div className="col-span-3 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEGMENT_COLORS[c.segment] }}
                  />
                  <span className="text-white text-sm truncate">{c.name}</span>
                </div>
                <div className="col-span-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: SEGMENT_COLORS[c.segment] + '20',
                      color: SEGMENT_COLORS[c.segment],
                    }}
                  >
                    {c.segment}
                  </span>
                </div>
                <div className="col-span-1 text-right text-[#9ca3af] text-sm font-mono">
                  {c.recencyScore}-{c.frequencyScore}-{c.monetaryScore}
                </div>
                <div className="col-span-2 text-right text-white text-sm font-medium">
                  ${c.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="col-span-1 text-right text-[#9ca3af] text-sm">{c.orderCount}</div>
                <div className="col-span-2 text-right text-[#9ca3af] text-sm">{c.lastOrderDate}</div>
                <div className="col-span-1 text-right">
                  {expandedRows.has(c.name) ? (
                    <ChevronUp className="w-4 h-4 text-[#9ca3af] inline" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9ca3af] inline" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedRows.has(c.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 bg-[#0f1117]/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">Avg Order Value</div>
                          <div className="text-white font-medium">${c.avgOrderValue.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">Days Since Last Order</div>
                          <div className="text-white font-medium">{c.daysSinceLastOrder} days</div>
                        </div>
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">Top Category</div>
                          <div className="text-white font-medium">{c.topCategory}</div>
                        </div>
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">Spend Trend (3mo)</div>
                          <div className={`font-medium ${
                            c.trend === 'Declining' ? 'text-[#ef4444]' :
                            c.trend === 'Growing' ? 'text-[#4caf50]' : 'text-white'
                          }`}>
                            {c.trend} {c.spendChange !== 0 && `(${c.spendChange > 0 ? '+' : ''}${c.spendChange.toFixed(0)}%)`}
                          </div>
                        </div>
                      </div>
                      {c.action && (
                        <div className="mt-3 p-3 rounded-lg bg-[#1a1d2e] border border-[#2a2d3e]">
                          <div className="text-xs text-[#9ca3af] mb-1">Recommended Action</div>
                          <div className="text-white text-sm">{c.action}</div>
                        </div>
                      )}
                      {c.ghostRevenue > 0 && (
                        <div className="mt-2 text-xs text-[#ef4444]">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          ${c.ghostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} estimated ghost revenue
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-[#9ca3af] text-sm">
            No customers match the current filter.
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <div className="relative mt-12 rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/10 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7c4dff]/20 blur-3xl rounded-full" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Want automated alerts when customers go dormant?
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            This scan is a snapshot. We can monitor your accounts continuously and alert your sales team
            the moment a customer starts slipping — before you lose them.
          </p>
          <a
            href="https://deeplineoperations.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-base transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40"
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </div>
  )
}
