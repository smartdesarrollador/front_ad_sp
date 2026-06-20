import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ArticleWriteRequest, KnowledgeArticle } from '../types'

const QB_KEY = ['admin-kb']

export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ArticleWriteRequest) =>
      apiClient.post<KnowledgeArticle>('/admin/knowledge-base/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QB_KEY }),
  })
}

export function useUpdateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: ArticleWriteRequest & { id: string }) =>
      apiClient
        .patch<KnowledgeArticle>(`/admin/knowledge-base/${id}/`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QB_KEY }),
  })
}

export function useDeleteArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/knowledge-base/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QB_KEY }),
  })
}

export function useToggleArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post<{ is_active: boolean }>(`/admin/knowledge-base/${id}/toggle/`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QB_KEY }),
  })
}
