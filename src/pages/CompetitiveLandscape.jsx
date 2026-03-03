import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Building2, TrendingUp, Users, Package } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import CTASection from '../components/CTASection'

import wholesaleData from '../data/wholesale_trade.json'
import freightData from '../data/freight_index.json'

const COLORS = {
  purple: '#7c4dff',
  purpleLight: '#b388ff',
  green: '#4caf50',
  amber: '#f59e0b',
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

export default function CompetitiveLandscape() {
  const salesChart = useMemo(() => {
    return [...wholesaleData.data].reverse().map(d => ({
      period: d.period.slice(2),
      sales: d.sales,
      inventories: d.inventories,
    }))
  }, [])

  const ratioChart = useMemo(() => {
    return [...wholesaleData.data].reverse().map(d => ({
      period: d.period.slice(2),
      ratio: d.ratio,
    }))
  }, [])

  const employmentChart = useMemo(() => {
    return [...freightData.series].reverse().map(s => ({
      period: s.period.slice(2),
      employment: s.trucking_employment,
    }))
  }, [])

  const latest = wholesaleData.data[0]
  const latestEmployment = freightData.series[0]
  const salesChange = wholesaleData.data.length >= 2
    ? ((wholesaleData.data[0].sales - wholesaleData.data[1].sales) / wholesaleData.data[1].sales * 100).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Competitive Landscape</h2>
        <p className="text-[#9ca3af] text-sm">Wholesale trade trends, inventory ratios, and employment data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Building2}
          label="Wholesale Sales"
          value={`$${(latest?.sales / 1000).toFixed(1)}B`}
          sub="monthly total"
          color={COLORS.purple}
        />
        <MetricCard
          icon={Package}
          label="Inventories"
          value={`$${(latest?.inventories / 1000).toFixed(1)}B`}
          sub="month-end"
          color={COLORS.blue}
        />
        <MetricCard
          icon={TrendingUp}
          label="Sales Change"
          value={`${salesChange}%`}
          sub="month over month"
          color={parseFloat(salesChange) >= 0 ? COLORS.green : COLORS.amber}
        />
        <MetricCard
          icon={Users}
          label="Trucking Jobs"
          value={`${latestEmployment?.trucking_employment || 'N/A'}K`}
          sub="employment level"
          color={COLORS.cyan}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Wholesale Sales vs Inventories" subtitle="Monthly ($M)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="inventories" name="Inventories" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inventory-to-Sales Ratio" subtitle="Lower ratio = faster turnover">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratioChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="ratio" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Trucking Employment Trend" subtitle="Thousands of jobs in trucking sector">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={employmentChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
            <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="employment" name="Employment (K)" stroke={COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <CTASection />
    </div>
  )
}
