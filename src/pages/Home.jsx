import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target, TrendingUp, TrendingDown, Truck, Package, AlertTriangle,
  ArrowRight, DollarSign, Fuel, Activity, Shield, Users,
  Upload, BarChart3, Phone, Quote, Linkedin, ExternalLink
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

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
          Your Customers Are Leaving.<br />
          <span className="text-[#7c4dff]">We Show You Which Ones.</span>
        </h1>
        <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mb-3">
          Upload your order history. In 60 seconds, see which accounts need attention Monday morning,
          how much revenue is at risk, and exactly who to call first.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/customer-scanner"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-base transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40"
          >
            <Target className="w-5 h-5" />
            Scan Your Customer Health
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://deeplineoperations.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#1a1d2e] border border-[#2a2d3e] hover:border-[#7c4dff]/50 text-white font-medium text-base transition-all"
          >
            <Phone className="w-4 h-4" />
            Book a Free 20-Minute Diagnostic
            <ExternalLink className="w-4 h-4 text-[#9ca3af]" />
          </a>
        </div>
      </motion.div>

      {/* ── Alert Cards ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          This Week&apos;s Market Alerts
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

      {/* ── Case Study / Social Proof ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <div className="bg-[#1a1d2e] rounded-2xl border border-[#7c4dff]/20 p-8 relative overflow-hidden">
          <div className="absolute top-4 left-6 opacity-10">
            <Quote className="w-16 h-16 text-[#7c4dff]" />
          </div>
          <div className="relative">
            <p className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider mb-3">Real Result</p>
            <p className="text-white text-lg sm:text-xl leading-relaxed mb-4">
              A <span className="text-[#7c4dff] font-semibold">$28M food distributor</span> in the Northeast had
              31 accounts that hadn&apos;t ordered in 60+ days. They didn&apos;t know.
            </p>
            <p className="text-[#9ca3af] text-base leading-relaxed mb-4">
              We found <span className="text-[#f59e0b] font-semibold">$187K in at-risk revenue</span> in under 48 hours.
              They recovered <span className="text-[#4caf50] font-semibold">$94K in the first quarter</span>.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-[#9ca3af]">31 dormant accounts found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-[#9ca3af]">$187K at risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4caf50]" />
                <span className="text-[#9ca3af]">$94K recovered</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <h3 className="text-white font-semibold text-lg mb-5 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Upload,
              step: '1',
              title: 'Upload your QuickBooks export (CSV)',
              desc: 'Export your Sales by Customer Detail report and drop the CSV here.',
            },
            {
              icon: BarChart3,
              step: '2',
              title: 'We analyze recency, frequency, and spend patterns',
              desc: 'Our RFM engine scores every customer and identifies who\'s slipping.',
            },
            {
              icon: Phone,
              step: '3',
              title: 'Get your Monday call list with specific accounts and talking points',
              desc: 'Know exactly who to call, why, and what to say — sorted by revenue impact.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 text-center relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#7c4dff] flex items-center justify-center text-white text-xs font-bold">
                {item.step}
              </div>
              <item.icon className="w-8 h-8 text-[#7c4dff] mx-auto mb-3 mt-2" />
              <h4 className="text-white font-semibold text-sm mb-2">{item.title}</h4>
              <p className="text-[#9ca3af] text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/customer-scanner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-sm transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40"
          >
            Try It Now — Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* ── About Mo / Deepline Operations ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-10"
      >
        <div className="bg-[#1a1d2e] rounded-2xl border border-[#2a2d3e] p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#7c4dff]/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-[#7c4dff]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Built by Mo Roowala</h3>
              <p className="text-[#9ca3af] text-xs">Deepline Operations</p>
            </div>
          </div>
          <div className="text-[#9ca3af] text-sm leading-relaxed space-y-3">
            <p>
              I spent years watching distributors lose customers they didn&apos;t know were leaving.
              The data was always there, buried in QuickBooks exports and spreadsheets nobody
              had time to analyze.
            </p>
            <p>
              So I built the tools to do it automatically.
            </p>
            <p>
              Deepline Operations works exclusively with mid-size distributors ($5M–$100M)
              who run on QuickBooks and spreadsheets. We turn your existing customer data into
              weekly action plans: which accounts are slipping, which reps need to call whom,
              and where your margins are eroding.
            </p>
            <p className="text-white font-medium">
              No ERP overhaul. No 18-month implementation. Just your data, analyzed weekly,
              delivered as a Monday morning call list your team actually uses.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <a
              href="https://deeplineoperations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-medium text-sm transition-all"
            >
              Book a Call
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f1117] border border-[#2a2d3e] hover:border-[#7c4dff]/50 text-[#9ca3af] hover:text-white text-sm transition-all"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Data attribution ──────────────────────────────────────────── */}
      <p className="text-[#9ca3af]/40 text-xs text-center">
        Market data from BLS, FRED, Census Bureau & EIA | Updated {new Date(blsData.updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
