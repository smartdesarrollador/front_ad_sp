import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { FooterConfigWithLinks } from '../types'

export function useFooterConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-footer'],
    queryFn: () =>
      apiClient.get<FooterConfigWithLinks>('/admin/footer/').then((r) => r.data),
    staleTime: 60_000,
  })

  return { footer: data, isLoading }
}
