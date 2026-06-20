import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { KnowledgeArticle } from '../types'

export function useKnowledgeBase() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kb'],
    queryFn: () =>
      apiClient
        .get<{ articles: KnowledgeArticle[] }>('/admin/knowledge-base/')
        .then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    articles: data?.articles ?? [],
    isLoading,
  }
}
