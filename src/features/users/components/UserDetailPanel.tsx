import { X, Pencil, UserX, UserCheck } from 'lucide-react'
import type { AdminUser } from '../types'

interface UserDetailPanelProps {
  user: AdminUser | null
  onClose: () => void
  onEdit: (user: AdminUser) => void
  onSuspend: (user: AdminUser) => void
  canEdit: boolean
}

function getStatusLabel(user: AdminUser): string {
  if (!user.is_active) return 'Inactivo'
  if (!user.email_verified) return 'Pendiente verificación'
  return 'Activo'
}

export function UserDetailPanel({ user, onClose, onEdit, onSuspend, canEdit }: UserDetailPanelProps) {
  if (!user) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de Usuario</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {user.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Estado</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{getStatusLabel(user)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email verificado</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.email_verified ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">ID</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Creado</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Roles */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Roles asignados</p>
            {user.roles.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">Sin roles asignados</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={() => onEdit(user)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => onSuspend(user)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                user.is_active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {user.is_active ? (
                <>
                  <UserX className="h-4 w-4" />
                  Suspender
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Activar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
