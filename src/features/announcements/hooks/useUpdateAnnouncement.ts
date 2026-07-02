import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AnnouncementUpdateRequest, Announcement } from '../types'

export function useUpdateAnnouncement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: AnnouncementUpdateRequest) => {
      const fd = new FormData()
      if (data.title !== undefined) fd.append('title', data.title)
      if (data.message !== undefined) fd.append('message', data.message)
      if (data.image instanceof File) fd.append('image', data.image)
      if (data.cta_text !== undefined) fd.append('cta_text', data.cta_text)
      if (data.cta_url !== undefined) fd.append('cta_url', data.cta_url)
      if (data.placement !== undefined) fd.append('placement', data.placement)
      if (data.is_active !== undefined) fd.append('is_active', String(data.is_active))
      if (data.starts_at !== undefined) fd.append('starts_at', data.starts_at)
      if (data.ends_at !== undefined) fd.append('ends_at', data.ends_at)
      if (data.priority !== undefined) fd.append('priority', String(data.priority))
      return apiClient.patch<Announcement>(`/admin/announcements/${id}/`, fd).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
  })
}
