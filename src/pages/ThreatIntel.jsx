import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, TrendingUp, Truck, Users, Lock, Award, Printer, ChevronDown, ChevronUp } from 'lucide-react'
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
  { id: 1, area: 'Local Crime Rate Awareness', weight: 10, tip: 'Do you know your area crime stats and adjust security accordingly?' },
  { id: 2, area: 'High-Value Asset Protection', weight: 10, tip: 'Are high-value items secured in locked areas with restricted access?' },
  { id: 3, area: 'Perimeter Barriers & Fencing', weight: 10, tip: 'Is your property fully fenced with anti-climb measures?' },
  { id: 4, area: 'Entry & Access Points', weight: 10, tip: 'Are all entry points controlled with badges, codes, or guards?' },
  { id: 5, area: 'Lighting & Visibility', weight: 10, tip: 'Is the entire perimeter and parking area well-lit at night?' },
  { id: 6, area: 'Surveillance & Monitoring', weight: 10, tip: 'Do you have cameras with 24/7 monitoring and 30+ day retention?' },
  { id: 7, area: 'Landscaping & CPTED', weight: 10, tip: 'Is vegetation trimmed to eliminate hiding spots near the building?' },
  { id: 8, area: 'Security Guards & Patrols', weight: 10, tip: 'Do you have on-site or roving security during off-hours?' },
  { id: 9, area: 'Alarm & Intrusion Detection', weight: 10, tip: 'Is your alarm system tested monthly with rapid response protocol?' },
  { id: 10, area: 'Employee & Vendor Protocols', weight: 10, tip: 'Are background checks, ID verification, and visitor logs enforced?' },
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
    if (percentage >= 80) return { label: 'Low Risk', color: CHART_COLORS.green, desc: 'Fortified & Proactive', emoji: 'A' }
    if (percentage >= 60) return { label: 'Moderate Risk', color: CHART_COLORS.amber, desc: 'Defensible Yet Vulnerable', emoji: 'B' }
    if (percentage >= 40) return { label: 'Elevated Risk', color: CHART_COLORS.orange, desc: 'Significant Gaps', emoji: 'C' }
    return { label: 'High Risk', color: CHART_COLORS.red, desc: 'Targeted, High Exposure', emoji: 'D' }
  }

  const risk = getRiskLevel()

  return (
    <div className="relative">
      <svg viewBox="0 0 200 120" className="w-full">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2a2d3e" strokeWidth="20" strokeLinecap="round" />
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
        <text x="100" y="75" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">{score}</text>
        <text x="100" y="95" textAnchor="middle" fill="#9ca3af" fontSize="12">/ {maxScore}</text>
      </svg>
      <div className="text-center mt-2">
        <div className="text-lg font-bold" style={{ color: risk.color }}>{risk.label}</div>
        <div className="text-sm text-[#9ca3af]">{risk.desc}</div>
      </div>
    </div>
  )
}

