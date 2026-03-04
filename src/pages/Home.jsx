import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target, TrendingUp, TrendingDown, Truck, Package, AlertTriangle,
  ArrowRight, DollarSign, Fuel, Activity, Shield, Users
} from 'lucide-react'

import blsData from '../data/bls_ppi.json'
import fredData from '../data/fred_indicators.json'
import freightData from '../../data/freight_macro.json'
import censusData from '../../data/census_wholesale.json'

function getLatestChange(series) {
  if (!series || series.length < 2) return { latest: 0, change: 0 }
  const latest = series[series.length - 1].value
  const prev = series[series.length - 13]?.value || series[0].value
  const change = ((latest - prev) / prev) * 100
  return { latest, change }
}

export default function Home() {
  const ppiStats = getLatestChange(blsData.data['All Commodities'] || [])
  const dieselArr = fredData.data['Diesel Fuel Price'] || []
  const dieselStats = getLatestChange(dieselArr)
  const cpiArr = fredData.data['Consumer Price Index'] || []
  const cpiStats = getLatestChange(cpiArr)

  const truckloadSeries = freightData.freight_indicators?.['WPUFD4111']?.data || []
  const truckloadStats = getLatestChange(truckloadSeries)

  const totalSales = censusData.categories?.['42']?.data?.sales || []
  const salesStats = getLatestChange(totalSales)

  const alerts = useMemo(() => {
    const items = []

    if (dieselStats.change > 3) {
      items.push({
        severity: 'high',
        icon: Fuel,
        title: 'Diesel Prices Spiking',
        detail: `Up ${dieselStats.change.toFixed(1)}% YoY at $${dieselStats.latest.toFixed(2)}/gal. Review your fuel surcharges.`,
        link: '/market',
        linkText: 'Open Surcharge Calculator',
        color: '#ef4444',
      })
    } else if (dieselStats.change > 0) {
      items.push({
        severity: 'medium',
        icon: Fuel,
        title: `Diesel at $${dieselStats.latest.toFixed(2)}/gal`,
        detail: `${dieselStats.change > 0 ? 'Up' : 'Down'} ${Math.abs(dieselStats.change).toFixed(1)}% from last year. Monitor surcharge thresholds.`,
        link: '/market',
        linkText: 'Check Rates',
        color: '#f59e0b',
      })
    }

    if (Math.abs(ppiStats.change) > 1.5) {
      items.push({
        severity: ppiStats.change > 3 ? 'high' : 'medium',
        icon: TrendingUp,
        title: `Producer Prices ${ppiStats.change > 0 ? 'Rising' : 'Falling'}`,
        detail: `PPI shifted ${ppiStats.change > 0 ? '+' : ''}${ppiStats.change.toFixed(1)}% YoY. ${ppiStats.change > 2 ? 'Time to adjust customer pricing.' : 'Negotiate better supplier terms.'}`,
        link: '/market',
        linkText: 'View PPI Trends',
        color: ppiStats.change > 3 ? '#ef4444' : '#f59e0b',
      })
    }

    if (Math.abs(truckloadStats.change) > 2) {
      items.push({
        severity: truckloadStats.change > 5 ? 'high' : 'medium',
        icon: Truck,
        title: `Freight Costs ${truckloadStats.change > 0 ? 'Up' : 'Down'} ${Math.abs(truckloadStats.change).toFixed(1)}%`,
        detail: truckloadStats.change > 0
          ? 'Rising freight eats into margin. Model the impact on your routes.'
          : 'Favorable freight environment. Lock in rates where possible.',
        link: '/freight',
        linkText: 'Model Impact',
        color: truckloadStats.change > 5 ? '#ef4444' : '#f59e0b',
      })
    }

    if (cpiStats.change > 3) {
      items.push({
        severity: 'medium',
        icon: DollarSign,
        title: 'Consumer Inflation Elevated',
        detail: `CPI at ${cpiStats.latest.toFixed(1)} — customers feel the squeeze. Be strategic with price increases.`,
        link: '/market',
        linkText: 'View CPI Data',
        color: '#f59e0b',
      })
    }

    // Always show at least one positive/neutral item
    if (items.length < 3) {
      items.push({
        severity: 'info',
        icon: Package,
        title: `Wholesale Sales: $${(salesStats.latest / 1000).toFixed(1)}B`,
        detail: `${salesStats.change > 0 ? 'Up' : 'Down'} ${Math.abs(salesStats.change).toFixed(1)}% YoY. The market is ${salesStats.change > 0 ? 'growing' : 'contracting'}.`,
        link: '/industry',
        linkText: 'Industry Breakdown',
        color: salesStats.change > 0 ? '#4caf50' : '#f59e0b',
      })
    }

    return items.slice(0, 4)
  }, [dieselStats, ppiStats, truckloadStats, cpiStats, salesStats])

  const quickStats = [
    { label: 'Diesel Price', value: `$${dieselStats.latest.toFixed(2)}`, suffix: '/gal', change: dieselStats.change, icon: Fuel },
    { label: 'Producer Prices', value: ppiStats.latest.toFixed(1), suffix: ' PPI', change: ppiStats.change, icon: TrendingUp },
    { label: 'Freight Index', value: truckloadStats.latest.toFixed(1), suffix: '', change: truckloadStats.change, icon: Truck },
    { label: 'Wholesale Sales', value: `$${(salesStats.latest / 1000).toFixed(1)}`, suffix: 'B', change: salesStats.change, icon: Activity },
  ]

  return (
    <div>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Distribution Command Center</h2>
        </div>
        <p className="text-[#f59e0b] text-sm font-medium">
          See what's happening in distribution this week and find the revenue you're leaving on the table.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Data from BLS, FRED, Census Bureau & EIA | Updated {new Date(blsData.updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-[#7c4dff]" />
              <span className="text-[#9ca3af] text-xs">{stat.label}</span>
            </div>
            <div className="text-white text-xl font-bold">
              {stat.value}<span className="text-sm font-normal text-[#9ca3af]">{stat.suffix}</span>
            </div>
            <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${
              stat.change > 0 ? 'text-[#ef4444]' : stat.change < 0 ? 'text-[#4caf50]' : 'text-[#9ca3af]'
            }`}>
              {stat.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}% YoY
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          This Week's Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-[#1a1d2e] rounded-xl border p-5"
              style={{ borderColor: alert.color + '40' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: alert.color + '20' }}>
                  <alert.icon className="w-4 h-4" style={{ color: alert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-[#9ca3af] text-xs mb-3">{alert.detail}</p>
                  <Link
                    to={alert.link}
                    className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: alert.color }}
                  >
                    {alert.linkText}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Customer Health Scanner CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/15 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden mb-8"
      >
        <div className="absolute top-0 left-1/3 w-72 h-24 bg-[#7c4dff]/20 blur-3xl rounded-full" />
        <div className="relative px-6 py-10 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#7c4dff]" />
                <span className="text-[#7c4dff] text-xs font-semibold uppercase tracking-wider">Featured Tool</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Customer Health Scanner
              </h3>
              <p className="text-[#9ca3af] text-sm mb-4">
                Upload your order history CSV and instantly find which customers are slipping away,
                how much ghost revenue you're losing, and exactly who to call Monday morning.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#4caf50]" />
                  100% browser-based
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#7c4dff]" />
                  RFM segmentation
                </span>
              </div>
            </div>
            <Link
              to="/customer-scanner"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-base transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40 flex-shrink-0"
            >
              Scan Your Customers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Nav Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { to: '/market', icon: TrendingUp, title: 'Market Overview', desc: 'PPI trends, diesel prices, and surcharge calculator', color: '#7c4dff' },
          { to: '/freight', icon: Truck, title: 'Freight & Logistics', desc: 'Cost impact simulator and freight rate trends', color: '#f59e0b' },
          { to: '/food-beverage', icon: Package, title: 'Food & Beverage', desc: 'Category-specific trends and pricing signals', color: '#4caf50' },
          { to: '/industry', icon: Activity, title: 'Industry Deep Dive', desc: 'Category breakdown, employment, and competitive landscape', color: '#2196f3' },
          { to: '/regional', icon: TrendingUp, title: 'Regional Analysis', desc: 'State-by-state distribution data and market concentration', color: '#00bcd4' },
          { to: '/threats', icon: Shield, title: 'Risk & Security', desc: 'Cargo theft trends and vulnerability assessment', color: '#ef4444' },
        ].map((nav, i) => (
          <motion.div
            key={nav.to}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.05 }}
          >
            <Link
              to={nav.to}
              className="block bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5 hover:border-[#7c4dff]/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: nav.color + '20' }}>
                  <nav.icon className="w-4 h-4" style={{ color: nav.color }} />
                </div>
                <h4 className="text-white font-medium text-sm group-hover:text-[#7c4dff] transition-colors">{nav.title}</h4>
              </div>
              <p className="text-[#9ca3af] text-xs">{nav.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
