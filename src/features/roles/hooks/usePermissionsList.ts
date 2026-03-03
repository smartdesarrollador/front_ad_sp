import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Permission } from '../types'

interface PermissionsResponse {
  permissions: Permission[]
}

export function usePermissionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () =>
      apiClient.get<PermissionsResponse>('/admin/permissions/').then((r) => r.data),
    staleTime: 5 * 60_000,
  })

  return {
    permissions: data?.permissions ?? [],
    isLoading,
  }
}
