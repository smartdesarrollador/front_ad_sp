import { Search } from 'lucide-react'

const RESOURCE_LABELS: Record<string, string> = {
  auth_app: 'Usuarios',
  rbac: 'Roles y Permisos',
  subscriptions: 'Suscripciones',
  audit: 'Auditoría',
  projects: 'Proyectos',
  tasks: 'Tareas',
  calendar_app: 'Calendario',
  notes: 'Notas',
  contacts: 'Contactos',
  bookmarks: 'Marcadores',
  env_vars: 'DevOps',
  ssh_keys: 'DevOps',
  ssl_certs: 'DevOps',
  snippets: 'DevOps',
  forms_app: 'Formularios',
  support: 'Soporte',
  digital_services: 'Servicios Digitales',
  sharing: 'Compartir',
}

interface PermissionFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  totalCount: number
}

export function PermissionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  totalCount,
}: PermissionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o codename..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          aria-label="Buscar permisos"
        />
      </div>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="py-2 pl-3 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        aria-label="Filtrar por categoría"
      >
        <option value="all">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {RESOURCE_LABELS[cat] ?? cat}
          </option>
        ))}
      </select>

      {/* Count */}
      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {totalCount} permisos
      </span>
    </div>
  )
}

export { RESOURCE_LABELS }
