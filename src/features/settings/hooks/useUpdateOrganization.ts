import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { OrganizationUpdateRequest } from '../types'

export function useUpdateOrganization() {
  const setTenant = useAuthStore((s) => s.setTenant)
  const tenant = useAuthStore((s) => s.tenant)

  return useMutation({
    mutationFn: (data: OrganizationUpdateRequest) =>
      apiClient.patch('/admin/organization/', data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      if (tenant) {
        setTenant({ ...tenant, name: variables.name })
      }
    },
  })
}