function VulnerabilityChecklist() {
  const [scores, setScores] = useState(vulnerabilityAssessment.map(() => 0))
  const [showBadge, setShowBadge] = useState(false)
  const [expandedTip, setExpandedTip] = useState(null)
  const printRef = useRef(null)

  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const completedItems = scores.filter(s => s > 0).length
  const progressPct = (completedItems / vulnerabilityAssessment.length) * 100
  const allCompleted = completedItems === vulnerabilityAssessment.length

  const getRiskGrade = () => {
    if (totalScore >= 80) return { grade: 'A', label: 'Excellent', color: CHART_COLORS.green }
    if (totalScore >= 60) return { grade: 'B', label: 'Good', color: CHART_COLORS.amber }
    if (totalScore >= 40) return { grade: 'C', label: 'Needs Work', color: CHART_COLORS.orange }
    return { grade: 'D', label: 'Critical', color: CHART_COLORS.red }
  }

  const riskGrade = getRiskGrade()

  const handlePrint = useCallback(() => {
    const printContent = `
      <html>
        <head>
          <title>Security Assessment Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1d2e; margin-bottom: 5px; }
            .subtitle { color: #666; margin-bottom: 30px; }
            .grade-badge { display: inline-block; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; font-size: 28px; font-weight: bold; color: white; margin-right: 15px; }
            .score-header { display: flex; align-items: center; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .item-name { font-weight: 500; }
            .item-score { font-weight: bold; }
            .footer { margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Facility Security Assessment</h1>
          <p class="subtitle">Generated ${new Date().toLocaleDateString()}</p>
          <div class="score-header">
            <div class="grade-badge" style="background:${riskGrade.color}">${riskGrade.grade}</div>
            <div>
              <div style="font-size:24px;font-weight:bold">${totalScore} / 100</div>
              <div style="color:#666">${riskGrade.label} — ${totalScore >= 80 ? 'Low Risk' : totalScore >= 60 ? 'Moderate Risk' : totalScore >= 40 ? 'Elevated Risk' : 'High Risk'}</div>
            </div>
          </div>
          ${vulnerabilityAssessment.map((item, idx) => `
            <div class="item">
              <span class="item-name">${item.id}. ${item.area}</span>
              <span class="item-score">${scores[idx]} / ${item.weight}</span>
            </div>
          `).join('')}
          <div class="footer">
            <p>Assessment based on AMAROK Security methodology. Deepline Operations.</p>
          </div>
        </body>
      </html>
    `
    const win = window.open('', '_blank')
    win.document.write(printContent)
    win.document.close()
    win.print()
  }, [scores, totalScore, riskGrade])

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">Assessment Progress</span>
          <span className="text-[#9ca3af] text-sm">{completedItems} / {vulnerabilityAssessment.length} areas rated</span>
        </div>
        <div className="h-3 bg-[#2a2d3e] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#7c4dff] to-[#b388ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {allCompleted && !showBadge && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowBadge(true)}
            className="mt-3 w-full py-2 rounded-lg bg-[#7c4dff]/20 border border-[#7c4dff]/30 text-[#7c4dff] text-sm font-medium hover:bg-[#7c4dff]/30 transition-all"
          >
            View Your Score Badge
          </motion.button>
        )}
      </div>

      {/* Score Badge (shown when all completed and button clicked) */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-br from-[#1a1d2e] to-[#0f1117] rounded-2xl border-2 p-8 text-center"
            style={{ borderColor: riskGrade.color }}
          >
            <Award className="w-12 h-12 mx-auto mb-3" style={{ color: riskGrade.color }} />
            <div
              className="text-6xl font-black mb-2"
              style={{ color: riskGrade.color }}
            >
              {riskGrade.grade}
            </div>
            <div className="text-white text-lg font-bold mb-1">{totalScore} / 100</div>
            <div className="text-[#9ca3af] text-sm mb-4">{riskGrade.label} Security Posture</div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2d3e] text-white text-sm hover:bg-[#3a3d4e] transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {vulnerabilityAssessment.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0f1117] rounded-lg p-4 border border-[#2a2d3e]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    scores[idx] >= 8 ? 'bg-[#4caf50]/20 text-[#4caf50]' :
                    scores[idx] >= 5 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    scores[idx] > 0 ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                    'bg-[#2a2d3e] text-[#7c4dff]'
                  }`}>
                    {scores[idx] > 0 ? scores[idx] : item.id}
                  </div>
                  <button
                    className="text-white text-sm font-medium text-left hover:text-[#7c4dff] transition-colors"
                    onClick={() => setExpandedTip(expandedTip === idx ? null : idx)}
                  >
                    {item.area}
                    {expandedTip === idx
                      ? <ChevronUp className="w-3 h-3 inline ml-1 text-[#9ca3af]" />
                      : <ChevronDown className="w-3 h-3 inline ml-1 text-[#9ca3af]" />
                    }
                  </button>
                </div>
                <div className="text-[#9ca3af] text-xs">{scores[idx]}/{item.weight}</div>
              </div>
              <AnimatePresence>
                {expandedTip === idx && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[#9ca3af] text-xs mb-3 pl-8 overflow-hidden"
                  >
                    {item.tip}
                  </motion.p>
                )}
              </AnimatePresence>
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
                className="w-full h-2 bg-[#2a2d3e] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    scores[idx] >= 8 ? CHART_COLORS.green :
                    scores[idx] >= 5 ? CHART_COLORS.amber : CHART_COLORS.red
                  } 0%, ${
                    scores[idx] >= 8 ? CHART_COLORS.green :
                    scores[idx] >= 5 ? CHART_COLORS.amber : CHART_COLORS.red
                  } ${(scores[idx] / item.weight) * 100}%, #2a2d3e ${(scores[idx] / item.weight) * 100}%, #2a2d3e 100%)`
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Score panel */}
        <div className="bg-[#0f1117] rounded-lg p-6 border border-[#2a2d3e] h-fit sticky top-4">
          <h4 className="text-white font-semibold mb-4">Overall Security Score</h4>
          <SecurityGauge score={totalScore} maxScore={100} />
          <div className="mt-6 space-y-2 text-xs text-[#9ca3af]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.green }} />
              <span>80-100: Low Risk (Grade A)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.amber }} />
              <span>60-79: Moderate Risk (Grade B)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.orange }} />
              <span>40-59: Elevated Risk (Grade C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.red }} />
              <span>0-39: High Risk (Grade D)</span>
            </div>
          </div>
          {totalScore > 0 && (
            <button
              onClick={handlePrint}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#2a2d3e] text-white text-sm hover:bg-[#3a3d4e] transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ThreatIntel() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-[#ef4444]" />
          <h2 className="text-xl font-bold text-white">Risk & Security Center</h2>
        </div>
        <p className="text-[#ef4444] text-sm font-medium">
          Warehouse theft is up 1,500% since 2021. Is your facility protected?
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Data from AMAROK Security Guide & Inbound Logistics, March 2026
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Freight Fraud Losses" value="35" change={+1500} changeLabel="Since 2021" icon={AlertTriangle} prefix="$" suffix="B" />
        <MetricCard title="Driver Shortage" value="284" change={+255} changeLabel="Projected 2026" icon={Users} suffix="K" />
        <MetricCard title="Annual Property Crime" value="7" change={+12} changeLabel="US annually" icon={Lock} suffix="M cases" />
        <MetricCard title="Avg Theft Value" value="274" change={+36} changeLabel="vs 2024" icon={TrendingUp} prefix="$" suffix="K" />
      </div>

      {/* Freight Fraud + Theft Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard title="Freight Fraud Crisis (2021-2025)" subtitle="Organized theft increased 1,500%+ with $35B annual losses">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fraudGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line yAxisId="left" type="monotone" dataKey="incidents" stroke={CHART_COLORS.red} strokeWidth={3} name="Incidents" dot={{ fill: CHART_COLORS.red, r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke={CHART_COLORS.orange} strokeWidth={3} name="Losses ($M)" dot={{ fill: CHART_COLORS.orange, r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Theft by Location Type" subtitle="51.9% of all cargo theft occurs at warehouses and distribution centers">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={theftLocationData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={90} fill="#8884d8" dataKey="value">
                {theftLocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Driver Shortage */}
      <div className="mb-8">
        <ChartCard title="Driver Shortage Crisis Breakdown" subtitle="Total projected shortage: ~284,000 drivers by end of 2026">
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

      {/* Critical Stats - Consolidated Story */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#ef4444]/30 p-6 mb-8">
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          The Security Reality for Distributors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { stat: '71%', label: 'Thieves Return', color: CHART_COLORS.red },
            { stat: '75%', label: 'Never Recovered', color: CHART_COLORS.orange },
            { stat: '99%', label: 'Prevention Rate', color: CHART_COLORS.green },
            { stat: '$200K', label: 'Avg Cost/Incident', color: CHART_COLORS.amber },
            { stat: '97%', label: 'Truckload Vulnerable', color: CHART_COLORS.red },
            { stat: '22%', label: 'Lost $200K+ in 6mo', color: CHART_COLORS.rose },
          ].map(item => (
            <div key={item.label} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]">
              <div className="text-2xl font-bold mb-0.5" style={{ color: item.color }}>{item.stat}</div>
              <div className="text-[#9ca3af] text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 10-Point Security Assessment (Gameified) */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#7c4dff]" />
          Interactive Security Assessment
        </h3>
        <p className="text-[#9ca3af] text-sm mb-4">
          Rate your facility on each dimension. Complete all 10 areas to unlock your security grade badge.
        </p>
        <VulnerabilityChecklist />
      </div>

      {/* Action Items */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#ef4444]" />
          Action Items for Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Warehouses are the primary target</p>
            <p>51.9% of all cargo theft happens at warehouses. Perimeter security, access controls, and surveillance must be treated as mission-critical.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Driver shortage will raise your rates</p>
            <p>With 194,000 drivers losing licenses, capacity will tighten significantly. Budget for 15-25% higher freight costs in 2026.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-12 rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/10 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7c4dff]/20 blur-3xl rounded-full" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Want a professional security audit?
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            We partner with AMAROK-certified security consultants to perform on-site assessments
            and recommend the most cost-effective protection for your facility.
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
