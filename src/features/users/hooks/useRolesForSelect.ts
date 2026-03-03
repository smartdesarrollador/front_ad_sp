import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Role } from '../types'

interface RolesResponse {
  roles: Role[]
}

export function useRolesForSelect() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiClient.get<RolesResponse>('/admin/roles/').then((r) => r.data),
    staleTime: 5 * 60_000,
  })

  return {
    roles: data?.roles ?? [],
    isLoading,
  }
}
