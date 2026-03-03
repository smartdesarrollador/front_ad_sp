import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AuditLogEntry } from '../types'

interface AuditLogsResponse {
  logs: AuditLogEntry[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export function useRecentAudit() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-audit-logs'],
    queryFn: () =>
      apiClient
        .get<AuditLogsResponse>('/admin/audit-logs/', { params: { per_page: 5, page: 1 } })
        .then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    logs: data?.logs ?? [],
    isLoading,
  }
}
