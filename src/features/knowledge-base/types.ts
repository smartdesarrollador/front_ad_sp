export type ArticleCategory =
  | 'general'
  | 'pricing'
  | 'features'
  | 'onboarding'
  | 'faq'
  | 'support'

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  general: 'General',
  pricing: 'Precios y Planes',
  features: 'Características',
  onboarding: 'Primeros Pasos',
  faq: 'Preguntas Frecuentes',
  support: 'Soporte',
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: ArticleCategory
  keywords: string[]
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface ArticleWriteRequest {
  title: string
  content: string
  category: ArticleCategory
  keywords: string[]
  order: number
}
