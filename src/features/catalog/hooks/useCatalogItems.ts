import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CatalogItem } from '../types'

export function useCatalogItems() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: () => apiClient.get<CatalogItem[]>('/admin/catalog/').then((r) => r.data),
    staleTime: 60_000,
  })

  return { items: data ?? [], isLoading }
}
