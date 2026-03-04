import { Eye, Pencil, UserX, UserCheck } from 'lucide-react'
import type { AdminUser } from '../types'

function getStatusInfo(user: AdminUser): { label: string; className: string } {
  if (!user.is_active) return { label: 'Inactivo', className: 'badge badge-inactive' }
  if (!user.email_verified) return { label: 'Pendiente', className: 'badge badge-pending' }
  return { label: 'Activo', className: 'badge badge-active' }
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

interface UsersTableProps {
  users: AdminUser[]
  isLoading: boolean
  canEdit: boolean
  onView: (user: AdminUser) => void
  onEdit: (user: AdminUser) => void
  onSuspend: (user: AdminUser) => void
}

export function UsersTable({ users, isLoading, canEdit, onView, onEdit, onSuspend }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Usuario</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Roles</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">MFA</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Creado</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No se encontraron usuarios.
              </td>
            </tr>
          )}

          {!isLoading &&
            users.map((user) => {
              const status = getStatusInfo(user)
              return (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={user.name} />
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={status.className}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${user.email_verified ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.email_verified ? 'Verificado' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(user)}
                        title="Ver detalle"
                        aria-label={`Ver detalle de ${user.name}`}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEdit(user)}
                            title="Editar"
                            aria-label={`Editar usuario ${user.name}`}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onSuspend(user)}
                            title={user.is_active ? 'Suspender' : 'Activar'}
                            aria-label={user.is_active ? `Suspender usuario ${user.name}` : `Activar usuario ${user.name}`}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                          >
                            {user.is_active ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
