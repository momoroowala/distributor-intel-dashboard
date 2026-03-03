import { useState } from 'react'
import { ShieldAlert, FileWarning, Scale } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

import fdaData from '../data/fda_recalls.json'

const COLORS = {
  purple: '#7c4dff',
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#4caf50',
}

export default function RegulatoryTrade() {
  const [filter, setFilter] = useState('all')

  const recalls = fdaData.recalls || []
  const classI = recalls.filter(r => r.classification === 'Class I')
  const classII = recalls.filter(r => r.classification === 'Class II')
  const ongoing = recalls.filter(r => r.status === 'Ongoing')

  const filtered = filter === 'all' ? recalls
    : filter === 'classI' ? classI
    : filter === 'classII' ? classII
    : ongoing

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Regulatory & Trade</h2>
        <p className="text-[#9ca3af] text-sm">FDA food recalls and regulatory compliance tracking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={ShieldAlert}
          label="Total Recalls"
          value={recalls.length}
          sub="recent filings"
          color={COLORS.red}
        />
        <MetricCard
          icon={FileWarning}
          label="Class I (Serious)"
          value={classI.length}
          sub="health hazard"
          color={COLORS.red}
        />
        <MetricCard
          icon={Scale}
          label="Class II"
          value={classII.length}
          sub="moderate risk"
          color={COLORS.amber}
        />
        <MetricCard
          icon={ShieldAlert}
          label="Ongoing"
          value={ongoing.length}
          sub="active recalls"
          color={COLORS.purple}
        />
      </div>

      <ChartCard title="FDA Food Recalls" subtitle="Recent enforcement actions">
        <div className="px-3 pb-2">
          <div className="flex gap-2 mb-4">
            {[['all', 'All'], ['classI', 'Class I'], ['classII', 'Class II'], ['ongoing', 'Ongoing']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-[#7c4dff]/30 text-[#b388ff]'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#2a2d3e]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3e]">
                  <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Date</th>
                  <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Product</th>
                  <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Reason</th>
                  <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Class</th>
                  <th className="text-left text-[#9ca3af] font-medium py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-b border-[#2a2d3e]/50 hover:bg-[#2a2d3e]/30">
                    <td className="py-2 px-2 text-[#9ca3af] text-xs whitespace-nowrap">{r.report_date}</td>
                    <td className="py-2 px-2 text-white text-xs max-w-[200px] truncate">{r.product_description}</td>
                    <td className="py-2 px-2 text-[#9ca3af] text-xs max-w-[200px] truncate">{r.reason_for_recall}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        r.classification === 'Class I' ? 'bg-red-900/50 text-red-300'
                        : r.classification === 'Class II' ? 'bg-amber-900/50 text-amber-300'
                        : 'bg-green-900/50 text-green-300'
                      }`}>
                        {r.classification}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        r.status === 'Ongoing' ? 'bg-purple-900/50 text-purple-300' : 'bg-[#2a2d3e] text-[#9ca3af]'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ChartCard>

      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5">
        <h3 className="text-white font-semibold mb-3">Tariff & Trade Watch</h3>
        <div className="space-y-3">
          {[
            { title: 'USDA Import Tariff Updates', desc: 'Monitor changes in food import duties affecting distribution margins and sourcing costs.', tag: 'Active' },
            { title: 'FDA FSMA Compliance', desc: 'Food Safety Modernization Act requirements for distributors handling perishable goods.', tag: 'Regulatory' },
            { title: 'Cross-Border Supply Chain', desc: 'Track trade policy changes impacting Mexico and Canada food product imports.', tag: 'Watch' },
          ].map((item, i) => (
            <div key={i} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#7c4dff]/20 text-[#b388ff]">{item.tag}</span>
                <span className="text-white text-sm font-medium">{item.title}</span>
              </div>
              <p className="text-[#9ca3af] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </div>
  )
}
