import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { TrendsData } from '../types'

export function useTrends(period: '7d' | '30d' | '90d') {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['reports-trends', period],
    queryFn: () =>
      apiClient
        // NOTE: real backend shape is {date, active_tasks, completed_tasks, new_projects} —
        // UsageTrendsChart's active_users/api_requests lines will render empty until that
        // contract mismatch is fixed separately (tracked like the ExportButton gate mismatch).
        .get<TrendsData>(`/app/reports/trends/?period=${period}`)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { trends, isLoading }
}
