import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import FeatureGate from '@/components/shared/FeatureGate'
import { useTrends } from '../hooks/useTrends'

type Period = '7d' | '30d' | '90d'

const PERIODS: { label: string; value: Period }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function TrendsChartInner() {
  const [period, setPeriod] = useState<Period>('30d')
  const { trends, isLoading } = useTrends(period)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            aria-pressed={period === p.value}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              period === p.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={trends?.data ?? []}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(v) => formatDate(String(v))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="active_users"
              stroke="#3b82f6"
              name="Usuarios activos"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="new_projects"
              stroke="#22c55e"
              name="Nuevos proyectos"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="api_requests"
              stroke="#f97316"
              name="Peticiones API"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function UsageTrendsChart() {
  return (
    <FeatureGate feature="analytics_trends">
      <TrendsChartInner />
    </FeatureGate>
  )
}
