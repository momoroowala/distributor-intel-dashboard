import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, RefreshCw, DollarSign, ArrowUpRight, Sparkles } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import {
  BarChart, Bar, LineChart, Line, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
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

const aiFunnelData = [
  { stage: 'Testing AI Agents', value: 30, color: CHART_COLORS.purple, fill: CHART_COLORS.purple },
  { stage: 'Deploying AI Agents', value: 24, color: CHART_COLORS.cyan, fill: CHART_COLORS.cyan },
  { stage: 'Enterprise Strategy Integration', value: 21, color: CHART_COLORS.green, fill: CHART_COLORS.green },
]

const strategicPriorities = [
  { priority: 'AI/tech investment', summer2025: 58, jan2026: 71, growth: 13 },
  { priority: 'Forecasting/risk mgmt', summer2025: 48, jan2026: 62, growth: 14 },
  { priority: 'Adapting workforce', summer2025: 26, jan2026: 62, growth: 36 },
  { priority: 'Cost optimization', summer2025: 28, jan2026: 58, growth: 30 },
  { priority: 'Increasing resilience', summer2025: 29, jan2026: 53, growth: 24 },
  { priority: 'Adapting resources', summer2025: 42, jan2026: 55, growth: 13 },
]

const businessConfidence = [
  { quarter: 'Q2 2025', optimism: -2.1, continuity: -3.2 },
  { quarter: 'Q3 2025', optimism: -3.8, continuity: -4.5 },
  { quarter: 'Q4 2025', optimism: -1.2, continuity: -2.8 },
  { quarter: 'Q1 2026', optimism: 3.5, continuity: 6.6 },
]

const aiChallenges = [
  { challenge: 'Poor data quality', value: 23, color: CHART_COLORS.red },
  { challenge: 'Weak business integration', value: 21, color: CHART_COLORS.amber },
  { challenge: 'Lack of skills', value: 18, color: CHART_COLORS.purple },
  { challenge: 'Legacy systems', value: 15, color: CHART_COLORS.cyan },
]

const returnsEconomy = [
  { metric: 'Total US returns market', value: '$890B', icon: '📦', color: CHART_COLORS.purple },
  { metric: 'Untapped revenue opportunity', value: '$62.5B', icon: '💰', color: CHART_COLORS.green },
  { metric: 'Global return rate (online)', value: '30%', icon: '🔄', color: CHART_COLORS.amber },
  { metric: 'Fashion return rates', value: '50%+', icon: '👗', color: CHART_COLORS.cyan },
  { metric: 'Women\'s dresses return rate', value: '~90%', icon: '👠', color: CHART_COLORS.red },
  { metric: 'Abandon if bad return policy', value: '79%', icon: '🚫', color: CHART_COLORS.blue },
]

function AIAdoptionFunnel() {
  return (
    <div className="bg-[#0f1117] rounded-xl p-6 border border-[#2a2d3e]">
      <h4 className="text-white font-semibold mb-4">AI Agent Adoption Funnel (3,650 C-Suite Leaders)</h4>
      <div className="space-y-4">
        {aiFunnelData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: idx * 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9ca3af] text-sm">{item.stage}</span>
              <span className="text-white font-bold text-lg">{item.value}%</span>
            </div>
            <div className="relative h-12 bg-[#2a2d3e] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value * 3.33}%` }}
                transition={{ duration: 1.5, delay: idx * 0.2 }}
                className="absolute h-full flex items-center justify-end pr-4 text-white font-bold text-sm"
                style={{ backgroundColor: item.color }}
              >
                {item.value > 10 && `${item.value}% of leaders`}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-[#1a1d2e] rounded-lg p-3 border border-[#2a2d3e] text-center">
          <div className="text-2xl font-bold text-[#7c4dff]">85%</div>
          <div className="text-xs text-[#9ca3af] mt-1">Plan to increase AI spending</div>
        </div>
        <div className="bg-[#1a1d2e] rounded-lg p-3 border border-[#2a2d3e] text-center">
          <div className="text-2xl font-bold text-[#00bcd4]">69%</div>
          <div className="text-xs text-[#9ca3af] mt-1">Boosting AI for resilience</div>
        </div>
        <div className="bg-[#1a1d2e] rounded-lg p-3 border border-[#2a2d3e] text-center">
          <div className="text-2xl font-bold text-[#4caf50]">71%</div>
          <div className="text-xs text-[#9ca3af] mt-1">Seeking market independence via AI</div>
        </div>
      </div>
    </div>
  )
}

function ReturnsEconomyGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {returnsEconomy.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="bg-[#0f1117] rounded-xl p-5 border border-[#2a2d3e] hover:border-[#7c4dff]/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">{item.icon}</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
              className="text-3xl font-bold"
              style={{ color: item.color }}
            >
              {item.value}
            </motion.div>
          </div>
          <div className="text-[#9ca3af] text-sm leading-tight">
            {item.metric}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function AIPulse() {
  const [hoveredPriority, setHoveredPriority] = useState(null)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">AI Pulse</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          C-suite insights on AI adoption, strategic priorities shift, and business confidence rebound.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Accenture C-Suite Survey (3,650 leaders) & Inbound Logistics, Q1 2026
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="AI Spending Increase"
          value="85"
          change={+85}
          changeLabel="Plan to boost budget"
          icon={TrendingUp}
          suffix="%"
        />
        <MetricCard
          title="Returns Market"
          value="890"
          change={+15}
          changeLabel="US annual volume"
          icon={DollarSign}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Business Optimism"
          value="3.5"
          change={+470}
          changeLabel="QoQ rebound"
          icon={ArrowUpRight}
          prefix="+"
          suffix="%"
        />
        <MetricCard
          title="Expect Disruption"
          value="76"
          change={+8}
          changeLabel="Anticipate volatility"
          icon={RefreshCw}
          suffix="%"
        />
      </div>

      {/* AI Adoption Funnel */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7c4dff]" />
          AI Agent Adoption Pipeline
        </h3>
        <AIAdoptionFunnel />
      </div>

      {/* Strategic Priorities Shift */}
      <div className="mb-8">
        <ChartCard
          title="Strategic Priorities Growth (Summer 2025 → Jan 2026)"
          subtitle="Dramatic shifts in C-suite focus areas over 6 months"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={strategicPriorities}
              margin={{ left: 20, right: 20, bottom: 60 }}
              onMouseMove={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setHoveredPriority(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setHoveredPriority(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis
                dataKey="priority"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 80]} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar dataKey="summer2025" fill={CHART_COLORS.purple} name="Summer 2025" radius={[8, 8, 0, 0]} />
              <Bar dataKey="jan2026" fill={CHART_COLORS.cyan} name="Jan 2026" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {hoveredPriority !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-[#0f1117] rounded-lg border border-[#2a2d3e]"
            >
              <div className="text-white font-semibold">
                {strategicPriorities[hoveredPriority].priority}
              </div>
              <div className="text-[#4caf50] text-sm mt-1">
                +{strategicPriorities[hoveredPriority].growth} percentage point growth
              </div>
            </motion.div>
          )}
        </ChartCard>
      </div>

      {/* Business Confidence Rebound */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard
          title="Business Confidence Rebound (Q1 2026)"
          subtitle="First meaningful recovery after 4 quarters of decline"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={businessConfidence}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="quarter" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[-6, 8]} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="optimism"
                stroke={CHART_COLORS.purple}
                strokeWidth={3}
                name="Global Optimism Index"
                dot={{ fill: CHART_COLORS.purple, r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="continuity"
                stroke={CHART_COLORS.green}
                strokeWidth={3}
                name="Supply Chain Continuity"
                dot={{ fill: CHART_COLORS.green, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top AI Implementation Challenges"
          subtitle="What's holding back enterprise AI adoption"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={aiChallenges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" domain={[0, 30]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis dataKey="challenge" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={150} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {aiChallenges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Returns Economy */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#f59e0b]" />
          The Returns Economy
        </h3>
        <ReturnsEconomyGrid />
      </div>

      {/* Key Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4">
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#7c4dff]" />
          Critical AI & Business Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-white font-medium mb-2">AI adoption is moving fast</div>
            <div className="text-[#9ca3af] text-xs leading-relaxed">
              30% of C-suite leaders are testing AI agents, 24% are deploying them, and 21% have integrated
              them into enterprise strategy. This is not hype — AI is becoming operational infrastructure.
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-white font-medium mb-2">Workforce adaptation is now critical</div>
            <div className="text-[#9ca3af] text-xs leading-relaxed">
              "Adapting workforce" jumped from 26% to 62% priority (36-point growth). Leaders recognize
              that technology alone won't deliver results without people prepared to use it.
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-white font-medium mb-2">Data quality is the #1 AI barrier</div>
            <div className="text-[#9ca3af] text-xs leading-relaxed">
              23% cite poor data quality as the top AI challenge. Distributors can't implement AI without
              clean, structured data on inventory, orders, and customers. Garbage in, garbage out.
            </div>
          </div>

          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-white font-medium mb-2">Returns are a $62.5B opportunity</div>
            <div className="text-[#9ca3af] text-xs leading-relaxed">
              The US returns market is $890B annually with $62.5B in untapped revenue from returned goods.
              Distributors who can efficiently process, inspect, and resell returns gain competitive advantage.
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Rebound Context */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#4caf50]" />
          Q1 2026 Confidence Rebound
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">First meaningful recovery in a year</p>
            <p>
              Global Business Optimism Index rose +3.5% QoQ after 4 consecutive quarterly declines.
              Supply Chain Continuity Index jumped +6.6% QoQ, signaling leaders see stabilization ahead.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Emerging economies led the rebound</p>
            <p>
              Emerging markets drove the recovery with an 8% rise in optimism. This suggests global supply
              chains are diversifying away from traditional hubs, aligning with nearshoring trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
