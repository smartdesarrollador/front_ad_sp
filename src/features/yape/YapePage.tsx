import { useState } from 'react'
import { Smartphone, Clock, CheckCircle, XCircle, List } from 'lucide-react'
import { YapeConfigForm } from './components/YapeConfigForm'
import { YapeProofFilters, EMPTY_FILTERS } from './components/YapeProofFilters'
import { YapeProofsTable } from './components/YapeProofsTable'
import { YapeProofModal } from './components/YapeProofModal'
import { useYapeProofs } from './hooks/useYapeProofs'
import type { YapeProof, YapeProofFilters as FiltersType } from './types'

type Tab = 'config' | 'proofs'

const TABS: { id: Tab; label: string }[] = [
  { id: 'config', label: 'Configuración' },
  { id: 'proofs', label: 'Comprobantes' },
]

export default function YapePage() {
  const [activeTab, setActiveTab]     = useState<Tab>('config')
  const [filters, setFilters]         = useState<FiltersType>(EMPTY_FILTERS)
  const [page, setPage]               = useState(1)
  const [selectedProof, setSelected]  = useState<YapeProof | null>(null)

  const { proofs, kpi, pagination, isLoading } = useYapeProofs({
    ...filters, page, per_page: 5,
  })

  function handleFilterChange(f: FiltersType) {
    setFilters(f)
    setPage(1)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos Yape</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configura el método de pago y gestiona los comprobantes de clientes
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

      {/* Config tab */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Datos de la cuenta Yape
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Estos datos se muestran al cliente en el paso de pago durante el registro.
              Los cambios son inmediatos — no requieren redeploy.
            </p>
          </div>
          <YapeConfigForm />
        </div>
      )}

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

      {/* Modal */}
      <YapeProofModal proof={selectedProof} onClose={() => setSelected(null)} />
    </div>
  )
}
