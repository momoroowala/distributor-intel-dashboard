import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Truck, TrendingUp, Package, Activity, Calculator, DollarSign, AlertTriangle } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'

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
  const [freightIncrease, setFreightIncrease] = useState(10)
  const [surchargeRate, setSurchargeRate] = useState('')
  const [surchargeCurrentDiesel, setSurchargeCurrentDiesel] = useState('')

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
      value: item.value / 1000
    }))
  }, [])

  // Process wholesale sales data
  const salesData = useMemo(() => {
    const series = censusData.categories?.['42']?.data?.sales || []
    return series.slice(-15).map(item => ({
      period: item.period.slice(5),
      value: item.value / 1000
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

  const latestSales = totalSales[totalSales.length - 1]?.value || 1
  const latestInv = totalInventories[totalInventories.length - 1]?.value || 0
  const currentRatio = latestInv / latestSales

  // Freight cost impact simulator
  const impactScenarios = [
    { revenue: 1_000_000, label: '$1M' },
    { revenue: 5_000_000, label: '$5M' },
    { revenue: 10_000_000, label: '$10M' },
  ]

  // Average freight as % of revenue for distributors: ~8-12%
  const freightPct = 0.10
  const impactResults = impactScenarios.map(s => {
    const currentFreight = s.revenue * freightPct
    const increase = currentFreight * (freightIncrease / 100)
    return {
      ...s,
      currentFreight,
      additionalCost: increase,
      newFreight: currentFreight + increase,
      marginImpact: (increase / s.revenue * 100).toFixed(2),
    }
  })

  // Surcharge calculation
  const surchargeResult = surchargeRate && surchargeCurrentDiesel
    ? (((parseFloat(surchargeCurrentDiesel) - 1.20) / parseFloat(surchargeRate)) * 100).toFixed(1)
    : null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Freight & Logistics Command Center</h2>
        </div>
        <p className="text-[#f59e0b] text-sm font-medium">
          Freight costs are {truckloadStats.change > 0 ? 'rising' : 'falling'} — here is how it hits your bottom line.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(freightData.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Truckload Freight PPI" value={truckloadStats.latest.toFixed(1)} change={truckloadStats.change} changeLabel="vs. 12 months ago" icon={Truck} />
        <MetricCard title="Wholesale Sales" value={(salesStats.latest / 1000).toFixed(1)} change={salesStats.change} changeLabel="vs. 12 months ago" icon={TrendingUp} prefix="$" suffix="B" />
        <MetricCard title="Wholesale Inventory" value={(invStats.latest / 1000).toFixed(1)} change={invStats.change} changeLabel="vs. 12 months ago" icon={Package} prefix="$" suffix="B" />
        <MetricCard title="Inventory/Sales Ratio" value={currentRatio.toFixed(2)} change={0} changeLabel="current level" icon={Activity} />
      </div>

      {/* Freight Cost Impact Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1d2e] rounded-xl border border-[#7c4dff]/30 p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-[#7c4dff]" />
          <h3 className="text-white font-semibold text-base">Freight Cost Impact Simulator</h3>
        </div>
        <p className="text-[#9ca3af] text-xs mb-5">
          If freight costs go up, here is how it affects distributors at different revenue levels (assuming 10% freight-to-revenue ratio)
        </p>

        <div className="mb-6">
          <label className="text-[#9ca3af] text-xs block mb-2">
            Freight Cost Increase: <span className="text-white font-bold text-lg">{freightIncrease}%</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={freightIncrease}
            onChange={(e) => setFreightIncrease(parseInt(e.target.value))}
            className="w-full h-2 bg-[#2a2d3e] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c4dff 0%, #7c4dff ${freightIncrease * 2}%, #2a2d3e ${freightIncrease * 2}%, #2a2d3e 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
            <span>1%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {impactResults.map(r => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f1117] rounded-lg border border-[#2a2d3e] p-4"
            >
              <div className="text-[#9ca3af] text-xs mb-1">{r.label} Revenue Distributor</div>
              <div className="text-white text-sm mb-3">
                Current freight: <span className="font-medium">${(r.currentFreight / 1000).toFixed(0)}K/yr</span>
              </div>
              <div className="text-2xl font-bold text-[#ef4444] mb-1">
                +${(r.additionalCost / 1000).toFixed(0)}K
              </div>
              <div className="text-[#9ca3af] text-xs">
                additional cost per year ({r.marginImpact}% margin impact)
              </div>
              <div className="mt-3 h-2 bg-[#2a2d3e] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(parseFloat(r.marginImpact) * 20, 100)}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: parseFloat(r.marginImpact) > 3 ? CHART_COLORS.red : parseFloat(r.marginImpact) > 1.5 ? CHART_COLORS.amber : CHART_COLORS.green
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fuel Surcharge Calculator + Freight PPI Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#7c4dff]" />
            <h3 className="text-white font-semibold text-base">Fuel Surcharge Calculator</h3>
          </div>
          <p className="text-[#9ca3af] text-xs mb-5">Calculate the recommended surcharge based on current diesel prices</p>

          <div className="space-y-4">
            <div>
              <label className="text-[#9ca3af] text-xs block mb-1.5">Your Base Rate ($/mile)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2.50"
                value={surchargeRate}
                onChange={(e) => setSurchargeRate(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#7c4dff]/50"
              />
            </div>
            <div>
              <label className="text-[#9ca3af] text-xs block mb-1.5">Current Diesel ($/gal)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3.85"
                value={surchargeCurrentDiesel}
                onChange={(e) => setSurchargeCurrentDiesel(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#7c4dff]/50"
              />
            </div>
            {surchargeResult && parseFloat(surchargeRate) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#7c4dff]/10 border border-[#7c4dff]/30 rounded-lg p-4"
              >
                <div className="text-[#9ca3af] text-xs mb-1">Recommended Surcharge</div>
                <div className="text-3xl font-bold text-[#7c4dff]">{parseFloat(surchargeResult) > 0 ? surchargeResult : '0'}%</div>
                <div className="text-[#9ca3af] text-xs mt-2">
                  Add ${(parseFloat(surchargeRate) * Math.max(0, parseFloat(surchargeResult)) / 100).toFixed(3)}/mi to your base rate
                </div>
              </motion.div>
            )}
          </div>
        </div>

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
      </div>

      {/* Sales + Inventory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Wholesale Sales Trend" subtitle="Total wholesale trade sales ($B)">
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

        <ChartCard title="Sales vs Inventory" subtitle="Tracking supply-demand balance">
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

      {/* Driver Shortage Impact */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#ef4444]/20 p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          <h3 className="text-white font-semibold text-base">What This Means for YOUR Rates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#ef4444] mb-1">284K</div>
            <div className="text-white text-sm font-medium mb-1">Driver Shortage</div>
            <div className="text-[#9ca3af] text-xs">
              Projected driver deficit by end of 2026. Fewer drivers = higher rates and longer lead times for your deliveries.
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#f59e0b] mb-1">{currentRatio.toFixed(2)}x</div>
            <div className="text-white text-sm font-medium mb-1">Inventory/Sales Ratio</div>
            <div className="text-[#9ca3af] text-xs">
              {currentRatio > 1.35
                ? 'Elevated ratio suggests slow turnover. Consider adjusting purchasing.'
                : currentRatio < 1.25
                  ? 'Lean inventory signals strong demand. Watch for stockouts.'
                  : 'Healthy range. Maintain current replenishment pace.'}
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#7c4dff] mb-1">{Math.abs(truckloadStats.change).toFixed(1)}%</div>
            <div className="text-white text-sm font-medium mb-1">Freight Cost Shift</div>
            <div className="text-[#9ca3af] text-xs">
              Truckload costs are {truckloadStats.change > 0 ? 'up' : 'down'} YoY.
              {truckloadStats.change > 5 ? ' Factor this into your delivery pricing or absorb the hit to margin.' : ' Rates are within manageable range.'}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-12 rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/10 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7c4dff]/20 blur-3xl rounded-full" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Want lane-specific rate intelligence?
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            We can map your exact shipping lanes, identify cost-saving opportunities, and give you real-time rate benchmarks for your routes.
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
