import { Check, X, Pencil, Info } from 'lucide-react'
import { formatUsdAsPen } from '@/lib/currency'
import type { AdminPlan } from '../types'

const ACCENT_COLORS: Record<string, string> = {
  free: 'bg-gray-400',
  starter: 'bg-blue-500',
  professional: 'bg-primary-600',
  enterprise: 'bg-purple-600',
}

interface Props {
  plan: AdminPlan
  onEdit: (plan: AdminPlan) => void
  canEdit: boolean
  /** Tipo de cambio vigente; `null` mientras no se conozca → no se muestra la referencia. */
  usdToPen: number | null
}

export function PlanCard({ plan, onEdit, canEdit, usdToPen }: Props) {
  const accent = ACCENT_COLORS[plan.id] ?? 'bg-gray-400'
  // Free daría "≈ S/ 0/mes", que no informa de nada.
  const penMonthly = plan.price_monthly > 0 ? formatUsdAsPen(plan.price_monthly, usdToPen) : null

  return (
    <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Accent bar */}
      <div className={`h-1 w-full ${accent}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {plan.display_name}
              </h2>
              {plan.popular && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  Más popular
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{plan.description}</p>
          </div>
          {canEdit && (
            <button
              onClick={() => onEdit(plan)}
              aria-label={`Editar plan ${plan.display_name}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Prices */}
        <div className="mb-4 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${plan.price_monthly}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">/mes</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ${plan.price_annual}/año
          </p>
          {/* Referencia, no precio de venta: se cobra en USD. Va en su propio <p> para no
              alterar el textContent de las dos líneas de arriba. */}
          {penMonthly && (
            <p className="text-xs text-gray-400 dark:text-gray-500">≈ {penMonthly}/mes</p>
          )}
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5">
          {plan.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {h.included ? (
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span className={h.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                {h.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Immutable badge */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Info className="w-3 h-3" />
          <span>ID fijo: <code className="font-mono">{plan.id}</code></span>
        </div>
      </div>
    </div>
  )
}
