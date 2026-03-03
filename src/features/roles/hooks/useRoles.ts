import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { RoleDetail } from '../types'

interface RolesResponse {
  roles: RoleDetail[]
}

export function useRoles() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiClient.get<RolesResponse>('/admin/roles/').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    roles: data?.roles ?? [],
    isLoading,
  }
}
