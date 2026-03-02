export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  roles: string[]
  permissions: string[]
  status: 'active' | 'inactive' | 'pending'
  mfaEnabled: boolean
  tenantId: string
  lastLogin: string | null
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}
