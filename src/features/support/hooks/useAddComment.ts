import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AddCommentRequest, TicketComment } from '../types'

export function useAddComment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ ticket_id, message }: AddCommentRequest) =>
      apiClient
        .post<TicketComment>(`/support/tickets/${ticket_id}/comments/`, { message })
        .then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['support-ticket', variables.ticket_id] })
    },
  })
}
