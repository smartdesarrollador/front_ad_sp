import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { LicensesResponse } from '../types'

interface LicenseFilters {
  search?: string
  status?: string
  plan?: string
}

export function useLicenses(filters: LicenseFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.plan) params.set('plan', filters.plan)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-licenses', filters],
    queryFn: () =>
      apiClient
        .get<LicensesResponse>(`/admin/licenses/?${params.toString()}`)
        .then((r) => r.data),
    staleTime: 30_000,
  })

  return {
    licenses: data?.licenses ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}
