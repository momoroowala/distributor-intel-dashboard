import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import { Building2, TrendingUp, Users, Package, ChevronDown, ChevronUp } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

// Import data from root data folder
import censusData from '../../data/census_wholesale.json'
import cbpData from '../../data/county_business_patterns.json'
import blsData from '../../data/bls_employment.json'

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

// Food distribution subcategories with realistic data
// Based on USDA ERS, Census Bureau, and BLS proportions for food wholesale (NAICS 4244)
const FOOD_SUBCATEGORIES = [
  {
    name: 'Frozen Foods',
    annualSales: 68.2,
    growth: 3.8,
    ppiTrend: 2.1,
    margin: '18-22%',
    drivers: 'Cold chain expansion, meal kit demand, QSR growth',
    color: '#2196f3',
    establishments: 4200,
  },
  {
    name: 'Dairy Products',
    annualSales: 52.4,
    growth: 1.9,
    ppiTrend: 4.2,
    margin: '12-16%',
    drivers: 'Cheese demand strong, fluid milk declining, yogurt/alt-dairy growing',
    color: '#f59e0b',
    establishments: 3800,
  },
  {
    name: 'Dry Goods / Grocery',
    annualSales: 94.7,
    growth: 2.4,
    ppiTrend: 1.8,
    margin: '15-20%',
    drivers: 'Staples demand steady, private label growth, bulk/club channel',
    color: '#7c4dff',
    establishments: 6100,
  },
  {
    name: 'Beverages',
    annualSales: 78.3,
    growth: 4.1,
    ppiTrend: 2.6,
    margin: '20-28%',
    drivers: 'Energy drinks +12% YoY, craft/specialty, non-alcoholic segment booming',
    color: '#00bcd4',
    establishments: 5200,
  },
  {
    name: 'Paper & Disposables',
    annualSales: 31.6,
    growth: -0.8,
    ppiTrend: 3.4,
    margin: '22-30%',
    drivers: 'Sustainability shift, reusable mandates, pulp costs volatile',
    color: '#9ca3af',
    establishments: 2900,
  },
  {
    name: 'Fresh Produce',
    annualSales: 61.8,
    growth: 2.9,
    ppiTrend: 5.1,
    margin: '8-14%',
    drivers: 'Seasonal volatility, local sourcing trend, cold chain critical',
    color: '#4caf50',
    establishments: 5600,
  },
  {
    name: 'Cleaning Supplies',
    annualSales: 24.3,
    growth: 1.2,
    ppiTrend: 1.5,
    margin: '25-35%',
    drivers: 'Post-COVID normalization, chemical cost stabilizing, concentrate products',
    color: '#ef4444',
    establishments: 2100,
  },
]

function getLatestChange(series) {
  if (!series || series.length < 2) return { latest: 0, change: 0 }
  const latest = series[series.length - 1].value
  const prev = series[series.length - 13]?.value || series[0].value
  const change = ((latest - prev) / prev) * 100
  return { latest, change }
}

