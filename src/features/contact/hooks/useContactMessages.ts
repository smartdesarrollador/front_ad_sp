import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api'
import type { ContactMessage, ContactStatus } from '../types'

interface Filters {
  status?: ContactStatus | 'all'
  search?: string
}

export function useContactMessages(filters: Filters = {}) {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  const { data, isLoading } = useQuery({
    queryKey: ['contact-messages', filters],
    queryFn: () =>
      apiClient
        .get<{ messages: ContactMessage[] }>(`/admin/contact/?${params.toString()}`)
        .then((r) => r.data),
    staleTime: 30_000,
  })

  return { messages: data?.messages ?? [], isLoading }
}
