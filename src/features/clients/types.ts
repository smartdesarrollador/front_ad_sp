import type { SubscriptionUsage, PlanType } from '@/features/subscriptions/types'

export type { SubscriptionUsage, PlanType }

export type ClientSubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled'

export interface ClientSubscription {
  status: ClientSubscriptionStatus
  plan: PlanType
  plan_name: string
  mrr: number
  trial_ends_at: string | null
}

export interface ClientUser {
  id: string
  name: string
  email: string
  is_active: boolean
  roles: string[]
}

export interface Client {
  id: string
  name: string
  slug: string
  subdomain: string
  admin_email: string
  is_active: boolean
  primary_color: string | null
  subscription: ClientSubscription
  usage: SubscriptionUsage
  recent_users: ClientUser[]
  created_at: string
}
