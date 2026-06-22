import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api'
import type { UpdateContactStatusRequest } from '../types'

export function useUpdateContactStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: UpdateContactStatusRequest) =>
      apiClient.patch(`/admin/contact/${id}/`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-messages'] })
    },
  })
}
