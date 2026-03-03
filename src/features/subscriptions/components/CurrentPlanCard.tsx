import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { CurrentSubscription } from '../types'
import { PLANS } from '../plans-data'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  trialing: { label: 'Prueba', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  past_due: { label: 'Vencido', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  canceled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  incomplete: { label: 'Incompleto', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
}

interface Props {
  subscription: CurrentSubscription | null
  canManageBilling: boolean
  onChangePlan: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function CurrentPlanCard({ subscription, canManageBilling, onChangePlan }: Props) {
  if (!subscription) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 p-6 text-white animate-pulse">
        <div className="h-4 bg-white/20 rounded w-20 mb-2" />
        <div className="h-7 bg-white/20 rounded w-40 mb-1" />
        <div className="h-4 bg-white/20 rounded w-32" />
        <div className="mt-6 h-10 bg-white/20 rounded w-28" />
      </div>
    )
  }

  const planData = PLANS.find((p) => p.id === subscription.plan)
  const statusInfo = STATUS_LABELS[subscription.status] ?? STATUS_LABELS.active
  const renewalDate = subscription.status === 'trialing' ? subscription.trial_end : subscription.current_period_end

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 p-6 text-white">
      {subscription.cancel_at_period_end && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-400/20 border border-yellow-300/40 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Cancela al final del período ({formatDate(subscription.current_period_end)})</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-primary-100 text-sm mb-1">Plan Actual</p>
          <h2 className="text-2xl font-bold mb-2">{planData?.displayName ?? subscription.plan}</h2>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="text-right shrink-0">
          {planData?.priceMonthly !== null && planData?.priceMonthly !== undefined ? (
            <>
              <p className="text-3xl font-bold">${planData.priceMonthly}</p>
              <p className="text-primary-100 text-sm">/mes</p>
            </>
          ) : (
            <p className="text-xl font-bold">Personalizado</p>
          )}
        </div>
      </div>

      {renewalDate && (
        <p className="mt-3 text-primary-100 text-sm flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          {subscription.status === 'trialing' ? 'Prueba termina el' : 'Se renueva el'}{' '}
          {formatDate(renewalDate)}
        </p>
      )}

      {canManageBilling && (
        <button
          onClick={onChangePlan}
          className="mt-5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 text-sm font-medium"
        >
          Cambiar plan
        </button>
      )}
    </div>
  )
}
