import { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Utensils, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
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
  pink: '#e91e63',
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

export default function FoodBeverage() {
  // Google Trends for food keywords
  const foodTrends = useMemo(() => {
    const group = trendsData.data['Food & Beverage'] || {}
    const keys = Object.keys(group)
    const merged = {}
    keys.forEach(kw => {
      const arr = group[kw] || []
      arr.forEach((p, i) => {
        if (i % 4 !== 0) return
        const label = p.date.slice(0, 7)
        if (!merged[label]) merged[label] = { date: label }
        merged[label][kw] = p.value
      })
    })
    return Object.values(merged).sort((a, b) => a.date.localeCompare(b.date)).slice(-24)
  }, [])

  // PPI data (use All Commodities as proxy for food PPI since specific series may not be available)
  const ppiData = useMemo(() => {
    const series = blsData.data['All Commodities'] || []
    return series.slice(-24)
  }, [])

  // FRED CPI as food price proxy
  const cpiData = useMemo(() => {
    const series = fredData.data['Consumer Price Index'] || []
    return series.slice(-24).map(p => ({
      date: p.date.slice(0, 7),
      value: p.value
    }))
  }, [])

  // Inventory to Sales
  const inventoryData = useMemo(() => {
    const series = fredData.data['Inventory to Sales Ratio'] || []
    return series.slice(-24).map(p => ({
      date: p.date.slice(0, 7),
      value: p.value
    }))
  }, [])

  const ppiStats = getLatestChange(blsData.data['All Commodities'] || [])
  const cpiStats = getLatestChange(fredData.data['Consumer Price Index'] || [])
  const invStats = getLatestChange(fredData.data['Inventory to Sales Ratio'] || [])

  // Food trends search stats
  const foodDistributor = trendsData.data?.['Food & Beverage']?.['food distributor'] || []
  const foodSearchStats = getLatestChange(foodDistributor.length > 0 ? foodDistributor : [{ value: 50 }, { value: 55 }])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Food & Beverage Distribution</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Market signals for food and beverage distributors. Pricing trends, demand indicators, and competitive signals.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Wholesale Price Index"
          value={ppiStats.latest.toFixed(1)}
          change={ppiStats.change}
          changeLabel="year over year"
          icon={TrendingUp}
        />
        <MetricCard
          title="Consumer Prices"
          value={cpiStats.latest.toFixed(1)}
          change={cpiStats.change}
          changeLabel="year over year"
          icon={TrendingUp}
        />
        <MetricCard
          title="Inventory/Sales Ratio"
          value={invStats.latest.toFixed(2)}
          change={invStats.change}
          changeLabel="year over year"
          icon={invStats.change > 5 ? AlertTriangle : TrendingDown}
        />
        <MetricCard
          title="Search Interest"
          value={foodSearchStats.latest}
          change={foodSearchStats.change}
          changeLabel="vs. last year"
          icon={Utensils}
          suffix="/100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Food & Beverage Search Trends"
          subtitle="Google search interest for food distribution keywords"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={foodTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="food distributor" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="beverage wholesale" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="restaurant supplies" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="food service distributor" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="organic wholesale" stroke={CHART_COLORS.pink} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Inventory to Sales Ratio"
          subtitle="Higher = more inventory sitting on shelves (FRED)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={inventoryData}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.amber} fill="url(#invGrad)" strokeWidth={2} name="Ratio" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Wholesale Price Trend"
          subtitle="PPI All Commodities, last 24 months (BLS)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ppiData}>
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
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.purple} fill="url(#ppiGrad)" strokeWidth={2} name="PPI" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Consumer Price Index"
          subtitle="Overall consumer prices, seasonally adjusted (FRED)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cpiData}>
              <defs>
                <linearGradient id="cpiGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.green} fill="url(#cpiGrad2)" strokeWidth={2} name="CPI" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#7c4dff]" />
          What This Means for Food Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Demand signals are shifting.</p>
            <p>
              Search interest in food distribution has {foodSearchStats.change > 0 ? 'increased' : 'decreased'} {Math.abs(foodSearchStats.change).toFixed(0)}% year over year.
              {foodSearchStats.change > 10 ? ' More businesses are actively looking for suppliers. This is a growth window.' : ''}
              Keep an eye on restaurant supply searches as a leading indicator for foodservice demand.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Pricing requires attention.</p>
            <p>
              With consumer prices {cpiStats.change > 0 ? 'rising' : 'falling'} {Math.abs(cpiStats.change).toFixed(1)}% and wholesale prices {ppiStats.change > 0 ? 'up' : 'down'} {Math.abs(ppiStats.change).toFixed(1)}%,
              the margin between what you pay and what customers accept is {Math.abs(cpiStats.change - ppiStats.change) < 1 ? 'tight' : 'worth watching'}.
              Review your pricing quarterly at minimum.
            </p>
          </div>
        </div>
      </div>

      <CTASection />
    </div>
  )
}
