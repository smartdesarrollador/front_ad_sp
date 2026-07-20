export type PromotionType = 'percentage' | 'fixed_amount' | 'trial_extension'
export type PromotionStatus = 'active' | 'paused' | 'expired' | 'depleted'

export interface Promotion {
  id: string
  code: string
  name: string
  description: string
  type: PromotionType
  value: number
  max_discount: number | null
  applicable_plans: string[]
  new_customers_only: boolean
  starts_at: string
  expires_at: string
  max_uses: number | null
  max_uses_per_customer: number
  status: PromotionStatus
  current_uses: number
  last_used_at: string | null
  conversion_rate: number
  total_revenue: number
  avg_discount_amount: number
  created_at: string
}

export interface PromotionCreateRequest {
  code: string
  name: string
  description?: string
  type: PromotionType
  value: number
  max_discount?: number | null
  applicable_plans: string[]
  new_customers_only: boolean
  starts_at: string
  expires_at: string
  max_uses?: number | null
  max_uses_per_customer: number
}

export interface PromotionUpdateRequest extends Partial<PromotionCreateRequest> {
  id: string
  status?: PromotionStatus
}

export interface PromotionStats {
  total_redemptions: number
  confirmed: number
  pending: number
  released: number
  total_discount: number
  total_revenue: number
  by_plan: { plan: string; count: number }[]
}
