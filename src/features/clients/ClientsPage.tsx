import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useClients } from './hooks/useClients'
import { useSuspendClient } from './hooks/useSuspendClient'
import { usePermissions } from '@/hooks/usePermissions'
import { ClientFilters } from './components/ClientFilters'
import { ClientsTable } from './components/ClientsTable'
import { ClientDetailPanel } from './components/ClientDetailPanel'
import { SuspendClientModal } from './components/SuspendClientModal'
import type { Client, ClientSubscriptionStatus, PlanType } from './types'

const PER_PAGE = 20

export default function ClientsPage() {
  const { clients, isLoading } = useClients()
  const { mutate: suspendClient } = useSuspendClient()
  const { hasPermission } = usePermissions()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ClientSubscriptionStatus>('all')
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all')
  const [page, setPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientToSuspend, setClientToSuspend] = useState<Client | null>(null)

  const canEdit = hasPermission('clients.update')

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.subdomain.toLowerCase().includes(q) ||
      c.admin_email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' ? true : c.subscription.status === statusFilter
    const matchPlan = planFilter === 'all' ? true : c.subscription.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilter = (value: 'all' | ClientSubscriptionStatus) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handlePlanFilter = (value: 'all' | PlanType) => {
    setPlanFilter(value)
    setPage(1)
  }

  const handleSuspendConfirm = () => {
    if (!clientToSuspend) return
    suspendClient(
      { id: clientToSuspend.id, active: !clientToSuspend.is_active },
      { onSuccess: () => setClientToSuspend(null) },
    )
  }

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(safePage * PER_PAGE, filtered.length)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {isLoading ? 'Cargando...' : `${clients.length} clientes en total`}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <ClientFilters
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilter={handleStatusFilter}
            planFilter={planFilter}
            onPlanFilter={handlePlanFilter}
            totalCount={filtered.length}
          />
        </div>

        <ClientsTable
          clients={paginated}
          isLoading={isLoading}
          canEdit={canEdit}
          onView={setSelectedClient}
          onSuspend={setClientToSuspend}
        />

        {/* Pagination */}
        {!isLoading && filtered.length > PER_PAGE && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ClientDetailPanel
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSuspend={setClientToSuspend}
        canEdit={canEdit}
      />

      <SuspendClientModal
        client={clientToSuspend}
        onConfirm={handleSuspendConfirm}
        onClose={() => setClientToSuspend(null)}
      />
    </div>
  )
}
