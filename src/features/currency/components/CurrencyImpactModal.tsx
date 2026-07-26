import { useRef } from 'react'
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { formatUsdAsPen } from '@/lib/currency'
import type { AdminPlan } from '@/features/plans/types'

interface Props {
  /** Tasa guardada actualmente. */
  currentRate: number | null
  /** Tasa que se va a guardar. */
  newRate: number
  plans: AdminPlan[]
  plansFailed: boolean
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function CurrencyImpactModal({
  currentRate,
  newRate,
  plans,
  plansFailed,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef)

  // Free daría "S/ 0 → S/ 0" en las dos columnas: puro ruido en una tabla de impacto.
  const affected = plans.filter((p) => p.price_monthly > 0 || p.price_annual > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-impact-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <h2
            id="currency-impact-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Confirmar el nuevo tipo de cambio
          </h2>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {currentRate ?? '—'}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{newRate}</span>
            <span className="text-gray-500 dark:text-gray-400">soles por dólar</span>
          </div>

          {plansFailed ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se pudieron cargar los planes para calcular el impacto.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {affected.map((plan) => (
                <div key={plan.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {plan.display_name}
                  </p>
                  <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                    <p>
                      Mensual: {formatUsdAsPen(plan.price_monthly, currentRate) ?? '—'}{' '}
                      <span aria-hidden="true">→</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatUsdAsPen(plan.price_monthly, newRate)}
                      </span>
                    </p>
                    <p>
                      Anual: {formatUsdAsPen(plan.price_annual, currentRate) ?? '—'}{' '}
                      <span aria-hidden="true">→</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatUsdAsPen(plan.price_annual, newRate)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Los planes se siguen cobrando en dólares. Esto solo cambia el importe que el
              cliente ve como referencia en soles.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Guardando...' : 'Confirmar y guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
