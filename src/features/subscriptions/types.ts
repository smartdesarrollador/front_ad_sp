export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
export type BillingCycle = 'monthly' | 'annual'
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible'

export interface SubscriptionUsage {
  users: { current: number; limit: number | null }
  storage: { current_gb: number; limit_gb: number | null }
  api_calls: { current: number; limit: number | null }
}

export interface CurrentSubscription {
  id: string
  plan: PlanType
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  cancel_at_period_end: boolean
  trial_end: string | null
  current_period_end: string | null
  created_at: string
  usage: SubscriptionUsage
}

export interface Invoice {
  id: string
  amount_cents: number
  amount_display: string
  currency: string
  status: InvoiceStatus
  pdf_url: string
  period_start: string | null
  period_end: string | null
  invoice_date: string | null
  paid_at: string | null
  created_at: string
}

export interface UpgradeRequest {
  plan: PlanType
  billing_cycle: BillingCycle
}

export interface PlanData {
  id: PlanType
  displayName: string
  priceMonthly: number | null
  priceAnnual: number | null
  description: string
  popular: boolean
  features: { name: string; included: boolean }[]
}
