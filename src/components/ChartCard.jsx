export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] overflow-hidden animate-fade-in ${className}`}>
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        {subtitle && <p className="text-[#9ca3af] text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="px-2 pb-4">
        {children}
      </div>
    </div>
  )
}
