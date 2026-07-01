export type TargetApp = 'desktop' | 'mobile' | 'web'

export interface CatalogItem {
  id: string
  name: string
  short_description: string
  description: string
  image_url: string | null
  icon_color: string
  category: string
  link_url: string
  badge_text: string
  target_apps: TargetApp[]
  is_active: boolean
  order: number
  created_at: string
}

export interface CatalogItemCreateRequest {
  name: string
  short_description: string
  description?: string
  image?: File
  icon_color?: string
  category?: string
  link_url?: string
  badge_text?: string
  target_apps?: TargetApp[]
  is_active?: boolean
  order?: number
}

export interface CatalogItemUpdateRequest extends Partial<CatalogItemCreateRequest> {
  id: string
}
