import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { DesktopRelease } from '../types'

interface ReleasesResponse {
  releases: DesktopRelease[]
}

export function useReleases() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-releases'],
    queryFn: () =>
      apiClient.get<ReleasesResponse>('/admin/releases/').then((r) => r.data),
    staleTime: 30_000,
  })

  return {
    releases: data?.releases ?? [],
    isLoading,
  }
}
