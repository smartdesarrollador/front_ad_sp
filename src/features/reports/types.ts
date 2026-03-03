export interface SummaryData {
  total_users: number
  active_users: number
  new_users_this_month: number
  mrr: number
  arr: number
  avg_revenue_per_user: number
  churn_rate: number
  trial_conversions: number
}

export interface RoleDistributionItem {
  role: string
  count: number
  percentage: number
}

export interface UsageData {
  role_distribution: RoleDistributionItem[]
  top_permissions: { permission: string; usage_count: number }[]
  monthly_growth: { month: string; users: number; revenue: number }[]
}

export interface TrendPoint {
  date: string
  active_users: number
  new_projects: number
  api_requests: number
}

export interface TrendsData {
  period: string
  data: TrendPoint[]
}
