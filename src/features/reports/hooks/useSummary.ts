import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { SummaryData } from '../types'

export function useSummary() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => apiClient.get<SummaryData>('/reports/summary/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { summary, isLoading }
}
