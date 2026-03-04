import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AppNotification } from '../types'

export function useNotifications() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () =>
      apiClient
        .get<{ notifications: AppNotification[] }>('/admin/notifications/')
        .then((r) => r.data),
    refetchInterval: 60_000,
  })

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, isLoading }
}
