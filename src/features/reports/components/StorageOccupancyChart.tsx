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
import type { StorageOccupancyRow } from '../types'

// Verde → amarillo → rojo por severidad de ocupación; azul para ilimitado (Enterprise).
const BUCKET_COLOR: Record<string, string> = {
  '0-50%': '#22c55e',
  '50-80%': '#eab308',
  '80-100%': '#ef4444',
  unlimited: '#3b82f6',
}
const BUCKET_LABEL: Record<string, string> = {
  '0-50%': '0-50%',
  '50-80%': '50-80%',
  '80-100%': '80-100%',
  unlimited: 'Ilimitado',
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: StorageOccupancyRow }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { bucket, tenant_count } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">{BUCKET_LABEL[bucket] ?? bucket}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {tenant_count} tenant{tenant_count === 1 ? '' : 's'}
      </p>
    </div>
  )
}

interface Props {
  occupancy: StorageOccupancyRow[] | undefined
  isLoading: boolean
}

export function StorageOccupancyChart({ occupancy, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }
  if (!occupancy?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  const data = occupancy.map((o) => ({ ...o, label: BUCKET_LABEL[o.bucket] ?? o.bucket }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
        <Bar dataKey="tenant_count" name="Tenants" radius={[4, 4, 0, 0]}>
          {data.map((row) => (
            <Cell key={row.bucket} fill={BUCKET_COLOR[row.bucket] ?? '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
