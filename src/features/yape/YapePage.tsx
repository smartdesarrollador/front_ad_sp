import { useState } from 'react'
import { Wallet, Clock, CheckCircle, XCircle, List, Lock } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { PaymentMethodCard } from './components/PaymentMethodCard'
import { YapeProofFilters, EMPTY_FILTERS } from './components/YapeProofFilters'
import { YapeProofsTable } from './components/YapeProofsTable'
import { YapeProofModal } from './components/YapeProofModal'
import { usePaymentMethods } from './hooks/usePaymentMethods'
import { useYapeProofs } from './hooks/useYapeProofs'
import type { YapeProof, YapeProofFilters as FiltersType } from './types'

type Tab = 'proofs' | 'methods'

// «Comprobantes» va primero y es la pestaña por defecto: revisar pagos es el trabajo
// diario, mientras que la configuración de un método se toca cada varios meses.
const TABS: { id: Tab; label: string }[] = [
  { id: 'proofs',  label: 'Comprobantes' },
  { id: 'methods', label: 'Métodos de pago' },
]

/**
 * Sección «Pagos»: una sola cola de comprobantes para todos los métodos —lo que el
 * revisor necesita saber es cuántos pagos esperan, vengan de donde vengan— y una
 * tarjeta de configuración por método.
 *
 * El fichero conserva el nombre «yape» hasta que se retire esa superficie heredada
 * (modelo, rutas y carpeta) en un cambio de renombrado puro.
 */
export default function PaymentsPage() {
  const [activeTab, setActiveTab]    = useState<Tab>('proofs')
  const [filters, setFilters]        = useState<FiltersType>(EMPTY_FILTERS)
  const [page, setPage]              = useState(1)
  const [selectedProof, setSelected] = useState<YapeProof | null>(null)

  const { hasPermission } = usePermissions()
  const canManage = hasPermission('subscriptions.manage')

  const { proofs, kpi, pagination, isLoading } = useYapeProofs({
    ...filters, page, per_page: 5,
  })
  const { methods, isLoading: methodsLoading } = usePaymentMethods()

  function handleFilterChange(f: FiltersType) {
    setFilters(f)
    setPage(1)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revisa los comprobantes de tus clientes y configura los métodos de pago
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.id === 'proofs' && kpi.pending > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold">
                  {kpi.pending}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Proofs tab */}
      {activeTab === 'proofs' && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',      value: kpi.total,    icon: List,         color: 'text-gray-600  dark:text-gray-300',  bg: 'bg-gray-100  dark:bg-gray-800'   },
              { label: 'Pendientes', value: kpi.pending,  icon: Clock,        color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'Aprobados',  value: kpi.approved, icon: CheckCircle,  color: 'text-green-600  dark:text-green-400',  bg: 'bg-green-50  dark:bg-green-900/20'  },
              { label: 'Rechazados', value: kpi.rejected, icon: XCircle,      color: 'text-red-600    dark:text-red-400',    bg: 'bg-red-50    dark:bg-red-900/20'    },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <YapeProofFilters filters={filters} onChange={handleFilterChange} />
            <YapeProofsTable
              proofs={proofs}
              isLoading={isLoading}
              page={page}
              totalPages={pagination.total_pages}
              total={pagination.total}
              perPage={pagination.per_page}
              onPageChange={setPage}
              onThumbnailClick={setSelected}
            />
          </div>
        </div>
      )}

      {/* Methods tab */}
      {activeTab === 'methods' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estos datos se muestran al cliente en el paso de pago. Los cambios son
            inmediatos — no requieren redeploy.
          </p>

          {!canManage && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Necesitas el permiso <code>subscriptions.manage</code> para editar los métodos
                de pago.
              </p>
            </div>
          )}

          {methodsLoading ? (
            [...Array(2)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4 animate-pulse"
              >
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))
          ) : methods.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No hay métodos de pago configurables
            </div>
          ) : (
            methods.map((method) => (
              <PaymentMethodCard key={method.method} config={method} canManage={canManage} />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <YapeProofModal proof={selectedProof} onClose={() => setSelected(null)} />
    </div>
  )
}
