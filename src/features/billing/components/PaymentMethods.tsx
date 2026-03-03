import { Plus } from 'lucide-react'
import { PaymentMethodCard } from './PaymentMethodCard'
import type { PaymentMethod } from '../types'

interface Props {
  methods: PaymentMethod[]
  isLoading: boolean
  canManageBilling: boolean
}

export function PaymentMethods({ methods, isLoading, canManageBilling }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Métodos de pago
        </h3>
        <button
          disabled={!canManageBilling}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          Añadir método de pago
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No hay métodos de pago registrados
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </div>
      )}
    </div>
  )
}
