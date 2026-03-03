import { Lock } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useInvoices } from './hooks/useInvoices'
import { usePaymentMethods } from './hooks/usePaymentMethods'
import { InvoiceList } from './components/InvoiceList'
import { PaymentMethods } from './components/PaymentMethods'

export default function BillingPage() {
  const { canManageBilling } = usePermissions()
  const { invoices, isLoading: loadingInvoices } = useInvoices()
  const { methods, isLoading: loadingMethods } = usePaymentMethods()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturación</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Historial de facturas y métodos de pago
        </p>
      </div>

      {!canManageBilling && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-4">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Acceso limitado</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              No tienes permisos para modificar la facturación. Solo puedes ver la información.
            </p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <PaymentMethods
          methods={methods}
          isLoading={loadingMethods}
          canManageBilling={canManageBilling}
        />
      </div>

      {/* Invoice History */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Historial de facturas
        </h3>
        <InvoiceList invoices={invoices} isLoading={loadingInvoices} />
      </div>
    </div>
  )
}
