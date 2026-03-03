import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminUser } from '@/features/users/types'

interface UsersResponse {
  users: AdminUser[]
}

export interface DashboardStats {
  allUsers: AdminUser[]
  activeUsers: number
  totalUsers: number
  totalRoles: number
  recentUsers: AdminUser[]
  isLoading: boolean
}

export function useDashboardStats(): DashboardStats {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<UsersResponse>('/admin/users/').then((r) => r.data),
    staleTime: 60_000,
  })

  const users = data?.users ?? []
  const sorted = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return {
    allUsers: users,
    activeUsers: users.filter((u) => u.is_active).length,
    totalUsers: users.length,
    totalRoles: new Set(users.flatMap((u) => u.roles)).size,
    recentUsers: sorted.slice(0, 5),
    isLoading,
  }
}
