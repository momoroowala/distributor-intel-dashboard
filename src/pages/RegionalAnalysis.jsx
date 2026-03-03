import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MapPin, Building2, Users, DollarSign } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

// Import data from root data folder
import censusData from '../../data/census_wholesale.json'
import cbpData from '../../data/county_business_patterns.json'

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
  const prev = series[series.length - 2]?.value || series[0].value
  const change = ((latest - prev) / prev) * 100
  return { latest, change }
}

export default function RegionalAnalysis() {
  // Process wholesale trade data by category
  const grocerySales = censusData.categories?.['4244']?.data?.sales || []
  const lumberSales = censusData.categories?.['4243']?.data?.sales || []
  const totalSales = censusData.categories?.['42']?.data?.sales || []

  const groceryStats = getLatestChange(grocerySales)
  const lumberStats = getLatestChange(lumberSales)
  const totalStats = getLatestChange(totalSales)

  // Top states chart data from CBP
  const statesData = useMemo(() => {
    const durableGoods = cbpData.industries?.['423']
    if (!durableGoods?.top_states) return []

    return durableGoods.top_states.slice(0, 10).map(state => ({
      state: state.state_name,
      establishments: state.establishments,
      employment: state.employment / 1000, // Convert to thousands
      payroll: state.annual_payroll_1000s / 1000000 // Convert to billions
    }))
  }, [])

  // Category comparison
  const categoryData = useMemo(() => {
    if (!grocerySales.length || !lumberSales.length) return []

    return grocerySales.slice(-6).map((item, idx) => ({
      period: item.period.slice(5),
      grocery: item.value / 1000, // Convert to billions
      lumber: lumberSales[lumberSales.length - 6 + idx]?.value / 1000 || 0
    }))
  }, [grocerySales, lumberSales])

  const nationalStats = cbpData.industries?.['423']?.national || {}

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Regional Analysis</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Distribution activity by state and industry category. Census Bureau data on establishment counts, employment, and payroll.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(censusData.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Wholesale Sales"
          value={(totalStats.latest / 1000).toFixed(1)}
          change={totalStats.change}
          changeLabel="vs. last month"
          icon={DollarSign}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Grocery Wholesale"
          value={(groceryStats.latest / 1000).toFixed(1)}
          change={groceryStats.change}
          changeLabel="vs. last month"
          icon={Building2}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="National Establishments"
          value={(nationalStats.establishments / 1000).toFixed(1)}
          change={0}
          changeLabel="durable goods"
          icon={Building2}
          suffix="K"
        />
        <MetricCard
          title="Total Employment"
          value={(nationalStats.employment / 1000000).toFixed(2)}
          change={0}
          changeLabel="millions"
          icon={Users}
          suffix="M"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Top States by Employment"
          subtitle="Durable goods wholesale distributors (thousands)"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={statesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                width={100}
              />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="employment" fill={CHART_COLORS.purple} radius={[0, 4, 4, 0]} name="Employment (K)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top States by Establishments"
          subtitle="Number of distribution establishments"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={statesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                width={100}
              />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="establishments" fill={CHART_COLORS.cyan} radius={[0, 4, 4, 0]} name="Establishments" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Category Sales Trend"
          subtitle="Grocery vs Lumber wholesale sales ($B)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Bar dataKey="grocery" name="Grocery" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="lumber" name="Lumber" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Annual Payroll by State"
          subtitle="Top 10 states, total payroll ($B)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="payroll" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} name="Payroll ($B)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#7c4dff]" />
          Regional Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Market concentration in key states.</p>
            <p>
              California, Texas, and Florida account for over 30% of all durable goods distribution employment.
              If you're targeting regional expansion, these states offer the largest addressable market.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Category performance varies.</p>
            <p>
              Grocery wholesale is {groceryStats.change > 0 ? 'growing' : 'declining'} {Math.abs(groceryStats.change).toFixed(1)}% month over month,
              while lumber is {lumberStats.change > 0 ? 'up' : 'down'} {Math.abs(lumberStats.change).toFixed(1)}%.
              Industry mix matters for targeting and positioning.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  )
}
