import { useState, useMemo } from 'react'
import { Info } from 'lucide-react'
import { usePermissions } from './hooks/usePermissions'
import { PermissionFilters } from './components/PermissionFilters'
import { PermissionsGrouped } from './components/PermissionsGrouped'
import type { Permission } from '@/features/roles/types'

export default function PermissionsPage() {
  const { permissions, isLoading } = usePermissions()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = useMemo(
    () => [...new Set(permissions.map((p) => p.resource))].sort(),
    [permissions],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return permissions.filter((p: Permission) => {
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || p.codename.toLowerCase().includes(q)
      const matchCat = category === 'all' || p.resource === category
      return matchSearch && matchCat
    })
  }, [permissions, search, category])

  const groups = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc[p.resource] ??= []
        acc[p.resource].push(p)
        return acc
      },
      {} as Record<string, Permission[]>,
    )
  }, [filtered])

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Permisos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {isLoading ? 'Cargando...' : `${permissions.length} permisos disponibles`}
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>
          Los permisos son de solo lectura. Para asignarlos a usuarios, hazlo desde la sección{' '}
          <strong>Roles</strong>.
        </span>
      </div>

      {/* Filters */}
      <PermissionFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        totalCount={filtered.length}
      />

      {/* Grouped accordions */}
      <PermissionsGrouped groups={groups} isLoading={isLoading} />
    </div>
  )
}
