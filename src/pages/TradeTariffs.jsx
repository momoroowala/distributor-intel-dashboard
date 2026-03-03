import { useMemo } from 'react'
import { Shield, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

// Import data from root data folder
import tariffData from '../../data/trade_tariffs.json'

const CHART_COLORS = {
  purple: '#7c4dff',
  purpleLight: '#b388ff',
  green: '#4caf50',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#2196f3',
  cyan: '#00bcd4',
}

export default function TradeTariffs() {
  const tariffChanges = tariffData.tariff_changes || []
  const upcomingChanges = tariffChanges.filter(t => new Date(t.date) > new Date())
  const recentChanges = tariffChanges.filter(t => new Date(t.date) <= new Date())
  const highImpactChanges = tariffChanges.filter(t => t.impact === 'high')

  // Map HTS chapters to readable categories
  const chapterNames = tariffData.hts_chapters_tracked || {}

  // Count affected product categories
  const affectedCategories = useMemo(() => {
    const categories = new Set()
    tariffChanges.forEach(change => {
      change.affected_chapters?.forEach(ch => {
        if (chapterNames[ch]) {
          categories.add(chapterNames[ch])
        }
      })
    })
    return Array.from(categories)
  }, [tariffChanges, chapterNames])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-[#7c4dff]" />
          <h2 className="text-xl font-bold text-white">Trade & Tariffs</h2>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Import tariff changes, trade policy updates, and their impact on distribution costs.
        </p>
        <p className="text-[#9ca3af]/60 text-xs mt-1">
          Last updated: {new Date(tariffData.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Tariff Changes"
          value={tariffChanges.length}
          change={0}
          changeLabel="active policies"
          icon={Shield}
        />
        <MetricCard
          title="High Impact"
          value={highImpactChanges.length}
          change={0}
          changeLabel="significant changes"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Upcoming Changes"
          value={upcomingChanges.length}
          change={0}
          changeLabel="scheduled"
          icon={Calendar}
        />
        <MetricCard
          title="Product Categories"
          value={affectedCategories.length}
          change={0}
          changeLabel="affected"
          icon={TrendingUp}
        />
      </div>

      {/* Tariff Changes Timeline */}
      <ChartCard
        title="Recent & Upcoming Tariff Changes"
        subtitle="Executive orders and regulatory actions"
        className="mb-4"
      >
        <div className="px-5 pb-4 space-y-3">
          {tariffChanges.length === 0 && (
            <p className="text-[#9ca3af] text-sm py-4 text-center">No tariff changes tracked</p>
          )}
          {tariffChanges.map((change, idx) => {
            const isPast = new Date(change.date) <= new Date()
            const isHighImpact = change.impact === 'high'

            return (
              <div
                key={idx}
                className={`bg-[#0f1117] rounded-lg p-4 border ${
                  isHighImpact ? 'border-[#ef4444]/30' : 'border-[#2a2d3e]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isPast
                          ? 'bg-[#2a2d3e] text-[#9ca3af]'
                          : 'bg-[#7c4dff]/20 text-[#b388ff]'
                      }`}
                    >
                      {isPast ? 'Active' : 'Scheduled'}
                    </span>
                    {isHighImpact && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900/50 text-red-300">
                        High Impact
                      </span>
                    )}
                  </div>
                  <span className="text-[#9ca3af] text-xs whitespace-nowrap">
                    {new Date(change.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <p className="text-white font-medium text-sm mb-2">{change.description}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {change.affected_chapters?.slice(0, 6).map(ch => (
                    <span
                      key={ch}
                      className="text-xs px-2 py-1 rounded bg-[#2a2d3e] text-[#9ca3af]"
                      title={chapterNames[ch] || `Chapter ${ch}`}
                    >
                      {chapterNames[ch]?.split(' ')[0] || `Ch ${ch}`}
                    </span>
                  ))}
                  {change.affected_chapters && change.affected_chapters.length > 6 && (
                    <span className="text-xs px-2 py-1 rounded bg-[#2a2d3e] text-[#9ca3af]">
                      +{change.affected_chapters.length - 6} more
                    </span>
                  )}
                </div>

                <p className="text-[#9ca3af] text-xs">
                  Source: {change.source}
                </p>
              </div>
            )
          })}
        </div>
      </ChartCard>

      {/* Affected Product Categories */}
      <ChartCard
        title="Affected Product Categories"
        subtitle="Import categories subject to new tariffs"
        className="mb-4"
      >
        <div className="px-5 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {affectedCategories.length === 0 && (
              <p className="text-[#9ca3af] text-sm py-4 text-center col-span-full">
                No affected categories identified
              </p>
            )}
            {affectedCategories.map((category, idx) => (
              <div
                key={idx}
                className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]"
              >
                <p className="text-white text-sm font-medium">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Insights */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-6 mb-4 animate-fade-in">
        <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#7c4dff]" />
          What This Means for Distributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#9ca3af]">
          <div>
            <p className="font-medium text-white mb-1">Supply chain costs are shifting.</p>
            <p>
              {highImpactChanges.length > 0 ? (
                <>
                  {highImpactChanges.length} high-impact tariff changes are in effect or scheduled.
                  If you import from affected countries, expect cost increases that need to be passed through to customers or absorbed in margin.
                </>
              ) : (
                'No high-impact tariff changes currently tracked. Monitor this page for updates as trade policy evolves.'
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Proactive sourcing matters.</p>
            <p>
              {upcomingChanges.length > 0 ? (
                <>
                  {upcomingChanges.length} tariff changes are scheduled but not yet in effect.
                  This is your window to renegotiate supplier contracts, explore alternative sourcing, or prepare pricing adjustments.
                </>
              ) : (
                'All tracked tariff changes are currently in effect. Stay informed on upcoming policy announcements to maintain competitive pricing.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory Watch Section */}
      <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5 mb-4">
        <h3 className="text-white font-semibold mb-3">Regulatory Watch</h3>
        <div className="space-y-3">
          {[
            {
              title: 'USTR Trade Policy Updates',
              desc: 'Monitor US Trade Representative announcements on Section 301 tariffs, exclusions, and bilateral agreements.',
              tag: 'Federal'
            },
            {
              title: 'Customs & Border Protection',
              desc: 'Track CBP rulings on product classifications, country of origin determinations, and enforcement actions.',
              tag: 'Enforcement'
            },
            {
              title: 'Trade Compliance Requirements',
              desc: 'Stay current on importer security filing, entry documentation, and drawback program changes.',
              tag: 'Compliance'
            }
          ].map((item, i) => (
            <div key={i} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#7c4dff]/20 text-[#b388ff]">
                  {item.tag}
                </span>
                <span className="text-white text-sm font-medium">{item.title}</span>
              </div>
              <p className="text-[#9ca3af] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <CTASection />
    </div>
  )
}
