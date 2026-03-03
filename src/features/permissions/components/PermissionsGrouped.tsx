import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Permission } from '@/features/roles/types'
import { PermissionRow } from './PermissionRow'
import { RESOURCE_LABELS } from './PermissionFilters'

interface PermissionsGroupedProps {
  groups: Record<string, Permission[]>
  isLoading: boolean
}

export function PermissionsGrouped({ groups, isLoading }: PermissionsGroupedProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCollapse = (resource: string) => {
    setCollapsed((prev) => ({ ...prev, [resource]: !prev[resource] }))
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="h-11 bg-gray-200 dark:bg-gray-700" />
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-8 bg-gray-100 dark:bg-gray-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const resourceKeys = Object.keys(groups)

  if (resourceKeys.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-medium">No se encontraron permisos</p>
        <p className="text-sm mt-1">Prueba ajustando el filtro o la búsqueda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {resourceKeys.sort().map((resource) => {
        const perms = groups[resource]
        const isCollapsed = collapsed[resource] ?? false
        const label = RESOURCE_LABELS[resource] ?? resource

        return (
          <div
            key={resource}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => toggleCollapse(resource)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors text-left"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {label}
              </span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {perms.length}
              </span>
            </button>

            {/* Permission rows */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {perms.map((perm) => (
                  <PermissionRow key={perm.id} permission={perm} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
