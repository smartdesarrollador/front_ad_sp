export type AnnouncementPlacement = 'home' | 'dashboard' | 'both'

export interface Announcement {
  id: string
  title: string
  message: string
  image_url: string | null
  cta_text: string
  cta_url: string
  placement: AnnouncementPlacement
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  priority: number
  created_at: string
}

export interface AnnouncementCreateRequest {
  title: string
  message?: string
  image?: File
  cta_text?: string
  cta_url?: string
  placement?: AnnouncementPlacement
  is_active?: boolean
  starts_at?: string
  ends_at?: string
  priority?: number
}

export interface AnnouncementUpdateRequest extends Partial<AnnouncementCreateRequest> {
  id: string
}
