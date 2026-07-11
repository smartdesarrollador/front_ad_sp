import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { SupportTicketDetail } from '../types'

export function useTicketDetail(ticketId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () =>
      apiClient
        .get<{ ticket: SupportTicketDetail }>(`/support/tickets/${ticketId}/`)
        .then((r) => r.data.ticket),
    enabled: !!ticketId,
  })

  return {
    ticket: data ?? null,
    isLoading,
  }
}
