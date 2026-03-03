import { Users, Shield, HardDrive, Activity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { usePermissions } from '@/hooks/usePermissions'
import type { DashboardStats } from '../hooks/useDashboardStats'

interface StatCardData {
  id: string
  label: string
  value: string | number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  current?: number
  limit?: number | null
}

interface StatsCardsProps {
  stats: DashboardStats
}

function StatCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse h-28 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="mt-4 h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
    </div>
  )
}

function StatCard({ card }: { card: StatCardData }) {
  const progress =
    card.current != null && card.limit != null && card.limit > 0
      ? Math.min((card.current / card.limit) * 100, 100)
      : null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
        <div className={`p-2 rounded-lg ${card.iconBg}`}>
          <card.icon className={`w-5 h-5 ${card.iconColor}`} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
      {progress != null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{card.current}</span>
            <span>/ {card.limit}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${progress > 80 ? 'bg-yellow-500' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { getLimit } = useFeatureGate()
  const { isAdmin } = usePermissions()

  if (stats.isLoading) {
    const count = isAdmin ? 4 : 2
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const usersLimit = getLimit('users')
  const storageLimit = getLimit('storage_gb')
  const apiCallsLimit = getLimit('api_calls_per_month')

  const allCards: StatCardData[] = [
    {
      id: 'active-users',
      label: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      current: stats.activeUsers,
      limit: usersLimit,
    },
    {
      id: 'roles',
      label: 'Roles Configurados',
      value: stats.totalRoles,
      icon: Shield,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'storage',
      label: 'Almacenamiento',
      value: storageLimit != null ? `${storageLimit} GB` : '—',
      icon: HardDrive,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'api-calls',
      label: 'API Calls / Mes',
      value: apiCallsLimit != null ? apiCallsLimit.toLocaleString() : '—',
      icon: Activity,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  const visibleCards = isAdmin ? allCards : allCards.slice(0, 2)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {visibleCards.map((card) => (
        <StatCard key={card.id} card={card} />
      ))}
    </div>
  )
}
