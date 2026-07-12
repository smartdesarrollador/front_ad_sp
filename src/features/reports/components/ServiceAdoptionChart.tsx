import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import type { ServiceAdoptionData, ServiceAdoptionItem } from '../types'

const ACTIVATED_COLOR = '#22c55e'
const GAP_COLOR = '#d1d5db'

interface ChartRow extends ServiceAdoptionItem {
  gap: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartRow }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { name, acquired, activated, activation_rate } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">{name}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {activated} de {acquired} activados ({activation_rate}%)
      </p>
    </div>
  )
}

interface Props {
  adoption: ServiceAdoptionData | undefined
  isLoading: boolean
}

export function ServiceAdoptionChart({ adoption, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  if (!adoption?.services?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  const data: ChartRow[] = adoption.services.map((s) => ({
    ...s,
    gap: s.acquired - s.activated,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="activated" stackId="a" fill={ACTIVATED_COLOR} name="Activados" />
        <Bar dataKey="gap" stackId="a" fill={GAP_COLOR} name="Sin activar" />
      </BarChart>
    </ResponsiveContainer>
  )
}
