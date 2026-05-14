import { useState } from 'react'
import { KeyRound, Plus } from 'lucide-react'
import { useLicenses } from './hooks/useLicenses'
import { useRevokeLicense, useReactivateLicense } from './hooks/useRevokeLicense'
import { LicenseTable } from './components/LicenseTable'
import { CreateLicenseModal } from './components/CreateLicenseModal'
import type { DesktopAppLicense } from './types'

const PER_PAGE = 15

export default function LicensesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { licenses, total, isLoading } = useLicenses({
    search: search || undefined,
    status: statusFilter || undefined,
    plan: planFilter || undefined,
  })

  const { mutate: revoke } = useRevokeLicense()
  const { mutate: reactivate } = useReactivateLicense()

  const totalPages = Math.ceil(total / PER_PAGE)
  const paginated = licenses.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const kpis = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === 'active').length,
    pending: licenses.filter((l) => l.status === 'pending').length,
  }

  const handleRevoke = (lic: DesktopAppLicense) => {
    if (window.confirm(`¿Revocar la licencia de ${lic.user_email}?`)) {
      revoke(lic.id)
    }
  }

  const handleReactivate = (lic: DesktopAppLicense) => {
    if (window.confirm(`¿Reactivar la licencia de ${lic.user_email}?`)) {
      reactivate(lic.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Licencias Desktop
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Gestión de license keys para la app Sidebar Offline
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva licencia
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: kpis.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Activas', value: kpis.active, color: 'text-green-600 dark:text-green-400' },
          { label: 'Sin activar', value: kpis.pending, color: 'text-yellow-600 dark:text-yellow-400' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>
              {isLoading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por email o key..."
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            aria-label="Filtrar por estado"
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="pending">Sin activar</option>
            <option value="revoked">Revocada</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
            aria-label="Filtrar por plan"
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los planes</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <LicenseTable
          licenses={paginated}
          isLoading={isLoading}
          onRevoke={handleRevoke}
          onReactivate={handleReactivate}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} licencias · página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateLicenseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}
