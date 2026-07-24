import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { StoragePlanRow } from '../types'
import { formatStorage } from '../formatStorage'

const BAR_COLOR = '#6366f1'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: StoragePlanRow }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { plan_name, used_gb, tenant_count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">{plan_name}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {formatStorage(used_gb)} · {tenant_count} tenant{tenant_count === 1 ? '' : 's'}
      </p>
    </div>
  )
}

interface Props {
  byPlan: StoragePlanRow[] | undefined
  isLoading: boolean
}

export function StorageByPlanChart({ byPlan, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }
  if (!byPlan?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={byPlan} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="plan_name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" GB" />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
        <Bar dataKey="used_gb" fill={BAR_COLOR} name="GB usados" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
