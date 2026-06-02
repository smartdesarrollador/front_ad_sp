import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { OrganizationUpdateRequest } from '../types'

export function useUpdateOrganization() {
  const setTenant = useAuthStore((s) => s.setTenant)
  const tenant = useAuthStore((s) => s.tenant)

  return useMutation({
    mutationFn: (data: OrganizationUpdateRequest) => {
      if (data.logo || data.favicon) {
        const fd = new FormData()
        fd.append('name', data.name)
        fd.append('primary_color', data.primary_color)
        if (data.logo)    fd.append('logo', data.logo)
        if (data.favicon) fd.append('favicon', data.favicon)
        return apiClient
          .patch('/admin/organization/', fd, { timeout: 60_000 })
          .then((r) => r.data)
      }
      return apiClient
        .patch('/admin/organization/', { name: data.name, primary_color: data.primary_color })
        .then((r) => r.data)
    },
    onSuccess: (data) => {
      if (tenant) {
        const updated = {
          ...tenant,
          name: data.name,
          logo_url: data.logo_url ?? tenant.logo_url,
          favicon_url: data.favicon_url ?? tenant.favicon_url,
        }
        setTenant(updated)
        localStorage.setItem('authTenant', JSON.stringify(updated))
      }
    },
  })
}
