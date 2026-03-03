import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRoles } from './hooks/useRoles'
import { useDeleteRole } from './hooks/useDeleteRole'
import { usePermissions } from '@/hooks/usePermissions'
import { RoleCard } from './components/RoleCard'
import { RoleModal } from './components/RoleModal'
import type { RoleDetail } from './types'

export default function RolesPage() {
  const { roles, isLoading } = useRoles()
  const { mutate: deleteRole } = useDeleteRole()
  const { hasPermission } = usePermissions()

  const [showModal, setShowModal] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleDetail | null>(null)

  const canCreate = hasPermission('roles.create')
  const canEdit = hasPermission('roles.update')
  const canDelete = hasPermission('roles.delete')

  const customRoles = roles.filter((r) => !r.is_system_role)

  const handleEdit = (role: RoleDetail) => {
    setRoleToEdit(role)
    setShowModal(true)
  }

  const handleNewRole = () => {
    setRoleToEdit(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setRoleToEdit(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Roles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? 'Cargando...'
              : `${roles.length} roles en total · ${customRoles.length} personalizados`}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleNewRole}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Rol
          </button>
        )}
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && roles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No hay roles configurados</p>
          <p className="text-sm mt-1">Crea el primer rol personalizado para empezar.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && roles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={handleEdit}
              onDelete={deleteRole}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <RoleModal role={roleToEdit} isOpen={showModal} onClose={handleCloseModal} />
    </div>
  )
}
