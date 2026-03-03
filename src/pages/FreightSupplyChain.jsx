import { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Truck, TrendingUp, Package, Activity } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

// Import data from root data folder
import freightData from '../../data/freight_macro.json'
import censusData from '../../data/census_wholesale.json'

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

export default function FreightSupplyChain() {
  // Process freight PPI data
  const truckloadData = useMemo(() => {
    const series = freightData.freight_indicators?.['WPUFD4111']?.data || []
    return series.slice(-24).map(item => ({
      date: item.date.slice(0, 7),
      value: item.value
    }))
  }, [])

  // Process wholesale inventory data
  const inventoryData = useMemo(() => {
    const series = censusData.categories?.['42']?.data?.inventories || []
    return series.slice(-15).map(item => ({
      period: item.period.slice(5),
      value: item.value / 1000 // Convert to billions
    }))
  }, [])

  // Process wholesale sales data
  const salesData = useMemo(() => {
    const series = censusData.categories?.['42']?.data?.sales || []
    return series.slice(-15).map(item => ({
      period: item.period.slice(5),
      value: item.value / 1000 // Convert to billions
    }))
  }, [])

  // Combined sales and inventory
  const combinedData = useMemo(() => {
    const sales = censusData.categories?.['42']?.data?.sales || []
    const inventories = censusData.categories?.['42']?.data?.inventories || []

    return sales.slice(-12).map((item, idx) => ({
      period: item.period.slice(5),
      sales: item.value / 1000,
      inventory: inventories[inventories.length - 12 + idx]?.value / 1000 || 0,
      ratio: inventories[inventories.length - 12 + idx]?.value / item.value || 0
    }))
  }, [])

  const truckloadSeries = freightData.freight_indicators?.['WPUFD4111']?.data || []
  const truckloadStats = getLatestChange(truckloadSeries)

  const totalSales = censusData.categories?.['42']?.data?.sales || []
  const salesStats = getLatestChange(totalSales)

  const totalInventories = censusData.categories?.['42']?.data?.inventories || []
  const invStats = getLatestChange(totalInventories)

  // Calculate current I/S ratio
  const latestSales = totalSales[totalSales.length - 1]?.value || 1
  const latestInv = totalInventories[totalInventories.length - 1]?.value || 0
  const currentRatio = latestInv / latestSales

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Freight & Supply Chain</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Freight costs, wholesale inventory levels, and supply chain health indicators.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(freightData.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Truckload Freight PPI"
          value={truckloadStats.latest.toFixed(1)}
          change={truckloadStats.change}
          changeLabel="vs. 12 months ago"
          icon={Truck}
        />
        <MetricCard
          title="Wholesale Sales"
          value={(salesStats.latest / 1000).toFixed(1)}
          change={salesStats.change}
          changeLabel="vs. 12 months ago"
          icon={TrendingUp}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Wholesale Inventory"
          value={(invStats.latest / 1000).toFixed(1)}
          change={invStats.change}
          changeLabel="vs. 12 months ago"
          icon={Package}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Inventory/Sales Ratio"
          value={currentRatio.toFixed(2)}
          change={0}
          changeLabel="current level"
          icon={Activity}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Truckload Freight Pricing"
          subtitle="PPI for long-distance general freight trucking (BLS)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={truckloadData}>
              <defs>
                <linearGradient id="freightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.amber} fill="url(#freightGrad)" strokeWidth={2} name="PPI" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Wholesale Sales Trend"
          subtitle="Total wholesale trade sales ($B)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.purple} fill="url(#salesGrad)" strokeWidth={2} name="Sales ($B)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Inventory Levels"
          subtitle="Total wholesale inventories ($B)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={inventoryData}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.cyan} fill="url(#invGrad)" strokeWidth={2} name="Inventory ($B)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Sales vs Inventory"
          subtitle="Tracking supply-demand balance"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="sales" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} name="Sales ($B)" />
              <Line type="monotone" dataKey="inventory" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} name="Inventory ($B)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7c4dff]" />
          Supply Chain Health Check
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Freight costs are {truckloadStats.change > 0 ? 'rising' : 'falling'}.</p>
            <p>
              Truckload freight PPI is {truckloadStats.change > 0 ? 'up' : 'down'} {Math.abs(truckloadStats.change).toFixed(1)}% year over year.
              {truckloadStats.change > 5 ? ' This is a significant increase that will impact delivery margins.' : ''}
              {truckloadStats.change < -5 ? ' Lower freight costs are improving distribution economics.' : ''}
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Inventory levels signal demand.</p>
            <p>
              Current inventory-to-sales ratio is {currentRatio.toFixed(2)}.
              {currentRatio > 1.35 ? ' Elevated inventory suggests slower turnover and potential pricing pressure.' : ''}
              {currentRatio < 1.25 ? ' Lean inventory indicates strong demand and faster turnover.' : ''}
              {currentRatio >= 1.25 && currentRatio <= 1.35 ? ' This is a healthy range for wholesale distribution.' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  )
}
