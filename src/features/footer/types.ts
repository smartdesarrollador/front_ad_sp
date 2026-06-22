export interface FooterLink {
  id: number
  label: string
  url: string
  order: number
}

export interface FooterConfig {
  tagline: string
  email: string
  whatsapp: string
  phone: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  linkedin_url: string
}

export interface FooterConfigWithLinks extends FooterConfig {
  links: FooterLink[]
  updated_at: string
}

export type FooterUpdateRequest = FooterConfig

export interface FooterLinkRequest {
  label: string
  url: string
  order: number
}
