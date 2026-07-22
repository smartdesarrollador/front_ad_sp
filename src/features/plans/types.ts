export interface PlanHighlight {
  label: string
  included: boolean
}

export interface PlanLimits {
  max_users: number | null
  storage_gb: number | null
  max_projects: number | null
  max_custom_roles: number | null
  api_calls_per_month: number | null
  max_image_upload_mb: number | null
  max_file_upload_mb: number | null
}

export interface AdminPlan {
  id: 'free' | 'starter' | 'professional' | 'enterprise'
  display_name: string
  description: string
  price_monthly: number
  price_annual: number
  popular: boolean
  highlights: PlanHighlight[]
  limits: PlanLimits
  updated_at: string
}

export interface PlanUpdateRequest {
  display_name?: string
  description?: string
  price_monthly?: number
  price_annual?: number
  popular?: boolean
  highlights?: PlanHighlight[]
  limits?: PlanLimits
}
