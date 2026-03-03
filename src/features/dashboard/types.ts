export interface AdminUser {
  id: string
  email: string
  name: string
  is_active: boolean
  email_verified: boolean
  roles: string[]
  created_at: string
}

export interface AuditLogEntry {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  user_email: string | null
  user_name: string | null
  ip_address: string | null
  created_at: string
}
