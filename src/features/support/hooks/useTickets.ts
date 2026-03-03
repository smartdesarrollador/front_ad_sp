import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { SupportTicket } from '../types'

export function useTickets() {
  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () =>
      apiClient.get<{ tickets: SupportTicket[] }>('/support/tickets/').then((r) => r.data),
    staleTime: 30_000,
  })

  return {
    tickets: data?.tickets ?? [],
    isLoading,
  }
}
