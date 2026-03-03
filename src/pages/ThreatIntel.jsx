import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, TrendingUp, Truck, Users, Lock } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CHART_COLORS = {
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#4caf50',
  orange: '#f97316',
  rose: '#f43f5e',
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

const vulnerabilityAssessment = [
  { id: 1, area: 'Local Crime Rate Awareness', weight: 10 },
  { id: 2, area: 'High-Value Asset Protection', weight: 10 },
  { id: 3, area: 'Perimeter Barriers & Fencing', weight: 10 },
  { id: 4, area: 'Entry & Access Points', weight: 10 },
  { id: 5, area: 'Lighting & Visibility', weight: 10 },
  { id: 6, area: 'Surveillance & Monitoring', weight: 10 },
  { id: 7, area: 'Landscaping & CPTED', weight: 10 },
  { id: 8, area: 'Security Guards & Patrols', weight: 10 },
  { id: 9, area: 'Alarm & Intrusion Detection', weight: 10 },
  { id: 10, area: 'Employee & Vendor Protocols', weight: 10 },
]

const fraudGrowthData = [
  { year: '2021', incidents: 239, value: 48.3 },
  { year: '2022', incidents: 956, value: 193.2 },
  { year: '2023', incidents: 1798, value: 362.1 },
  { year: '2024', incidents: 2688, value: 453.1 },
  { year: '2025', incidents: 3594, value: 725.0 },
]

const driverShortageData = [
  { label: 'Pre-2025 Shortage', value: 80000, color: CHART_COLORS.amber },
  { label: '2025 Removals', value: 10000, color: CHART_COLORS.orange },
  { label: 'Pending Removals', value: 194000, color: CHART_COLORS.red },
]

const theftLocationData = [
  { name: 'Warehouses/DCs', value: 51.9, color: CHART_COLORS.red },
  { name: 'In Transit', value: 28.3, color: CHART_COLORS.orange },
  { name: 'Retail Locations', value: 12.4, color: CHART_COLORS.amber },
  { name: 'Other', value: 7.4, color: CHART_COLORS.rose },
]

function SecurityGauge({ score, maxScore = 100 }) {
  const percentage = (score / maxScore) * 100
  const getRiskLevel = () => {
    if (percentage >= 80) return { label: 'Low Risk', color: CHART_COLORS.green, desc: 'Fortified & Proactive' }
    if (percentage >= 50) return { label: 'Moderate Risk', color: CHART_COLORS.amber, desc: 'Defensible Yet Vulnerable' }
    return { label: 'High Risk', color: CHART_COLORS.red, desc: 'Targeted, High Exposure' }
  }

  const risk = getRiskLevel()

  return (
    <div className="relative">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#2a2d3e"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={risk.color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          initial={{ strokeDasharray: '0 251' }}
          animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        {/* Center text */}
        <text x="100" y="75" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">
          {score}
        </text>
        <text x="100" y="95" textAnchor="middle" fill="#9ca3af" fontSize="12">
          / {maxScore}
        </text>
      </svg>
      <div className="text-center mt-2">
        <div className="text-lg font-bold" style={{ color: risk.color }}>
          {risk.label}
        </div>
        <div className="text-sm text-[#9ca3af]">{risk.desc}</div>
      </div>
    </div>
  )
}

function VulnerabilityChecklist() {
  const [scores, setScores] = useState(vulnerabilityAssessment.map(() => 0))

  const totalScore = scores.reduce((sum, score) => sum + score, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {vulnerabilityAssessment.map((item, idx) => (
            <div key={item.id} className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#2a2d3e] flex items-center justify-center text-xs font-bold text-[#7c4dff]">
                    {item.id}
                  </div>
                  <span className="text-white text-sm font-medium">{item.area}</span>
                </div>
                <div className="text-[#9ca3af] text-xs">
                  {scores[idx]}/{item.weight}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={item.weight}
                value={scores[idx]}
                onChange={(e) => {
                  const newScores = [...scores]
                  newScores[idx] = parseInt(e.target.value)
                  setScores(newScores)
                }}
                className="w-full h-2 bg-[#2a2d3e] rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${CHART_COLORS.amber} 0%, ${CHART_COLORS.amber} ${(scores[idx] / item.weight) * 100}%, #2a2d3e ${(scores[idx] / item.weight) * 100}%, #2a2d3e 100%)`
                }}
              />
            </div>
          ))}
        </div>
        <div className="bg-[#0f1117] rounded-lg p-6 border border-[#2a2d3e] h-fit sticky top-4">
          <h4 className="text-white font-semibold mb-4">Overall Security Score</h4>
          <SecurityGauge score={totalScore} maxScore={100} />
          <div className="mt-6 space-y-2 text-xs text-[#9ca3af]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.green }} />
              <span>80-100: Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.amber }} />
              <span>50-79: Moderate Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.red }} />
              <span>0-49: High Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThreatIntel() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-[#ef4444]" />
          <h2 className="text-xl font-bold text-white">Threat Intelligence</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Critical security risks facing warehouses and distribution centers in 2026.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Data from AMAROK Security Guide & Inbound Logistics, March 2026
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Freight Fraud Losses"
          value="35"
          change={+1500}
          changeLabel="Since 2021"
          icon={AlertTriangle}
          prefix="$"
          suffix="B"
        />
        <MetricCard
          title="Driver Shortage"
          value="284"
          change={+255}
          changeLabel="Projected 2026"
          icon={Users}
          suffix="K"
        />
        <MetricCard
          title="Annual Property Crime"
          value="7"
          change={+12}
          changeLabel="US annually"
          icon={Lock}
          suffix="M cases"
        />
        <MetricCard
          title="Avg Theft Value"
          value="274"
          change={+36}
          changeLabel="vs 2024"
          icon={TrendingUp}
          prefix="$"
          suffix="K"
        />
      </div>

      {/* Freight Fraud Crisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard
          title="Freight Fraud Crisis (2021-2025)"
          subtitle="Organized theft increased 1,500%+ with $35B annual losses"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fraudGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="incidents"
                stroke={CHART_COLORS.red}
                strokeWidth={3}
                name="Incidents"
                dot={{ fill: CHART_COLORS.red, r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.orange}
                strokeWidth={3}
                name="Losses ($M)"
                dot={{ fill: CHART_COLORS.orange, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Theft by Location Type"
          subtitle="51.9% of all cargo theft occurs at warehouses and distribution centers"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={theftLocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {theftLocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Driver Shortage Waterfall */}
      <div className="mb-8">
        <ChartCard
          title="Driver Shortage Crisis Breakdown"
          subtitle="Total projected shortage: ~284,000 drivers by end of 2026"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverShortageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {driverShortageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 10-Point Security Assessment */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#ef4444]" />
          Interactive 10-Point Vulnerability Assessment
        </h3>
        <p className="text-[#9ca3af] text-sm mb-4">
          Rate your facility on each security dimension (0-10). Based on AMAROK Security methodology.
        </p>
        <VulnerabilityChecklist />
      </div>

      {/* Critical Stats */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#ef4444]/30 p-6 mb-4">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          Critical Security Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#ef4444] mb-1">71%</div>
            <div className="text-white font-medium mb-1">Thieves Return</div>
            <div className="text-[#9ca3af] text-xs">
              71% of thieves RETURN to the same business after initial success
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#f97316] mb-1">75%</div>
            <div className="text-white font-medium mb-1">Never Recovered</div>
            <div className="text-[#9ca3af] text-xs">
              75% of stolen equipment is NEVER recovered
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#4caf50] mb-1">99%</div>
            <div className="text-white font-medium mb-1">Prevention Rate</div>
            <div className="text-[#9ca3af] text-xs">
              99% theft prevention with AMAROK's layered security approach
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#f59e0b] mb-1">$200K</div>
            <div className="text-white font-medium mb-1">Avg Cost Per Incident</div>
            <div className="text-[#9ca3af] text-xs">
              Average cost per property crime incident for businesses
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#ef4444] mb-1">97%</div>
            <div className="text-white font-medium mb-1">Truckload Most Vulnerable</div>
            <div className="text-[#9ca3af] text-xs">
              97% say truckload freight is most vulnerable to fraud
            </div>
          </div>
          <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-3xl font-bold text-[#f43f5e] mb-1">22%</div>
            <div className="text-white font-medium mb-1">Lost $200K+ in 6mo</div>
            <div className="text-[#9ca3af] text-xs">
              22% of companies lost more than $200K to fraud in just 6 months
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#ef4444]" />
          Action Items for Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Warehouses are the primary target</p>
            <p>
              51.9% of all cargo theft happens at warehouses and distribution centers. Perimeter security,
              access controls, and surveillance must be treated as mission-critical investments.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Driver shortage will get worse before it gets better</p>
            <p>
              With 194,000 non-domiciled drivers losing licenses and 4,500 training programs on warning,
              capacity will tighten significantly. Plan for higher costs and limited availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
