export type { AuditLogEntry } from '@/features/users/types'

export interface AuditLogFilters {
  action: string
  resource_type: string
  date_from: string
  date_to: string
  search: string
}

export interface AuditLogsPage {
  logs: import('@/features/users/types').AuditLogEntry[]
  pagination: { page: number; per_page: number; total: number; total_pages: number }
}
