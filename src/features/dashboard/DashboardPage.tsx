import { AlertTriangle, CheckCircle } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useRecentAudit } from './hooks/useRecentAudit'
import { StatsCards } from './components/StatsCards'
import { RecentUsersTable } from './components/RecentUsersTable'
import { RecentAuditEvents } from './components/RecentAuditEvents'

export default function DashboardPage() {
  const { isAdmin, hasPermission } = usePermissions()
  const { getLimit } = useFeatureGate()
  const stats = useDashboardStats()
  const audit = useRecentAudit()

  const canViewUsers = hasPermission('auth_app.view_customuser')
  const canViewAudit = hasPermission('audit.view_auditlog')

  const usersLimit = getLimit('users')
  const isNearLimit =
    usersLimit != null && usersLimit > 0 && stats.activeUsers / usersLimit > 0.8

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen del estado del sistema
        </p>
      </div>

      <StatsCards stats={stats} />

      {isAdmin && (
        <div className="space-y-3">
          {isNearLimit && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Estás usando{' '}
                <strong>
                  {stats.activeUsers} de {usersLimit}
                </strong>{' '}
                usuarios activos. Considera actualizar tu plan.
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-300">
              Suscripción activa — todos los servicios operativos.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {canViewUsers && (
          <RecentUsersTable users={stats.recentUsers} isLoading={stats.isLoading} />
        )}
        {canViewAudit && (
          <RecentAuditEvents logs={audit.logs} isLoading={audit.isLoading} />
        )}
      </div>
    </div>
  )
}
