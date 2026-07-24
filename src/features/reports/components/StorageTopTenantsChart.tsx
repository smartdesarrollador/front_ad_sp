import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { StorageTenantRow } from '../types'
import { formatStorage } from '../formatStorage'

const BAR_COLOR = '#0ea5e9'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: StorageTenantRow }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { tenant, used_gb, limit_gb, pct } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">{tenant}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {formatStorage(used_gb)}
        {limit_gb === null ? ' · Ilimitado' : ` de ${formatStorage(limit_gb)}`}
        {pct !== null ? ` (${pct}%)` : ''}
      </p>
    </div>
  )
}

interface Props {
  topTenants: StorageTenantRow[] | undefined
  isLoading: boolean
}

export function StorageTopTenantsChart({ topTenants, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }
  if (!topTenants?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, topTenants.length * 34)}>
      <BarChart
        data={topTenants}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} unit=" GB" />
        <YAxis type="category" dataKey="tenant" tick={{ fontSize: 12 }} width={110} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.08)' }} />
        <Bar dataKey="used_gb" fill={BAR_COLOR} name="GB usados" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
