import { useNavigate } from 'react-router-dom'
import type { AdminUser } from '../types'

interface RecentUsersTableProps {
  users: AdminUser[]
  isLoading: boolean
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
      </td>
    </tr>
  )
}

export function RecentUsersTable({ users, isLoading }: RecentUsersTableProps) {
  const navigate = useNavigate()

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Usuarios Recientes
        </h3>
        <button
          onClick={() => navigate('/users')}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          Ver todos →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Usuario
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Rol
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="avatar">{user.name[0]?.toUpperCase() ?? '?'}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        {user.roles[0] ?? 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
