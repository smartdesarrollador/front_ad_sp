import { Check, X } from 'lucide-react'
import type { BillingCycle, PlanData, PlanType } from '../types'

interface Props {
  plan: PlanData
  currentPlan: PlanType
  billingCycle: BillingCycle
  onSelect: (plan: PlanType) => void
  canUpgrade: boolean
}

export function PlanCard({ plan, currentPlan, billingCycle, onSelect, canUpgrade }: Props) {
  const isCurrentPlan = plan.id === currentPlan
  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  const isEnterprise = plan.id === 'enterprise'

  return (
    <div
      className={`relative rounded-xl border bg-white dark:bg-gray-800 flex flex-col ${
        isCurrentPlan
          ? 'border-blue-500 ring-2 ring-blue-500'
          : plan.popular
          ? 'border-primary-500 ring-2 ring-primary-500'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {(isCurrentPlan || plan.popular) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {isCurrentPlan ? (
            <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
              Plan Actual
            </span>
          ) : (
            <span className="rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
              Mas Popular
            </span>
          )}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.displayName}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>

        <div className="mb-6">
          {price !== null ? (
            <>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">${price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                /{billingCycle === 'monthly' ? 'mes' : 'año'}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Personalizado</span>
          )}
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  feature.included
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>

        {isCurrentPlan ? (
          <button
            disabled
            className="w-full rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          >
            Plan actual
          </button>
        ) : isEnterprise ? (
          <a
            href="mailto:sales@example.com"
            className="block w-full rounded-lg px-4 py-2 text-sm font-medium text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Contactar Ventas
          </a>
        ) : (
          <button
            disabled={!canUpgrade}
            onClick={() => onSelect(plan.id)}
            className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              canUpgrade
                ? plan.popular
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Actualizar Plan
          </button>
        )}
      </div>
    </div>
  )
}
