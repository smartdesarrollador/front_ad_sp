import { useState } from 'react'
import { UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUsers } from './hooks/useUsers'
import { useSuspendUser } from './hooks/useSuspendUser'
import { usePermissions } from '@/hooks/usePermissions'
import { UserFilters } from './components/UserFilters'
import { UsersTable } from './components/UsersTable'
import { UserDetailPanel } from './components/UserDetailPanel'
import { InviteUserModal } from './components/InviteUserModal'
import { EditUserModal } from './components/EditUserModal'
import type { AdminUser } from './types'

const PER_PAGE = 20

export default function UsersPage() {
  const { users, isLoading } = useUsers()
  const { mutate: suspendUser } = useSuspendUser()
  const { hasPermission } = usePermissions()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const canEdit = hasPermission('users.update')
  const canInvite = hasPermission('users.invite')

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? u.is_active : !u.is_active
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleSuspend = (user: AdminUser) => {
    suspendUser(user.id)
  }

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(null)
    setEditUser(user)
  }

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(safePage * PER_PAGE, filtered.length)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading ? 'Cargando...' : `${users.length} usuarios en total`}
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Invitar Usuario
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <UserFilters
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            totalCount={filtered.length}
          />
        </div>

        <UsersTable
          users={paginated}
          isLoading={isLoading}
          canEdit={canEdit}
          onView={(user) => setSelectedUser(user)}
          onEdit={handleEdit}
          onSuspend={handleSuspend}
        />

        {/* Pagination footer */}
        {!isLoading && filtered.length > PER_PAGE && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <UserDetailPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEdit={handleEdit}
        onSuspend={handleSuspend}
        canEdit={canEdit}
      />

      {/* Modals */}
      <InviteUserModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
    </div>
  )
}
