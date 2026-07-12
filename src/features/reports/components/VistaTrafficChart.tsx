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
import type { VistaTrafficData, VistaTrafficServiceItem } from '../types'

const VIEWS_COLOR = '#3b82f6'
const UNIQUE_COLOR = '#a855f7'

const SERVICE_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta',
  landing: 'Landing',
  portafolio: 'Portafolio',
  cv: 'CV',
}

interface ChartRow extends VistaTrafficServiceItem {
  label: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartRow }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { label, views, unique_views, shares } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm shadow">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">{views} vistas, {unique_views} únicas</p>
      <p className="text-gray-500 dark:text-gray-400">{shares} compartidos</p>
    </div>
  )
}

interface Props {
  vistaTraffic: VistaTrafficData | undefined
  isLoading: boolean
}

export function VistaTrafficChart({ vistaTraffic, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  if (!vistaTraffic?.services?.some((s) => s.views > 0)) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  const data: ChartRow[] = vistaTraffic.services.map((s) => ({
    ...s,
    label: SERVICE_LABELS[s.service] ?? s.service,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="views" fill={VIEWS_COLOR} name="Vistas" />
        <Bar dataKey="unique_views" fill={UNIQUE_COLOR} name="Visitantes únicos" />
      </BarChart>
    </ResponsiveContainer>
  )
}
