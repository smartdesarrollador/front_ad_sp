import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CatalogItemUpdateRequest, CatalogItem } from '../types'

export function useUpdateCatalogItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: CatalogItemUpdateRequest) => {
      const fd = new FormData()
      if (data.name !== undefined) fd.append('name', data.name)
      if (data.short_description !== undefined) fd.append('short_description', data.short_description)
      if (data.description !== undefined) fd.append('description', data.description)
      if (data.image instanceof File) fd.append('image', data.image)
      if (data.icon_color !== undefined) fd.append('icon_color', data.icon_color)
      if (data.category !== undefined) fd.append('category', data.category)
      if (data.link_url !== undefined) fd.append('link_url', data.link_url)
      if (data.badge_text !== undefined) fd.append('badge_text', data.badge_text)
      if (data.target_apps !== undefined) fd.append('target_apps', JSON.stringify(data.target_apps))
      if (data.is_active !== undefined) fd.append('is_active', String(data.is_active))
      if (data.order !== undefined) fd.append('order', String(data.order))
      return apiClient.patch<CatalogItem>(`/admin/catalog/${id}/`, fd).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}
