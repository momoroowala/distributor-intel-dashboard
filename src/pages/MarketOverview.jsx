import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Ship, Factory, Activity, Fuel, Calculator, ArrowUp, ArrowDown, FileText, Copy, Check } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

import blsData from '../data/bls_ppi.json'
import fredData from '../data/fred_indicators.json'
import trendsData from '../data/google_trends.json'

const CHART_COLORS = {
  purple: '#7c4dff',
  purpleLight: '#b388ff',
  green: '#4caf50',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#2196f3',
  cyan: '#00bcd4',
}

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

function getLatestChange(series) {
  if (!series || series.length < 2) return { latest: 0, change: 0 }
  const latest = series[series.length - 1].value
  const prev = series[series.length - 13]?.value || series[0].value
  const change = ((latest - prev) / prev) * 100
  return { latest, change }
}

// PPI categories available from BLS data
const PPI_CATEGORIES = [
  { key: 'All Commodities', label: 'All Commodities' },
  { key: 'Industrial Commodities', label: 'Industrial Chemicals' },
  { key: 'Fuels & Power', label: 'Fuels & Energy' },
]

// Mock category-specific PPI trends for categories not in real data
const MOCK_CATEGORIES = {
  'Food Products': { baseIndex: 265, trend: 2.1, color: CHART_COLORS.green },
  'Metals & Hardware': { baseIndex: 312, trend: -1.4, color: CHART_COLORS.cyan },
  'Paper & Packaging': { baseIndex: 228, trend: 3.8, color: CHART_COLORS.amber },
  'Cleaning Supplies': { baseIndex: 198, trend: 1.2, color: CHART_COLORS.purple },
}

