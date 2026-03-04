export interface ProfileUpdateRequest {
  firstName: string
  lastName: string
}

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface MFASetupResponse {
  qr_uri: string
  secret: string
}

export interface OrganizationUpdateRequest {
  name: string
  primary_color: string
}

export interface NotificationPreferences {
  security: boolean
  billing: boolean
  team: boolean
  marketing: boolean
  channel: 'email' | 'in_app' | 'none'
}
