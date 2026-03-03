import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useCloseTicket() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/support/tickets/${id}/close/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] })
      qc.invalidateQueries({ queryKey: ['support-ticket', id] })
    },
  })
}
