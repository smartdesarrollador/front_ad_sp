import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AuditLogFilters, AuditLogsPage } from '../types'

export function useAuditLogs(filters: AuditLogFilters) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number> = { page: pageParam as number, per_page: 25 }
      if (filters.action) params.action = filters.action
      if (filters.resource_type) params.resource_type = filters.resource_type
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const response = await apiClient.get<AuditLogsPage>('/admin/audit-logs/', { params })
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination
      return page < total_pages ? page + 1 : undefined
    },
  })

  const logs = data?.pages.flatMap((p) => p.logs) ?? []

  return { logs, data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading }
}
