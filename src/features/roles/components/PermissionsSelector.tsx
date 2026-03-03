import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import type { Permission } from '../types'

interface PermissionsSelectorProps {
  permissions: Permission[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

interface GroupState {
  [resource: string]: boolean
}

export function PermissionsSelector({ permissions, selectedIds, onChange }: PermissionsSelectorProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<GroupState>({})

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return permissions
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.codename.toLowerCase().includes(q),
    )
  }, [permissions, search])

  const groups = useMemo(() => {
    const map: Record<string, Permission[]> = {}
    for (const p of filtered) {
      if (!map[p.resource]) map[p.resource] = []
      map[p.resource].push(p)
    }
    return map
  }, [filtered])

  const togglePermission = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const toggleGroup = (_resource: string, perms: Permission[]) => {
    const groupIds = perms.map((p) => p.id)
    const allSelected = groupIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      onChange(selectedIds.filter((id) => !groupIds.includes(id)))
    } else {
      const toAdd = groupIds.filter((id) => !selectedIds.includes(id))
      onChange([...selectedIds, ...toAdd])
    }
  }

  const toggleCollapse = (resource: string) => {
    setCollapsed((prev) => ({ ...prev, [resource]: !prev[resource] }))
  }

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar permisos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Groups */}
      <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-md p-2">
        {Object.keys(groups).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
        )}
        {Object.entries(groups).map(([resource, perms]) => {
          const groupIds = perms.map((p) => p.id)
          const allSelected = groupIds.every((id) => selectedIds.includes(id))
          const someSelected = groupIds.some((id) => selectedIds.includes(id))
          const isCollapsed = collapsed[resource]

          return (
            <div key={resource}>
              {/* Group header */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <button
                  type="button"
                  onClick={() => toggleCollapse(resource)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onChange={() => toggleGroup(resource, perms)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  {resource}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {groupIds.filter((id) => selectedIds.includes(id)).length}/{perms.length}
                </span>
              </div>

              {/* Permission items */}
              {!isCollapsed && (
                <div className="ml-6 space-y-0.5">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {perm.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono ml-auto">
                        {perm.codename}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
