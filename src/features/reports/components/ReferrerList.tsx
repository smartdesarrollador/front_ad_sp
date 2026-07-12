import type { VistaTrafficReferrer } from '../types'

interface Props {
  referrers: VistaTrafficReferrer[] | undefined
  isLoading: boolean
}

export function ReferrerList({ referrers, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  const items = referrers ?? []
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin datos disponibles
      </p>
    )
  }

  const maxVisits = Math.max(...items.map((r) => r.visits))

  return (
    <div className="space-y-3">
      {items.map((referrer, index) => {
        const width = Math.round((referrer.visits / maxVisits) * 100)
        return (
          <div key={referrer.source}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                  {referrer.source}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {referrer.visits.toLocaleString('es-ES')}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
