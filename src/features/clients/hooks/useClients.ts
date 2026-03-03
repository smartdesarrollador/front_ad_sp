import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Client } from '../types'

interface ClientsResponse {
  clients: Client[]
}

export function useClients() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => apiClient.get<ClientsResponse>('/admin/clients/').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    clients: data?.clients ?? [],
    isLoading,
  }
}
