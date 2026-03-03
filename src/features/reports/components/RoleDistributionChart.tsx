import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { UsageData, RoleDistributionItem } from '../types'

const ROLE_COLORS: Record<string, string> = {
  Owner: '#3b82f6',
  Manager: '#22c55e',
  Member: '#f97316',
  Viewer: '#6b7280',
}

const DEFAULT_COLOR = '#a855f7'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: RoleDistributionItem }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { role, count, percentage } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">
        {role}: {count} usuarios ({percentage}%)
      </p>
    </div>
  )
}

interface Props {
  usage: UsageData | undefined
  isLoading: boolean
}

export function RoleDistributionChart({ usage, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  if (!usage?.role_distribution?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={usage.role_distribution} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="role" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {usage.role_distribution.map((entry) => (
            <Cell
              key={entry.role}
              fill={ROLE_COLORS[entry.role] ?? DEFAULT_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
