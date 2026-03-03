import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({ title, value, change, changeLabel, icon: Icon, prefix = '', suffix = '' }) {
  const isPositive = change > 0
  const isNeutral = change === 0
  const TrendIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown
  const changeColor = isPositive ? 'text-green-400' : isNeutral ? 'text-gray-400' : 'text-red-400'
  const changeBg = isPositive ? 'bg-green-400/10' : isNeutral ? 'bg-gray-400/10' : 'bg-red-400/10'

  return (
    <div className="bg-[#1a1d2e] rounded-xl p-5 border border-[#2a2d3e] hover:border-[#7c4dff]/30 transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[#9ca3af] text-sm font-medium">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#7c4dff]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#7c4dff]" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-2">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${changeBg} ${changeColor}`}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(change).toFixed(1)}%
          </span>
          {changeLabel && <span className="text-[#9ca3af] text-xs">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
