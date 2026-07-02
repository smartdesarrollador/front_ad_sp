import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Announcement } from '../types'

export function useAnnouncements() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => apiClient.get<Announcement[]>('/admin/announcements/').then((r) => r.data),
    staleTime: 60_000,
  })

  return { items: data ?? [], isLoading }
}
