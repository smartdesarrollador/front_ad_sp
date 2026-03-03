import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminUser } from '../types'

interface UsersResponse {
  users: AdminUser[]
}

export function useUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<UsersResponse>('/admin/users/').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    users: data?.users ?? [],
    isLoading,
  }
}
