import { ArrowRight, BarChart3, Target, Zap } from 'lucide-react'

export default function CTASection() {
  return (
    <div className="relative mt-12 rounded-2xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/10 via-[#1a1d2e] to-[#1a1d2e] overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7c4dff]/20 blur-3xl rounded-full" />
      
      <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Want this mapped to YOUR accounts?
        </h2>
        <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto mb-8">
          This is public data. Imagine what we can show you when we layer in your customer list,
          your product mix, and your territory. We find the revenue you are leaving on the table.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0f1117]/50">
            <Target className="w-6 h-6 text-[#7c4dff]" />
            <p className="text-white font-medium text-sm">Dormant Account Detection</p>
            <p className="text-[#9ca3af] text-xs">Find customers who stopped buying</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0f1117]/50">
            <BarChart3 className="w-6 h-6 text-[#7c4dff]" />
            <p className="text-white font-medium text-sm">Wallet Share Analysis</p>
            <p className="text-[#9ca3af] text-xs">See how much more each account could buy</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0f1117]/50">
            <Zap className="w-6 h-6 text-[#7c4dff]" />
            <p className="text-white font-medium text-sm">Market Opportunity Scoring</p>
            <p className="text-[#9ca3af] text-xs">Rank prospects by revenue potential</p>
          </div>
        </div>

        <a
          href="https://deeplineoperations.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7c4dff] hover:bg-[#5c3db8] text-white font-semibold text-base transition-all shadow-lg shadow-[#7c4dff]/20 hover:shadow-[#7c4dff]/40"
        >
          Get a Free Diagnostic
          <ArrowRight className="w-4 h-4" />
        </a>
        <p className="text-[#9ca3af]/60 text-xs mt-4">
          No commitment. We will show you what we find in your data.
        </p>
      </div>
    </div>
  )
}
