import type { AuditLogFilters } from '../types'

const EMPTY_FILTERS: AuditLogFilters = {
  action: '',
  resource_type: '',
  date_from: '',
  date_to: '',
  search: '',
}

function isActive(filters: AuditLogFilters): boolean {
  return Object.values(filters).some((v) => v !== '')
}

const ACTION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
  { value: 'login', label: 'Inicio de sesión' },
  { value: 'logout', label: 'Cierre de sesión' },
  { value: 'reveal', label: 'Revelar' },
  { value: 'assign', label: 'Asignar' },
  { value: 'revoke', label: 'Revocar' },
]

interface Props {
  filters: AuditLogFilters
  onChange: (f: AuditLogFilters) => void
  totalCount?: number
}

export function AuditFilters({ filters, onChange, totalCount }: Props) {
  function handleChange(field: keyof AuditLogFilters, value: string) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.action}
        onChange={(e) => handleChange('action', e.target.value)}
        aria-label="Filtrar por acción"
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {ACTION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.resource_type}
        onChange={(e) => handleChange('resource_type', e.target.value)}
        aria-label="Filtrar por recurso"
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Todos los recursos</option>
        <option value="user">Usuario</option>
        <option value="role">Rol</option>
        <option value="permission">Permiso</option>
        <option value="subscription">Suscripción</option>
        <option value="project">Proyecto</option>
        <option value="task">Tarea</option>
      </select>

      <input
        type="date"
        value={filters.date_from}
        onChange={(e) => handleChange('date_from', e.target.value)}
        aria-label="Fecha desde"
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <input
        type="date"
        value={filters.date_to}
        onChange={(e) => handleChange('date_to', e.target.value)}
        aria-label="Fecha hasta"
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {isActive(filters) && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
        >
          Limpiar filtros
        </button>
      )}

      {totalCount !== undefined && (
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {totalCount} eventos
        </span>
      )}
    </div>
  )
}

export { EMPTY_FILTERS }
