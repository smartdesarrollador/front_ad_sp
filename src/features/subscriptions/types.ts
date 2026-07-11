export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise'

export interface SubscriptionUsage {
  users: { current: number; limit: number | null }
  storage: { current_gb: number; limit_gb: number | null }
  api_calls: { current: number; limit: number | null }
}
