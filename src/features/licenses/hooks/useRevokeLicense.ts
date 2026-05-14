import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { DesktopAppLicense } from '../types'

export function useRevokeLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .patch<DesktopAppLicense>(`/admin/licenses/${id}/`, { is_active: false })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licenses'] })
    },
  })
}

export function useReactivateLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .patch<DesktopAppLicense>(`/admin/licenses/${id}/`, { is_active: true })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licenses'] })
    },
  })
}
