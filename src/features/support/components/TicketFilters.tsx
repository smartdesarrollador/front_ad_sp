import { Search } from 'lucide-react'
import type { TicketStatus, TicketPriority, TicketCategory } from '../types'

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Técnico',
  billing: 'Facturación',
  access: 'Acceso',
  feature_request: 'Solicitud',
  other: 'Otro',
}

interface TicketFiltersProps {
  search: string
  onSearch: (value: string) => void
  statusFilter: 'all' | TicketStatus
  onStatusFilter: (value: 'all' | TicketStatus) => void
  priorityFilter: 'all' | TicketPriority
  onPriorityFilter: (value: 'all' | TicketPriority) => void
  categoryFilter: 'all' | TicketCategory
  onCategoryFilter: (value: 'all' | TicketCategory) => void
}

export function TicketFilters({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  priorityFilter,
  onPriorityFilter,
  categoryFilter,
  onCategoryFilter,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar referencia, asunto o email..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilter(e.target.value as 'all' | TicketStatus)}
        className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todos los estados</option>
        <option value="open">Abierto</option>
        <option value="in_progress">En Progreso</option>
        <option value="waiting_client">Esperando Cliente</option>
        <option value="resolved">Resuelto</option>
        <option value="closed">Cerrado</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityFilter(e.target.value as 'all' | TicketPriority)}
        className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todas las prioridades</option>
        <option value="urgente">Urgente</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryFilter(e.target.value as 'all' | TicketCategory)}
        className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todas las categorías</option>
        <option value="technical">Técnico</option>
        <option value="billing">Facturación</option>
        <option value="access">Acceso</option>
        <option value="feature_request">Solicitud</option>
        <option value="other">Otro</option>
      </select>
    </div>
  )
}
