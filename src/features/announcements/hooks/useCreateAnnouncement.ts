import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AnnouncementCreateRequest, Announcement } from '../types'

export function useCreateAnnouncement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: AnnouncementCreateRequest) => {
      const fd = new FormData()
      fd.append('title', data.title)
      if (data.message !== undefined) fd.append('message', data.message)
      if (data.image instanceof File) fd.append('image', data.image)
      if (data.cta_text !== undefined) fd.append('cta_text', data.cta_text)
      if (data.cta_url !== undefined) fd.append('cta_url', data.cta_url)
      fd.append('placement', data.placement ?? 'both')
      fd.append('is_active', String(data.is_active ?? true))
      if (data.starts_at) fd.append('starts_at', data.starts_at)
      if (data.ends_at) fd.append('ends_at', data.ends_at)
      fd.append('priority', String(data.priority ?? 0))
      return apiClient.post<Announcement>('/admin/announcements/', fd).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
  })
}
