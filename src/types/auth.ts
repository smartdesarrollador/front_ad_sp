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
  is_staff: boolean
  tenantId: string
  lastLogin: string | null
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
  tenant: Tenant
}

export interface MFALoginResponse {
  mfa_required: true
  mfa_token: string
}

export interface RegisterRequest {
  name: string
  email: string
  organizationName: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}
