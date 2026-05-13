import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { DesktopRelease, UpdateReleaseRequest } from '../types'

interface UpdateReleasePayload extends UpdateReleaseRequest {
  id: string
}

export function useUpdateRelease() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateReleasePayload) =>
      apiClient
        .patch<DesktopRelease>(`/admin/releases/${id}/`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-releases'] })
    },
  })
}
