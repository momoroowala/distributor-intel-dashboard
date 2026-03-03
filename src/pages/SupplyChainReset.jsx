import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, TrendingUp, Target, AlertCircle, Package, MapPin } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CHART_COLORS = {
  purple: '#7c4dff',
  cyan: '#00bcd4',
  green: '#4caf50',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#2196f3',
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

const nearshoringDrivers = [
  { driver: 'Faster delivery', value: 52, color: CHART_COLORS.purple },
  { driver: 'Quality control', value: 44, color: CHART_COLORS.cyan },
  { driver: 'ESG & ethical labor', value: 37, color: CHART_COLORS.green },
  { driver: 'Conflict/pandemic risk', value: 37, color: CHART_COLORS.amber },
  { driver: 'Tariff volatility', value: 33, color: CHART_COLORS.red },
  { driver: 'Rising Asia freight costs', value: 33, color: CHART_COLORS.blue },
]

const readinessGapData = [
  {
    metric: 'Nearshoring Belief',
    belief: 72,
    readiness: 21,
    gap: 51,
  },
]

const barrierData = [
  { name: 'Upfront costs', value: 91 },
  { name: 'Procurement resistance', value: 48 },
  { name: 'Capital constraints', value: 46 },
  { name: 'IT alignment struggles', value: 84 },
  { name: 'Weak visibility tools', value: 55 },
  { name: '3PL customs gaps', value: 47 },
]

const tariffImpact = [
  { name: 'Accelerated decisions', value: 94, color: CHART_COLORS.purple },
  { name: 'Supplier geography review', value: 91, color: CHART_COLORS.cyan },
  { name: 'Buffer inventory increase', value: 93, color: CHART_COLORS.amber },
]

const threepl = [
  { name: 'High confidence', value: 58 },
  { name: 'Restructuring by 2026', value: 84 },
  { name: 'Local 3PL adaptability', value: 91 },
  { name: 'Executive alignment pivotal', value: 90 },
]

function GapAnalysisVisual() {
  return (
    <div className="bg-[#0f1117] rounded-xl p-6 border border-[#2a2d3e]">
      <h4 className="text-white font-semibold mb-6 text-center">The 51-Point Readiness Gap</h4>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3"
            style={{ backgroundColor: CHART_COLORS.green }}
          >
            72%
          </motion.div>
          <div className="text-white font-medium">Believe nearshoring improves delivery</div>
          <div className="text-[#9ca3af] text-sm mt-1">Confidence is high</div>
        </div>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3"
            style={{ backgroundColor: CHART_COLORS.red }}
          >
            21%
          </motion.div>
          <div className="text-white font-medium">Say network is ready</div>
          <div className="text-[#9ca3af] text-sm mt-1">Infrastructure lags</div>
        </div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl origin-left"
        style={{ backgroundColor: CHART_COLORS.amber }}
      >
        51 PERCENTAGE POINT DISCONNECT
      </motion.div>

      <div className="mt-4 text-center text-[#9ca3af] text-sm">
        Leaders believe in nearshoring, but logistics networks are not equipped for regional fulfillment
      </div>
    </div>
  )
}

function InteractiveDonutChart({ title, data, centerLabel }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const activeData = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className="bg-[#0f1117] rounded-xl p-6 border border-[#2a2d3e]">
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS.purple}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {activeData ? (
              <>
                <div className="text-3xl font-bold text-white">{activeData.value}%</div>
                <div className="text-xs text-[#9ca3af] max-w-[100px] mx-auto">
                  {activeData.name || activeData.driver}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-white">{centerLabel}</div>
                <div className="text-xs text-[#9ca3af]">Leaders</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm cursor-pointer hover:bg-[#1a1d2e] p-2 rounded transition-colors"
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || CHART_COLORS.purple }}
              />
              <span className="text-[#9ca3af]">{item.name || item.driver}</span>
            </div>
            <span className="text-white font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SupplyChainReset() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Supply Chain Reset</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          250 supply chain leaders on tariffs, nearshoring, and the massive readiness gap.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          WSI Supply Chain Network Reset Playbook, March 2026
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Tariff-Driven Decisions"
          value="94"
          change={+94}
          changeLabel="Accelerated planning"
          icon={TrendingUp}
          suffix="%"
        />
        <MetricCard
          title="Nearshoring Intent"
          value="87"
          change={+87}
          changeLabel="Within 24 months"
          icon={MapPin}
          suffix="%"
        />
        <MetricCard
          title="Readiness Gap"
          value="51"
          change={-51}
          changeLabel="pts disconnect"
          icon={AlertCircle}
          suffix=" pts"
        />
        <MetricCard
          title="3PL Restructuring"
          value="84"
          change={+84}
          changeLabel="By end of 2026"
          icon={Package}
          suffix="%"
        />
      </div>

      {/* Gap Analysis */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#f59e0b]" />
          The Belief-Readiness Disconnect
        </h3>
        <GapAnalysisVisual />
      </div>

      {/* Tariff Impact & Nearshoring Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <InteractiveDonutChart
          title="Tariff Impact on Supply Chain Strategy"
          data={tariffImpact}
          centerLabel="250"
        />

        <ChartCard
          title="Top Drivers of Nearshoring Interest"
          subtitle="Percentage of supply chain leaders citing each factor"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={nearshoringDrivers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" domain={[0, 60]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis dataKey="driver" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={160} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {nearshoringDrivers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Barriers & 3PL Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard
          title="Top Barriers to Nearshoring/Reshoring"
          subtitle="Key challenges cited by supply chain leaders"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barrierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill={CHART_COLORS.red} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="3PL Partnership Outlook"
          subtitle="Confidence and restructuring plans for 2026"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={threepl}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill={CHART_COLORS.cyan} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Key Insights Grid */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4">
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#7c4dff]" />
          WSI Survey Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#7c4dff] mb-2">87%</div>
            <div className="text-white font-medium mb-1">Piloting nearshoring</div>
            <div className="text-[#9ca3af] text-xs">
              Intend to pilot Mexico/Central America nearshoring within 24 months
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#00bcd4] mb-2">93%</div>
            <div className="text-white font-medium mb-1">Exploring US reshoring</div>
            <div className="text-[#9ca3af] text-xs">
              Actively exploring reshoring to US manufacturers
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#4caf50] mb-2">89%</div>
            <div className="text-white font-medium mb-1">Brand trust essential</div>
            <div className="text-[#9ca3af] text-xs">
              Believe moving supply chains closer is essential for long-term brand trust
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#ef4444] mb-2">84%</div>
            <div className="text-white font-medium mb-1">IT alignment struggles</div>
            <div className="text-[#9ca3af] text-xs">
              Struggle to align IT systems for multi-node fulfillment
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#f59e0b] mb-2">55%</div>
            <div className="text-white font-medium mb-1">Weak visibility tools</div>
            <div className="text-[#9ca3af] text-xs">
              Cite weak visibility tools among logistics providers
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-2xl font-bold text-[#2196f3] mb-2">91%</div>
            <div className="text-white font-medium mb-1">Local 3PL adaptability</div>
            <div className="text-[#9ca3af] text-xs">
              Report that local 3PL partnerships enable rapid adaptability
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#7c4dff]" />
          What This Means for Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Tariff volatility is permanent</p>
            <p>
              94% say tariffs accelerated decision-making. The era of stable, predictable trade policy is over.
              Distributors must build flexibility into their networks, not optimize for lowest cost alone.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">The 51-point gap is a warning sign</p>
            <p>
              72% believe nearshoring improves delivery, but only 21% say their network is ready. This gap
              creates opportunity for distributors who invest now in regional fulfillment capabilities.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">3PL partnerships will be restructured</p>
            <p>
              84% anticipate restructuring 3PL relationships by end of 2026. Distributors should evaluate
              partners on multi-node experience, customs expertise, and technology integration capabilities.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">IT systems are the hidden bottleneck</p>
            <p>
              84% struggle to align IT for multi-node fulfillment. Safety stock is masking poor network design.
              Technology investment is not optional for regional fulfillment strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
