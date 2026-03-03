import type { SubscriptionUsage } from '../types'

interface MeterProps {
  label: string
  current: number
  limit: number | null
  formatValue?: (n: number) => string
}

function getMeterColor(pct: number): string {
  if (pct > 90) return 'bg-red-500'
  if (pct > 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function UsageMeter({ label, current, limit, formatValue }: MeterProps) {
  const fmt = formatValue ?? ((n: number) => String(n))
  const isUnlimited = limit === null
  const pct = isUnlimited ? 100 : Math.min(100, (current / limit) * 100)
  const barColor = isUnlimited ? 'bg-blue-500' : getMeterColor(pct)

  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {fmt(current)} / {isUnlimited ? '∞' : fmt(limit!)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface Props {
  usage: SubscriptionUsage | undefined
  isLoading: boolean
}

export function UsageMeters({ usage, isLoading }: Props) {
  if (isLoading || !usage) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <UsageMeter
        label="Usuarios activos"
        current={usage.users.current}
        limit={usage.users.limit}
      />
      <UsageMeter
        label="Almacenamiento (GB)"
        current={usage.storage.current_gb}
        limit={usage.storage.limit_gb}
        formatValue={(n) => `${n} GB`}
      />
      <UsageMeter
        label="API Calls"
        current={usage.api_calls.current}
        limit={usage.api_calls.limit}
        formatValue={(n) => n.toLocaleString('es-ES')}
      />
    </div>
  )
}
