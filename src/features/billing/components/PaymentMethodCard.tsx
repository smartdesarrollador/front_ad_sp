import { CreditCard, Star } from 'lucide-react'
import type { PaymentMethod } from '../types'

const BRAND_COLORS: Record<string, string> = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-600',
  amex: 'bg-green-600',
  discover: 'bg-orange-500',
}

interface Props {
  method: PaymentMethod
}

export function PaymentMethodCard({ method }: Props) {
  const brandKey = method.brand.toLowerCase()
  const brandColor = BRAND_COLORS[brandKey] ?? 'bg-gray-500'

  return (
    <div
      className={`relative p-5 rounded-xl border-2 transition-colors ${
        method.is_default
          ? 'border-primary-300 dark:border-primary-600 bg-primary-50/40 dark:bg-primary-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      {method.is_default && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          <Star className="h-3 w-3" />
          Principal
        </span>
      )}

      <div className={`w-10 h-10 ${brandColor} rounded-lg flex items-center justify-center mb-3`}>
        <CreditCard className="h-5 w-5 text-white" />
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {method.brand} &bull;&bull;&bull;&bull; {method.last4}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Vence {method.exp_month}/{method.exp_year}
      </p>
    </div>
  )
}
