import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CatalogItemCreateRequest, CatalogItem } from '../types'

export function useCreateCatalogItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CatalogItemCreateRequest) => {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('short_description', data.short_description)
      if (data.description) fd.append('description', data.description)
      if (data.image instanceof File) fd.append('image', data.image)
      fd.append('icon_color', data.icon_color ?? '#6366f1')
      fd.append('category', data.category ?? '')
      fd.append('link_url', data.link_url ?? '')
      fd.append('badge_text', data.badge_text ?? '')
      fd.append('target_apps', JSON.stringify(data.target_apps ?? []))
      fd.append('is_active', String(data.is_active ?? true))
      fd.append('order', String(data.order ?? 0))
      return apiClient.post<CatalogItem>('/admin/catalog/', fd).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}
