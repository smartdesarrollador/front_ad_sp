import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { UsageData } from '../types'

export function useUsageReport() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['reports-usage'],
    queryFn: () => apiClient.get<UsageData>('/reports/usage/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { usage, isLoading }
}
