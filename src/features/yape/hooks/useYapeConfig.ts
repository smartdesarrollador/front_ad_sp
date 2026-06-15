import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { YapeConfig } from '../types'

export function useYapeConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ['yape-config'],
    queryFn: () => apiClient.get<YapeConfig>('/admin/yape/config/').then((r) => r.data),
    staleTime: 60_000,
  })
  return { config: data ?? null, isLoading }
}
