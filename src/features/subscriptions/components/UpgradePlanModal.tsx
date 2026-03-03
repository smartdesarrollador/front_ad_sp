import { Loader2, X } from 'lucide-react'
import type { BillingCycle, PlanData, UpgradeRequest } from '../types'

interface Props {
  targetPlan: PlanData | null
  billingCycle: BillingCycle
  isOpen: boolean
  onClose: () => void
  onConfirm: (req: UpgradeRequest) => void
  isPending: boolean
}

export function UpgradePlanModal({
  targetPlan,
  billingCycle,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: Props) {
  if (!isOpen || !targetPlan) return null

  const price = billingCycle === 'monthly' ? targetPlan.priceMonthly : targetPlan.priceAnnual
  const cycleLabel = billingCycle === 'monthly' ? 'mensual' : 'anual'

  const handleConfirm = () => {
    onConfirm({ plan: targetPlan.id, billing_cycle: billingCycle })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Confirmar actualizacion
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Estas a punto de actualizar tu suscripcion
        </p>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Plan</span>
            <span className="font-medium text-gray-900 dark:text-white">{targetPlan.displayName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Precio</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {price !== null ? `$${price}/${cycleLabel === 'mensual' ? 'mes' : 'año'}` : 'Personalizado'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Ciclo de facturacion</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{cycleLabel}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar actualizacion
          </button>
        </div>
      </div>
    </div>
  )
}
