import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CurrentSubscription } from '../types'

interface SubscriptionResponse {
  subscription: CurrentSubscription
}

export function useCurrentSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscription'],
    queryFn: () =>
      apiClient.get<SubscriptionResponse>('/admin/subscriptions/current').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    subscription: data?.subscription ?? null,
    isLoading,
  }
}
