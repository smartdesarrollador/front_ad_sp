import { Search } from 'lucide-react'
import type { ClientSubscriptionStatus, PlanType } from '../types'

interface ClientFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: 'all' | ClientSubscriptionStatus
  onStatusFilter: (value: 'all' | ClientSubscriptionStatus) => void
  planFilter: 'all' | PlanType
  onPlanFilter: (value: 'all' | PlanType) => void
  totalCount: number
}

export function ClientFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  planFilter,
  onPlanFilter,
  totalCount,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por empresa, email o subdominio..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as 'all' | ClientSubscriptionStatus)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Todos</option>
          <option value="active">Activo</option>
          <option value="trial">Prueba</option>
          <option value="past_due">Pago Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => onPlanFilter(e.target.value as 'all' | PlanType)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Todos los planes</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {totalCount} clientes
        </span>
      </div>
    </div>
  )
}
