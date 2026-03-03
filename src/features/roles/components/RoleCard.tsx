import { useState } from 'react'
import { Users, Shield, Pencil, Trash2 } from 'lucide-react'
import { SystemRoleBadge } from './SystemRoleBadge'
import type { RoleDetail } from '../types'

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']

function getRoleColor(name: string): string {
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

interface RoleCardProps {
  role: RoleDetail
  onEdit: (role: RoleDetail) => void
  onDelete: (id: string) => void
  canEdit: boolean
  canDelete: boolean
}

export function RoleCard({ role, onEdit, onDelete, canEdit, canDelete }: RoleCardProps) {
  const [confirming, setConfirming] = useState(false)
  const accentColor = getRoleColor(role.name)

  const handleDeleteClick = () => setConfirming(true)
  const handleCancelDelete = () => setConfirming(false)
  const handleConfirmDelete = () => {
    setConfirming(false)
    onDelete(role.id)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex">
      {/* Accent bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="flex flex-col flex-1 p-5 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {role.name}
            </h3>
            {role.is_system_role && <SystemRoleBadge />}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {role.description || <span className="italic">Sin descripción</span>}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {role.user_count} usuario{role.user_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              {role.permissions.length} permiso{role.permissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Actions (only for non-system roles) */}
          {!role.is_system_role && (
            <div className="flex items-center gap-1">
              {confirming ? (
                <>
                  <span className="text-xs text-gray-600 dark:text-gray-300 mr-1">
                    ¿Confirmar?
                  </span>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <button
                      onClick={() => onEdit(role)}
                      title="Editar rol"
                      className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeleteClick}
                      title="Eliminar rol"
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
