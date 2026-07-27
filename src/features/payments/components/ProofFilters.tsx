import { METHOD_LABELS } from '../payment-method-labels'
import type { ProofFilters } from '../types'

export const EMPTY_FILTERS: ProofFilters = {
  status: '', plan: '', method: '', date_from: '', date_to: '',
}

const METHOD_OPTIONS = [
  { value: '', label: 'Todos los métodos' },
  ...Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending',  label: 'Pendiente' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
]

const PLAN_OPTIONS = [
  { value: '',             label: 'Todos los planes' },
  { value: 'starter',      label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise',   label: 'Enterprise' },
]

interface Props {
  filters: ProofFilters
  onChange: (f: ProofFilters) => void
}

export function ProofFilters({ filters, onChange }: Props) {
  const isActive = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Estado
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Plan
        </label>
        <select
          value={filters.plan}
          onChange={(e) => onChange({ ...filters, plan: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
        >
          {PLAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="proof-filter-method"
          className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
        >
          Método
        </label>
        <select
          id="proof-filter-method"
          value={filters.method}
          onChange={(e) => onChange({ ...filters, method: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
        >
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Desde
        </label>
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Hasta
        </label>
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isActive && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
