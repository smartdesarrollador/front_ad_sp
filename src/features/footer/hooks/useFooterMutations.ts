import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { FooterUpdateRequest, FooterLinkRequest } from '../types'

export function useUpdateFooter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FooterUpdateRequest) =>
      apiClient.put('/admin/footer/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-footer'] }),
  })
}

export function useCreateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FooterLinkRequest) =>
      apiClient.post('/admin/footer/links/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-footer'] }),
  })
}

export function useUpdateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FooterLinkRequest> & { id: number }) =>
      apiClient.patch(`/admin/footer/links/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-footer'] }),
  })
}

export function useDeleteLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/admin/footer/links/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-footer'] }),
  })
}
