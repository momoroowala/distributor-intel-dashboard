import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Fuel, Truck, CloudLightning, AlertTriangle } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

import dieselData from '../data/eia_diesel.json'
import freightData from '../data/freight_index.json'
import weatherData from '../data/weather_alerts.json'

const COLORS = {
  purple: '#7c4dff',
  purpleLight: '#b388ff',
  green: '#4caf50',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#2196f3',
  cyan: '#00bcd4',
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1a1d2e',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    color: '#e8e8ed',
  },
}

export default function FuelLogistics() {
  const regionChart = useMemo(() => {
    const byRegion = {}
    for (const p of dieselData.prices) {
      if (!byRegion[p.region]) byRegion[p.region] = []
      byRegion[p.region].push(p)
    }
    const regions = Object.keys(byRegion)
    // Get the latest price per region for bar chart
    return regions.map(r => ({
      region: r.length > 12 ? r.slice(0, 12) + '...' : r,
      price: byRegion[r][0]?.value || 0,
    }))
  }, [])

  const dieselTrend = useMemo(() => {
    const usOnly = dieselData.prices.filter(p => p.region === 'US' || p.region === 'U.S.')
    return usOnly.slice(0, 12).reverse().map(p => ({
      period: p.period.slice(5),
      price: p.value,
    }))
  }, [])

  const freightChart = useMemo(() => {
    return [...freightData.series].reverse().map(s => ({
      period: s.period.slice(2),
      index: s.freight_index,
      employment: s.trucking_employment,
    }))
  }, [])

  const latestDiesel = dieselData.prices.find(p => p.region === 'US' || p.region === 'U.S.')
  const latestFreight = freightData.series[0]
  const alertCount = weatherData.alerts.length
  const extremeCount = weatherData.alerts.filter(a => a.severity === 'Extreme').length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Fuel & Logistics</h2>
        <p className="text-[#9ca3af] text-sm">Diesel prices, freight indices, and weather disruption alerts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Fuel}
          label="US Diesel Avg"
          value={`$${latestDiesel?.value?.toFixed(3) || 'N/A'}`}
          sub="per gallon"
          color={COLORS.amber}
        />
        <MetricCard
          icon={Truck}
          label="Freight Index"
          value={latestFreight?.freight_index || 'N/A'}
          sub="latest reading"
          color={COLORS.purple}
        />
        <MetricCard
          icon={CloudLightning}
          label="Active Alerts"
          value={alertCount}
          sub="severe/extreme"
          color={COLORS.red}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Extreme Alerts"
          value={extremeCount}
          sub="highest severity"
          color={COLORS.red}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Diesel Prices by Region" subtitle="Latest weekly price ($/gal)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionChart} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 'auto']} />
              <YAxis type="category" dataKey="region" tick={{ fill: '#9ca3af', fontSize: 11 }} width={90} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="price" fill={COLORS.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="US Diesel Price Trend" subtitle="Weekly national average">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dieselTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="price" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Freight & Trucking Employment" subtitle="Monthly trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={freightChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="index" name="Freight Index" stroke={COLORS.purple} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="employment" name="Employment (K)" stroke={COLORS.cyan} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severe Weather Alerts" subtitle={`${alertCount} active alerts impacting distribution`}>
          <div className="px-3 space-y-2 max-h-[280px] overflow-y-auto">
            {weatherData.alerts.length === 0 && (
              <p className="text-[#9ca3af] text-sm py-4 text-center">No active severe alerts</p>
            )}
            {weatherData.alerts.map((a, i) => (
              <div key={i} className="bg-[#0f1117] rounded-lg p-3 border border-[#2a2d3e]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    a.severity === 'Extreme' ? 'bg-red-900/50 text-red-300' : 'bg-amber-900/50 text-amber-300'
                  }`}>
                    {a.severity}
                  </span>
                  <span className="text-white text-sm font-medium">{a.event}</span>
                </div>
                <p className="text-[#9ca3af] text-xs">{a.headline}</p>
                <p className="text-[#9ca3af]/60 text-xs mt-1">{a.areaDesc}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <CTASection />
    </div>
  )
}
