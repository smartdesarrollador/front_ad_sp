export type LicenseStatus = 'active' | 'pending' | 'revoked'

export interface DesktopAppLicense {
  id: string
  user_email: string
  tenant_name: string
  tenant_plan: string
  license_key: string
  status: LicenseStatus
  hardware_id: string
  activated_at: string | null
  expires_at: string | null
  is_active: boolean
  sent_at: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface LicensesResponse {
  licenses: DesktopAppLicense[]
  total: number
}

export interface CreateLicenseRequest {
  user_id: string
  expires_at?: string | null
  notes?: string
  send_email?: boolean
}

export interface UpdateLicenseRequest {
  is_active?: boolean
  expires_at?: string | null
  notes?: string
}
