import { Search } from 'lucide-react'

interface UserFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  totalCount: number
}

export function UserFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCount,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {totalCount} usuarios
        </span>
      </div>
    </div>
  )
}
