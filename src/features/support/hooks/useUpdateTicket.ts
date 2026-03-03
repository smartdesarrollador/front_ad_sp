import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { TicketUpdateRequest, SupportTicket } from '../types'

export function useUpdateTicket() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: TicketUpdateRequest) =>
      apiClient.patch<SupportTicket>(`/support/tickets/${id}/`, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] })
      qc.invalidateQueries({ queryKey: ['support-ticket', variables.id] })
    },
  })
}