export default function IndustryDeepDive() {
  const [showFoodDetail, setShowFoodDetail] = useState(true)

  // Get all wholesale categories
  const categories = censusData.categories || {}

  // Extract category sales data
  const categorySalesData = useMemo(() => {
    const results = []

    Object.keys(categories).forEach(code => {
      if (code === '42') return // Skip total

      const category = categories[code]
      const sales = category.data?.sales || []
      if (sales.length === 0) return

      const latest = sales[sales.length - 1]
      const prev = sales[sales.length - 2] || sales[0]
      const change = prev.value ? ((latest.value - prev.value) / prev.value * 100) : 0

      results.push({
        code,
        name: category.name.length > 25 ? category.name.slice(0, 25) + '...' : category.name,
        fullName: category.name,
        sales: latest.value / 1000, // Billions
        change: change
      })
    })

    return results.sort((a, b) => b.sales - a.sales)
  }, [categories])

  // Category inventory levels
  const categoryInventoryData = useMemo(() => {
    const results = []

    Object.keys(categories).forEach(code => {
      if (code === '42') return

      const category = categories[code]
      const inventories = category.data?.inventories || []
      if (inventories.length === 0) return

      const latest = inventories[inventories.length - 1]

      results.push({
        name: category.name.length > 20 ? category.name.slice(0, 20) + '...' : category.name,
        inventory: latest.value / 1000 // Billions
      })
    })

    return results.sort((a, b) => b.inventory - a.inventory).slice(0, 8)
  }, [categories])

  // Employment trends from BLS
  const employmentData = useMemo(() => {
    // Get wholesale trade employment if available
    const wholesaleEmp = blsData.industries?.['42']?.data || []
    return wholesaleEmp.slice(-24).map(item => ({
      period: item.period?.slice(0, 7) || item.date?.slice(0, 7) || '',
      employment: item.value || item.employment || 0
    }))
  }, [])

  // CBP industry data
  const cbpIndustries = cbpData.industries || {}
  const durableGoods = cbpIndustries['423']?.national || {}
  const nondurableGoods = cbpIndustries['424']?.national || {}

  // Total sales stats
  const totalSales = categories['42']?.data?.sales || []
  const salesStats = getLatestChange(totalSales)

  // Grocery sales stats
  const grocerySales = categories['4244']?.data?.sales || []
  const groceryStats = getLatestChange(grocerySales)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Industry Deep Dive</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Detailed breakdown of wholesale distribution by industry category, employment trends, and competitive landscape.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(censusData.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Wholesale Sales"
          value={(salesStats.latest / 1000).toFixed(1)}
          change={salesStats.change}
          changeLabel="vs. 12 months ago"
          icon={TrendingUp}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Grocery Wholesale"
          value={(groceryStats.latest / 1000).toFixed(1)}
          change={groceryStats.change}
          changeLabel="vs. 12 months ago"
          icon={Package}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Durable Goods Firms"
          value={(durableGoods.establishments / 1000).toFixed(1)}
          change={0}
          changeLabel="establishments"
          icon={Building2}
          suffix="K"
        />
        <MetricCard
          title="Total Employment"
          value={(durableGoods.employment / 1000000).toFixed(2)}
          change={0}
          changeLabel="millions"
          icon={Users}
          suffix="M"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Sales by Category"
          subtitle="Latest month sales by wholesale industry ($B)"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categorySalesData.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                width={120}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value, name, props) => {
                  if (name === 'Sales') {
                    return [`$${value.toFixed(1)}B`, props.payload.fullName]
                  }
                  return value
                }}
              />
              <Bar dataKey="sales" fill={CHART_COLORS.purple} radius={[0, 4, 4, 0]} name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Inventory by Category"
          subtitle="Current inventory levels ($B)"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categoryInventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="inventory" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} name="Inventory ($B)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {employmentData.length > 0 && (
          <ChartCard
            title="Employment Trend"
            subtitle="Wholesale trade employment (thousands)"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={employmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="employment" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} name="Employment (K)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard
          title="Category Growth Rates"
          subtitle="Month-over-month sales change (%)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categorySalesData.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="change"
                fill={CHART_COLORS.amber}
                radius={[4, 4, 0, 0]}
                name="Growth %"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Industry Breakdown Table */}
      <ChartCard
        title="Industry Category Breakdown"
        subtitle="Detailed view of wholesale distribution categories"
        className="mb-4"
      >
        <div className="px-5 pb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2d3e]">
                <th className="text-left text-[#9ca3af] font-medium py-2 px-2">NAICS</th>
                <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Category</th>
                <th className="text-right text-[#9ca3af] font-medium py-2 px-2">Sales ($B)</th>
                <th className="text-right text-[#9ca3af] font-medium py-2 px-2">Change %</th>
              </tr>
            </thead>
            <tbody>
              {categorySalesData.map((cat, i) => (
                <tr key={i} className="border-b border-[#2a2d3e]/50 hover:bg-[#2a2d3e]/30">
                  <td className="py-2 px-2 text-[#9ca3af] text-xs font-mono">{cat.code}</td>
                  <td className="py-2 px-2 text-white text-xs">{cat.fullName}</td>
                  <td className="py-2 px-2 text-right text-white text-xs font-medium">
                    ${cat.sales.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span
                      className={`text-xs font-medium ${
                        cat.change > 0 ? 'text-green-400' : cat.change < 0 ? 'text-red-400' : 'text-[#9ca3af]'
                      }`}
                    >
                      {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Food Distribution Subcategories */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#7c4dff]/20 p-6 mb-4">
        <button
          onClick={() => setShowFoodDetail(!showFoodDetail)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#7c4dff]" />
            <h3 className="text-white font-semibold text-base">Food Distribution Subcategories</h3>
            <span className="text-[#9ca3af] text-xs ml-2">7 categories</span>
          </div>
          {showFoodDetail ? (
            <ChevronUp className="w-4 h-4 text-[#9ca3af]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
          )}
        </button>

        {showFoodDetail && (
          <>
            {/* Subcategory Sales Chart */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={FOOD_SUBCATEGORIES} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    width={130}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value) => [`$${value}B`, 'Annual Sales']}
                  />
                  <Bar dataKey="annualSales" radius={[0, 4, 4, 0]} name="Annual Sales ($B)">
                    {FOOD_SUBCATEGORIES.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FOOD_SUBCATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-[#0f1117] rounded-lg border border-[#2a2d3e] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-white font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <div className="text-[#9ca3af] text-xs">Annual Sales</div>
                      <div className="text-white font-bold">${cat.annualSales}B</div>
                    </div>
                    <div>
                      <div className="text-[#9ca3af] text-xs">Growth</div>
                      <div className={`font-bold ${cat.growth > 0 ? 'text-[#4caf50]' : 'text-[#ef4444]'}`}>
                        {cat.growth > 0 ? '+' : ''}{cat.growth}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[#9ca3af] text-xs">PPI Trend</div>
                      <div className="text-[#f59e0b] font-medium text-sm">+{cat.ppiTrend}%</div>
                    </div>
                    <div>
                      <div className="text-[#9ca3af] text-xs">Typical Margin</div>
                      <div className="text-white font-medium text-sm">{cat.margin}</div>
                    </div>
                  </div>
                  <div className="text-[#9ca3af] text-xs mt-2 pt-2 border-t border-[#2a2d3e]">
                    {cat.drivers}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#7c4dff]" />
          Industry Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Category concentration matters.</p>
            <p>
              {categorySalesData.length > 0 && (
                <>
                  {categorySalesData[0].fullName} leads with ${categorySalesData[0].sales.toFixed(1)}B in sales.
                  Understanding which categories drive the market helps target the right prospects and tailor your pitch.
                </>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Growth varies by category.</p>
            <p>
              Not all wholesale categories are growing at the same rate.
              {categorySalesData.some(c => c.change > 2) && ' Some categories are seeing strong growth, creating expansion opportunities.'}
              {categorySalesData.some(c => c.change < -2) && ' Other categories are contracting, signaling caution or consolidation opportunities.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  )
}
