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

export interface ServiceAdoptionItem {
  service: string
  name: string
  acquired: number
  activated: number
  activation_rate: number
}

export interface ServiceAdoptionData {
  services: ServiceAdoptionItem[]
}

export interface VistaTrafficServiceItem {
  service: string
  views: number
  unique_views: number
  shares: number
}

export interface VistaTrafficReferrer {
  source: string
  visits: number
}

export interface VistaTrafficData {
  period_days: number
  services: VistaTrafficServiceItem[]
  referrers: VistaTrafficReferrer[]
}

export interface DesktopLicenseFunnelData {
  total: number
  sent: number
  activated: number
  pending: number
  revoked: number
  activation_rate: number
}
