import { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, DollarSign, Ship, Factory, Activity, Package } from 'lucide-react'
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

export default function MarketOverview() {
  // Process BLS PPI data
  const ppiChartData = useMemo(() => {
    const allComm = blsData.data['All Commodities'] || []
    const industrial = blsData.data['Industrial Commodities'] || []
    const fuels = blsData.data['Fuels & Power'] || []

    // Merge by label
    const merged = {}
    const addSeries = (arr, key) => {
      arr.forEach(p => {
        if (!merged[p.label]) merged[p.label] = { label: p.label }
        merged[p.label][key] = p.value
      })
    }
    addSeries(allComm, 'All Commodities')
    addSeries(industrial, 'Industrial')
    addSeries(fuels, 'Fuels & Power')

    return Object.values(merged).sort((a, b) => a.label.localeCompare(b.label)).slice(-36)
  }, [])

  // Process FRED data
  const fredChartData = useMemo(() => {
    const diesel = fredData.data['Diesel Fuel Price'] || []
    return diesel.slice(-60).map(p => ({
      date: p.date.slice(0, 7),
      value: p.value
    }))
  }, [])

  const cpiData = useMemo(() => {
    const cpi = fredData.data['Consumer Price Index'] || []
    return cpi.slice(-36).map(p => ({
      date: p.date.slice(0, 7),
      value: p.value
    }))
  }, [])

  // Process Google Trends data
  const trendsChartData = useMemo(() => {
    const group = trendsData.data['Distribution Demand'] || {}
    const wholesale = group['wholesale distributor'] || []
    const supplyChain = group['supply chain'] || []
    const freight = group['freight shipping'] || []

    // Sample every 4 weeks for readability
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

    return Object.values(merged).sort((a, b) => a.date.localeCompare(b.date)).slice(-24)
  }, [])

  // Compute headline metrics
  const ppiStats = getLatestChange(blsData.data['All Commodities'] || [])
  const fuelStats = getLatestChange(blsData.data['Fuels & Power'] || [])
  const dieselArr = fredData.data['Diesel Fuel Price'] || []
  const dieselStats = getLatestChange(dieselArr)
  const cpiArr = fredData.data['Consumer Price Index'] || []
  const cpiStats = getLatestChange(cpiArr)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Market Overview</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          National distribution market health indicators. Updated with the latest public data from government sources.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(blsData.updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Producer Price Index Trends"
          subtitle="Wholesale price changes across commodity groups (BLS)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ppiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="All Commodities" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Industrial" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Fuels & Power" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Consumer Price Index"
          subtitle="Overall consumer price level, seasonally adjusted (FRED)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cpiData}>
              <defs>
                <linearGradient id="cpiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.purple} fill="url(#cpiGrad)" strokeWidth={2} name="CPI" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribution Search Trends"
          subtitle="Google search interest over time (0 to 100 scale)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="Wholesale" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Supply Chain" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Freight" stroke={CHART_COLORS.red} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* What This Means */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#7c4dff]" />
          What This Means for Distributors
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
              This directly impacts delivery costs and should be factored into customer pricing.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  )
}
