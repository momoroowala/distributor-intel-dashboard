import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, TrendingUp, Factory, ChevronDown, ChevronUp, Zap, Target, DollarSign } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CHART_COLORS = {
  purple: '#7c4dff',
  cyan: '#00bcd4',
  green: '#4caf50',
  amber: '#f59e0b',
  red: '#ef4444',
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

const technologies = [
  { name: 'Digital Twins', adoption: 90, companies: ['PepsiCo', 'GE Appliances'] },
  { name: 'IoT Sensors', adoption: 85, companies: ['Walmart', 'Wiliot'] },
  { name: 'AI/ML', adoption: 80, companies: ['PepsiCo', 'GE', 'Scotts'] },
  { name: 'Automation/Robotics', adoption: 75, companies: ['GE Appliances', 'Union Pacific'] },
  { name: 'ERP Systems', adoption: 95, companies: ['Nestle', 'SAP'] },
  { name: 'Traceability', adoption: 70, companies: ['Walmart'] },
]

const caseStudies = [
  {
    id: 'pepsico',
    company: 'PepsiCo',
    icon: '🥤',
    headline: '90% Issue Detection Before Build',
    metrics: [
      { label: 'Plant issues identified', value: '90%', subtext: 'Before physical changes' },
      { label: 'Throughput improvement', value: '20%', subtext: 'Factory line efficiency' },
      { label: 'CapEx reduction', value: '15%', subtext: 'Through digital twins' },
    ],
    technology: 'Digital Twins & AI',
    impact: 'PepsiCo uses Nvidia Omniverse to create digital twins of manufacturing plants. AI identifies 90% of potential design issues before making physical changes, leading to 20% improvement in factory line throughput and 15% reduction in capital expenditures.',
    color: CHART_COLORS.purple,
  },
  {
    id: 'ge',
    company: 'GE Appliances',
    icon: '🏭',
    headline: 'Downtime Cut from 20% to 5%',
    metrics: [
      { label: 'Investment', value: '$3.5B', subtext: 'In US ops since 2016' },
      { label: 'Downtime reduction', value: '75%', subtext: 'From 20% to <5%' },
      { label: 'Output time', value: '50%', subtext: 'Faster production' },
    ],
    technology: 'Digital Thread & Automation',
    impact: 'GE connected 11 manufacturing facilities with a "digital thread" that tracks every product from raw materials to delivery. Reduced downtime from 15-20% to less than 5%, and cut output time by 50%+ (products now produced in under 2 labor hours).',
    color: CHART_COLORS.cyan,
  },
  {
    id: 'walmart',
    company: 'Walmart',
    icon: '🛒',
    headline: 'IoT Scaling to 4,600 Stores',
    metrics: [
      { label: 'Current deployment', value: '500', subtext: 'Stores with sensors' },
      { label: '2026 expansion', value: '4,600', subtext: 'Stores + 40 DCs' },
      { label: 'Sensor coverage', value: '920x', subtext: 'Growth in footprint' },
    ],
    technology: 'Wiliot IoT Sensors',
    impact: 'Walmart deployed Wiliot ambient IoT sensors across 500 stores and is expanding to all 4,600 US stores plus 40 distribution centers in 2026. These battery-free sensors track inventory in real-time, dramatically improving stock visibility.',
    color: CHART_COLORS.green,
  },
  {
    id: 'scotts',
    company: 'Scotts Miracle-Gro',
    icon: '🌱',
    headline: '$150M Supply Chain Savings',
    metrics: [
      { label: 'Inventory reduction', value: '52%', subtext: '$1.3B → $627M' },
      { label: 'DC consolidation', value: '72%', subtext: '18 → 5 centers' },
      { label: 'Target savings', value: '$150M', subtext: '$75M achieved by 2025' },
    ],
    technology: 'AI Planning & Optimization',
    impact: 'Scotts cut inventory from $1.3B to $627M (targeting under $500M) and consolidated from 18 distribution centers to just 5. Using AI-powered planning tools, they achieved $75M in savings by mid-2025, targeting $150M by FY2027.',
    color: CHART_COLORS.amber,
  },
  {
    id: 'nestle',
    company: 'Nestlé',
    icon: '☕',
    headline: 'Global ERP Transformation',
    metrics: [
      { label: 'Countries deployed', value: '112', subtext: 'Global footprint' },
      { label: 'Users migrated', value: '50,000', subtext: 'Employees on S/4HANA' },
      { label: 'Job cuts', value: '16,000', subtext: '6% of workforce' },
    ],
    technology: 'SAP S/4HANA',
    impact: 'Nestlé deployed SAP S/4HANA across 112 countries to 50,000 employees, replacing legacy systems before SAP ECC support ends in 2027. The transformation is part of a major cost reduction effort that includes cutting 16,000 jobs (6% of global workforce).',
    color: CHART_COLORS.red,
  },
]

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
  const isDecimal = value.includes('.')

  useState(() => {
    let start = 0
    const end = numericValue
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [numericValue, duration])

  const suffix = value.replace(/[0-9.,]/g, '')
  const formatted = isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()
  return <span>{formatted}{suffix}</span>
}

function CaseStudyCard({ study }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] overflow-hidden hover:border-[#7c4dff]/30 transition-all"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{study.icon}</div>
            <div>
              <h3 className="text-white font-bold text-lg">{study.company}</h3>
              <p className="text-[#9ca3af] text-sm">{study.technology}</p>
            </div>
          </div>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-[#2a2d3e] hover:bg-[#3a3d4e] transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-[#7c4dff]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#9ca3af]" />
            )}
          </motion.button>
        </div>

        <div className="mb-4">
          <p className="text-white font-semibold text-base mb-3">{study.headline}</p>
          <div className="grid grid-cols-3 gap-3">
            {study.metrics.map((metric, idx) => (
              <div key={idx} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]">
                <div className="text-2xl font-bold mb-1" style={{ color: study.color }}>
                  <AnimatedCounter value={metric.value} />
                </div>
                <div className="text-xs text-[#9ca3af] leading-tight">
                  {metric.label}
                </div>
                {metric.subtext && (
                  <div className="text-xs text-[#9ca3af]/60 mt-1">{metric.subtext}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-[#2a2d3e]">
                <p className="text-[#9ca3af] text-sm leading-relaxed">{study.impact}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="h-1 origin-left"
        style={{ backgroundColor: study.color }}
      />
    </motion.div>
  )
}

export default function TechAdoption() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Technology Adoption</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          How leading manufacturers and distributors are leveraging technology to transform supply chain operations.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Data from Supply Chain Technology Adoption Report, March 2026
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="GE Investment"
          value="3.5"
          change={+85.7}
          changeLabel="$3B more planned"
          icon={Factory}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Scotts Savings"
          value="150"
          change={+50}
          changeLabel="$75M achieved"
          icon={DollarSign}
          prefix="$"
          suffix="M"
        />
        <MetricCard
          title="Walmart IoT Expansion"
          value="4,600"
          change={+820}
          changeLabel="From 500 stores"
          icon={Zap}
          suffix=" stores"
        />
        <MetricCard
          title="Returns Fraud Rate"
          value="9"
          change={+125}
          changeLabel="Growing rapidly"
          icon={TrendingUp}
          suffix="%"
        />
      </div>

      {/* Technology Adoption Chart */}
      <div className="mb-8">
        <ChartCard
          title="Technology Adoption Timeline"
          subtitle="Current adoption rates across leading supply chain companies"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={technologies} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={140} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="adoption" radius={[0, 8, 8, 0]}>
                {technologies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Case Studies */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#7c4dff]" />
          Enterprise Case Studies
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#7c4dff]" />
          Critical Insights for Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Spreadsheets are holding you back</p>
            <p>
              Companies are "still absolutely managing things on spreadsheets" before adopting new tools.
              The gap between leaders and laggards is widening rapidly as AI and IoT become table stakes.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Inventory visibility is fundamental</p>
            <p>
              "One of the hardest problems: knowing exactly what you own and where it is." GE and Scotts
              solved this with digital threads and AI planning, cutting inventory 50%+ while improving service.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Legacy ERP systems are ticking time bombs</p>
            <p>
              SAP ECC support ends in 2027. Nestle moved 50,000 employees across 112 countries to S/4HANA.
              Distributors on legacy systems must plan migrations now or face operational disruption.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Returns fraud is exploding</p>
            <p>
              9% of all returns are fraudulent and growing. UPS Happy Returns prevents $218 in losses per
              flagged return. Distributors need better detection systems to protect margins.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
