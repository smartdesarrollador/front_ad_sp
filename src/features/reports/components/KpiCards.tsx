import type { SummaryData } from '../types'

interface Props {
  summary: SummaryData | undefined
  isLoading: boolean
}

function KpiCard({
  title,
  value,
  subtitle,
  colorClass,
}: {
  title: string
  value: string
  subtitle: string
  colorClass: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colorClass} mb-3`} />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

export function KpiCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Usuarios activos"
        value={String(summary.active_users)}
        subtitle={`de ${summary.total_users} totales`}
        colorClass="bg-blue-500"
      />
      <KpiCard
        title="MRR"
        value={`$${summary.mrr.toFixed(2)}`}
        subtitle={`ARR: $${summary.arr.toFixed(2)}`}
        colorClass="bg-green-500"
      />
      <KpiCard
        title="Churn rate"
        value={`${summary.churn_rate}%`}
        subtitle={`${summary.trial_conversions} conversiones`}
        colorClass="bg-purple-500"
      />
      <KpiCard
        title="Nuevos este mes"
        value={String(summary.new_users_this_month)}
        subtitle="usuarios registrados"
        colorClass="bg-orange-500"
      />
    </div>
  )
}
