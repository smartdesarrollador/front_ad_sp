import { formatMoney, formatUsdAsPen } from '@/lib/currency'
import type { AdminPlan } from '@/features/plans/types'

interface Props {
  plans: AdminPlan[]
  /** Tasa con la que se calcula la columna en soles. `null` → celdas vacías. */
  rate: number | null
  isLoading: boolean
  /** La tasa mostrada es la que se está tecleando, aún sin guardar. */
  isDraft: boolean
}

const HEAD_CLASS =
  'px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'

export function PlanConversionTable({ plans, rate, isLoading, isDraft }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-wrap">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Precios de los planes
        </h2>
        {isDraft && (
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">
            Sin guardar
          </span>
        )}
        {rate !== null && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            con {rate} soles por dólar
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className={HEAD_CLASS}>Plan</th>
              <th className={HEAD_CLASS}>Mensual (USD)</th>
              <th className={HEAD_CLASS}>Mensual (S/)</th>
              <th className={HEAD_CLASS}>Anual (USD)</th>
              <th className={HEAD_CLASS}>Anual (S/)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              : plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {plan.display_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatMoney(plan.price_monthly, 'USD')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatUsdAsPen(plan.price_monthly, rate) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatMoney(plan.price_annual, 'USD')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatUsdAsPen(plan.price_annual, rate) ?? '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
