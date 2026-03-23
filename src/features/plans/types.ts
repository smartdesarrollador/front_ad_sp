export interface PlanHighlight {
  label: string
  included: boolean
}

export interface AdminPlan {
  id: 'free' | 'starter' | 'professional' | 'enterprise'
  display_name: string
  description: string
  price_monthly: number
  price_annual: number
  popular: boolean
  highlights: PlanHighlight[]
  updated_at: string
}

export interface PlanUpdateRequest {
  display_name?: string
  description?: string
  price_monthly?: number
  price_annual?: number
  popular?: boolean
  highlights?: PlanHighlight[]
}
