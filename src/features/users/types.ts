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
  user_agent?: string
  extra?: Record<string, unknown>
}

export interface Role {
  id: string
  name: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface InviteUserRequest {
  email: string
  role_id?: string
}