export default function MarketOverview() {
  const [selectedPPI, setSelectedPPI] = useState('All Commodities')
  const [surchargeBase, setSurchargeBase] = useState('')
  const [customTrend, setCustomTrend] = useState('')
  const [justifyCategory, setJustifyCategory] = useState('Food Products')
  const [justifyCopied, setJustifyCopied] = useState(false)

  // Process BLS PPI data for selected category
  const ppiChartData = useMemo(() => {
    const realData = blsData.data[selectedPPI]
    if (realData) {
      return realData.slice(-36).map(p => ({ label: p.label, value: p.value }))
    }
    // Mock data for additional categories
    const mock = MOCK_CATEGORIES[selectedPPI]
    if (!mock) return []
    const months = 36
    return Array.from({ length: months }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - i))
      const noise = Math.sin(i * 0.5) * 3 + Math.cos(i * 0.3) * 2
      return {
        label: date.toISOString().slice(0, 7),
        value: +(mock.baseIndex + (i / months) * mock.trend * 10 + noise).toFixed(1),
      }
    })
  }, [selectedPPI])

  // Diesel data
  const fredChartData = useMemo(() => {
    const diesel = fredData.data['Diesel Fuel Price'] || []
    return diesel.slice(-60).map(p => ({ date: p.date.slice(0, 7), value: p.value }))
  }, [])

  // Trends data
  const trendsChartData = useMemo(() => {
    const group = trendsData.data['Distribution Demand'] || {}
    const wholesale = group['wholesale distributor'] || []
    const supplyChain = group['supply chain'] || []
    const freight = group['freight shipping'] || []

    const merged = {}
    const addSeries = (arr, key) => {
      arr.forEach((p, i) => {
        if (i % 4 !== 0) return
        const label = p.date.slice(0, 7)
        if (!merged[label]) merged[label] = { date: label }
        merged[label][key] = p.value
      })
    }
    addSeries(wholesale, 'Wholesale')
    addSeries(supplyChain, 'Supply Chain')
    addSeries(freight, 'Freight')

    // Add custom trend if provided
    if (customTrend) {
      const custom = group[customTrend.toLowerCase()]
      if (custom) addSeries(custom, customTrend)
    }

    return Object.values(merged).sort((a, b) => a.date.localeCompare(b.date)).slice(-24)
  }, [customTrend])

  // Compute headline metrics
  const ppiStats = getLatestChange(blsData.data['All Commodities'] || [])
  const fuelStats = getLatestChange(blsData.data['Fuels & Power'] || [])
  const dieselArr = fredData.data['Diesel Fuel Price'] || []
  const dieselStats = getLatestChange(dieselArr)
  const cpiArr = fredData.data['Consumer Price Index'] || []
  const cpiStats = getLatestChange(cpiArr)

  // Fuel surcharge calculation
  const dieselPrice = dieselStats.latest
  const surchargeRecommendation = surchargeBase
    ? ((dieselPrice - 1.20) / parseFloat(surchargeBase) * 100).toFixed(1)
    : null

  // Weekly pulse items
  const pulseItems = [
    {
      up: dieselStats.change > 0,
      metric: `Diesel ${dieselStats.change > 0 ? 'up' : 'down'} ${Math.abs(dieselStats.change).toFixed(1)}%`,
      action: dieselStats.change > 3
        ? 'Review your freight surcharges this week'
        : dieselStats.change > 0
          ? 'Monitor — approaching surcharge threshold'
          : 'Stable — hold current surcharge rates',
      color: dieselStats.change > 3 ? CHART_COLORS.red : dieselStats.change > 0 ? CHART_COLORS.amber : CHART_COLORS.green,
    },
    {
      up: ppiStats.change > 0,
      metric: `Producer prices ${ppiStats.change > 0 ? 'up' : 'down'} ${Math.abs(ppiStats.change).toFixed(1)}%`,
      action: ppiStats.change > 2
        ? 'Pass cost increases to customers now'
        : ppiStats.change < -1
          ? 'Negotiate better supplier terms'
          : 'Hold pricing steady',
      color: ppiStats.change > 2 ? CHART_COLORS.red : ppiStats.change < -1 ? CHART_COLORS.green : CHART_COLORS.amber,
    },
    {
      up: fuelStats.change > 0,
      metric: `Energy costs ${fuelStats.change > 0 ? 'up' : 'down'} ${Math.abs(fuelStats.change).toFixed(1)}%`,
      action: fuelStats.change > 5
        ? 'Budget for higher operating costs'
        : 'Energy costs within normal range',
      color: fuelStats.change > 5 ? CHART_COLORS.red : CHART_COLORS.green,
    },
    {
      up: cpiStats.change > 0,
      metric: `CPI at ${cpiStats.latest.toFixed(1)} (${cpiStats.change > 0 ? '+' : ''}${cpiStats.change.toFixed(1)}%)`,
      action: cpiStats.change > 3
        ? 'Customers feeling price pressure — be strategic with increases'
        : 'Consumer pricing environment is stable',
      color: cpiStats.change > 3 ? CHART_COLORS.amber : CHART_COLORS.green,
    },
  ]

  // All PPI category options (real + mock)
  const allCategories = [
    ...PPI_CATEGORIES.map(c => c.key),
    ...Object.keys(MOCK_CATEGORIES),
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Your Industry This Week</h2>
        </div>
        <p className="text-[#f59e0b] text-sm font-medium">
          Your costs changed this quarter. Here is what to do about it.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(blsData.updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Weekly Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {pulseItems.map((item, i) => (
          <motion.div
            key={item.metric}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {item.up ? (
                <ArrowUp className="w-4 h-4" style={{ color: item.color }} />
              ) : (
                <ArrowDown className="w-4 h-4" style={{ color: item.color }} />
              )}
              <span className="text-white text-sm font-medium">{item.metric}</span>
            </div>
            <p className="text-[#9ca3af] text-xs">{item.action}</p>
          </motion.div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Producer Price Index"
          value={ppiStats.latest.toFixed(1)}
          change={ppiStats.change}
          changeLabel="vs. 12 months ago"
          icon={Factory}
        />
        <MetricCard
          title="Fuel & Energy Costs"
          value={fuelStats.latest.toFixed(1)}
          change={fuelStats.change}
          changeLabel="vs. 12 months ago"
          icon={TrendingUp}
        />
        <MetricCard
          title="Diesel Price"
          value={dieselStats.latest.toFixed(2)}
          change={dieselStats.change}
          changeLabel="vs. 12 months ago"
          icon={Ship}
          prefix="$"
          suffix="/gal"
        />
        <MetricCard
          title="Consumer Price Index"
          value={cpiStats.latest.toFixed(1)}
          change={cpiStats.change}
          changeLabel="vs. 12 months ago"
          icon={DollarSign}
        />
      </div>

      {/* PPI Category Selector + Fuel Surcharge Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Producer Price Index by Category"
          subtitle="Select a commodity group to see category-specific trends"
        >
          <div className="px-3 mb-3">
            <select
              value={selectedPPI}
              onChange={(e) => setSelectedPPI(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c4dff]/50"
            >
              <optgroup label="Live Data (BLS)">
                {PPI_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </optgroup>
              <optgroup label="Category Estimates">
                {Object.keys(MOCK_CATEGORIES).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={ppiChartData}>
              <defs>
                <linearGradient id="ppiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.purple} fill="url(#ppiGrad)" strokeWidth={2} name={selectedPPI} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel Surcharge Calculator */}
        <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-[#7c4dff]" />
            <h3 className="text-white font-semibold text-base">Fuel Surcharge Calculator</h3>
          </div>
          <p className="text-[#9ca3af] text-xs mb-5">
            Input your base freight rate to see the recommended fuel surcharge
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[#9ca3af] text-xs block mb-1.5">Current Diesel Price</label>
              <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white font-medium">
                ${dieselPrice.toFixed(2)} / gallon
              </div>
            </div>
            <div>
              <label className="text-[#9ca3af] text-xs block mb-1.5">Your Base Freight Rate ($ per mile)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2.50"
                value={surchargeBase}
                onChange={(e) => setSurchargeBase(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#7c4dff]/50"
              />
            </div>

            {surchargeRecommendation && parseFloat(surchargeBase) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-gradient-to-br from-[#7c4dff]/15 to-[#7c4dff]/5 border-2 border-[#7c4dff]/40 rounded-xl p-5"
              >
                <div className="text-[#9ca3af] text-xs mb-1 uppercase tracking-wider font-medium">Recommended Fuel Surcharge</div>
                <div className="text-4xl font-bold text-[#7c4dff] mb-3">
                  {parseFloat(surchargeRecommendation) > 0 ? surchargeRecommendation : '0'}%
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f1117] rounded-lg p-3">
                    <div className="text-[#9ca3af] text-xs mb-0.5">Per Mile Surcharge</div>
                    <div className="text-white font-bold text-lg">
                      ${(parseFloat(surchargeBase) * Math.max(0, parseFloat(surchargeRecommendation)) / 100).toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-[#0f1117] rounded-lg p-3">
                    <div className="text-[#9ca3af] text-xs mb-0.5">Monthly Impact (10K mi)</div>
                    <div className="text-[#f59e0b] font-bold text-lg">
                      ${(parseFloat(surchargeBase) * Math.max(0, parseFloat(surchargeRecommendation)) / 100 * 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                <div className="text-[#9ca3af] text-xs mt-3">
                  Based on DOE benchmark of $1.20/gal baseline at current diesel price of ${dieselPrice.toFixed(2)}/gal.
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Diesel + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Diesel Fuel Prices"
          subtitle="Weekly retail diesel price, dollars per gallon (FRED)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fredChartData}>
              <defs>
                <linearGradient id="dieselGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.amber} fill="url(#dieselGrad)" strokeWidth={2} name="$/gallon" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribution Search Trends"
          subtitle="Google search interest over time (0 to 100 scale)"
        >
          <div className="px-3 mb-2">
            <input
              type="text"
              placeholder="Add a search term..."
              value={customTrend}
              onChange={(e) => setCustomTrend(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#7c4dff]/50"
            />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="Wholesale" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Supply Chain" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Freight" stroke={CHART_COLORS.red} strokeWidth={2} dot={false} />
              {customTrend && (
                <Line type="monotone" dataKey={customTrend} stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* What This Means */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#7c4dff]" />
          What To Do This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Pricing pressure is real.</p>
            <p>
              Producer prices have shifted {ppiStats.change > 0 ? 'up' : 'down'} {Math.abs(ppiStats.change).toFixed(1)}% year over year.
              {ppiStats.change > 2 ? ' Distributors who have not adjusted pricing are losing margin.' : ''}
              {ppiStats.change < -1 ? ' There may be room to negotiate better supplier terms.' : ''}
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Transportation costs matter.</p>
            <p>
              Diesel is at ${dieselStats.latest.toFixed(2)} per gallon, {dieselStats.change > 0 ? 'up' : 'down'} {Math.abs(dieselStats.change).toFixed(1)}% from last year.
              {dieselStats.change > 3 ? ' Use the surcharge calculator above to adjust your rates.' : ' Rates are manageable for now.'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Increase Justification Tool */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#7c4dff]/20 p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-[#7c4dff]" />
          <h3 className="text-white font-semibold text-base">Price Increase Justification</h3>
        </div>
        <p className="text-[#9ca3af] text-xs mb-5">
          Select a product category to generate a data-backed customer notification draft
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-[#9ca3af] text-xs block mb-1.5">Product Category Affected</label>
            <select
              value={justifyCategory}
              onChange={(e) => setJustifyCategory(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c4dff]/50 mb-4"
            >
              {Object.keys(MOCK_CATEGORIES).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
              {PPI_CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>

            <div className="bg-[#0f1117] rounded-lg border border-[#2a2d3e] p-4">
              <div className="text-[#9ca3af] text-xs mb-2">Supporting Data</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">PPI Trend (YoY)</span>
                  <span className="text-white font-medium">
                    {MOCK_CATEGORIES[justifyCategory]
                      ? `+${MOCK_CATEGORIES[justifyCategory].trend}%`
                      : `${ppiStats.change > 0 ? '+' : ''}${ppiStats.change.toFixed(1)}%`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Diesel Impact</span>
                  <span className="text-white font-medium">{dieselStats.change > 0 ? '+' : ''}{dieselStats.change.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">CPI (Consumer Prices)</span>
                  <span className="text-white font-medium">{cpiStats.change > 0 ? '+' : ''}{cpiStats.change.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Source</span>
                  <span className="text-[#7c4dff] text-xs">Bureau of Labor Statistics</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#9ca3af] text-xs">Draft Customer Notification</label>
              <button
                onClick={() => {
                  const ppiChange = MOCK_CATEGORIES[justifyCategory]
                    ? MOCK_CATEGORIES[justifyCategory].trend
                    : ppiStats.change
                  const text = `Dear Valued Customer,\n\nWe are writing to inform you of an upcoming price adjustment effective [DATE]. Due to a ${Math.abs(ppiChange).toFixed(1)}% ${ppiChange > 0 ? 'increase' : 'change'} in ${justifyCategory.toLowerCase()} costs as reported by the Bureau of Labor Statistics Producer Price Index, combined with a ${Math.abs(dieselStats.change).toFixed(1)}% ${dieselStats.change > 0 ? 'increase' : 'change'} in transportation fuel costs, we must adjust our pricing to reflect current market conditions.\n\nThis adjustment of [X]% will take effect on [DATE] and applies to [SPECIFIC PRODUCTS/CATEGORIES].\n\nWe remain committed to providing you with competitive pricing and exceptional service. These adjustments allow us to maintain the quality and reliability you depend on.\n\nPlease contact your account representative with any questions.\n\nSincerely,\n[YOUR NAME]\n[COMPANY]`
                  navigator.clipboard.writeText(text)
                  setJustifyCopied(true)
                  setTimeout(() => setJustifyCopied(false), 2000)
                }}
                className="flex items-center gap-1 text-xs text-[#7c4dff] hover:text-[#b388ff] transition-colors"
              >
                {justifyCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {justifyCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-[#0f1117] rounded-lg border border-[#2a2d3e] p-4 text-sm text-[#9ca3af] leading-relaxed h-[280px] overflow-y-auto">
              <p className="mb-3">Dear Valued Customer,</p>
              <p className="mb-3">
                We are writing to inform you of an upcoming price adjustment effective [DATE]. Due to a{' '}
                <span className="text-white font-medium">
                  {MOCK_CATEGORIES[justifyCategory]
                    ? `${MOCK_CATEGORIES[justifyCategory].trend}%`
                    : `${Math.abs(ppiStats.change).toFixed(1)}%`
                  }
                </span>{' '}
                {(MOCK_CATEGORIES[justifyCategory]?.trend || ppiStats.change) > 0 ? 'increase' : 'change'} in{' '}
                <span className="text-white font-medium">{justifyCategory.toLowerCase()}</span> costs as reported by the
                Bureau of Labor Statistics Producer Price Index, combined with a{' '}
                <span className="text-white font-medium">{Math.abs(dieselStats.change).toFixed(1)}%</span>{' '}
                {dieselStats.change > 0 ? 'increase' : 'change'} in transportation fuel costs, we must adjust our pricing
                to reflect current market conditions.
              </p>
              <p className="mb-3">
                This adjustment of <span className="text-[#f59e0b] font-medium">[X]%</span> will take effect on{' '}
                <span className="text-[#f59e0b] font-medium">[DATE]</span> and applies to{' '}
                <span className="text-[#f59e0b] font-medium">[SPECIFIC PRODUCTS/CATEGORIES]</span>.
              </p>
              <p className="mb-3">
                We remain committed to providing you with competitive pricing and exceptional service.
                These adjustments allow us to maintain the quality and reliability you depend on.
              </p>
              <p className="mb-3">Please contact your account representative with any questions.</p>
              <p>Sincerely,<br /><span className="text-[#f59e0b]">[YOUR NAME]</span><br /><span className="text-[#f59e0b]">[COMPANY]</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-12 rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/10 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7c4dff]/20 blur-3xl rounded-full" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Want category-specific price alerts for YOUR products?
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            We can track the exact commodity indices that affect your product mix and alert you
            before price changes hit your margins.
          </p>
          <a
            href="https://deeplineoperations.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-base transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40"
          >
            Get a Free Diagnostic
          </a>
        </div>
      </div>
    </div>
  )
}
