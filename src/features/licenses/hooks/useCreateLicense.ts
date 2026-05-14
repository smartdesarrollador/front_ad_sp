import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateLicenseRequest, DesktopAppLicense } from '../types'

export function useCreateLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLicenseRequest) =>
      apiClient.post<DesktopAppLicense>('/admin/licenses/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licenses'] })
    },
  })
}
