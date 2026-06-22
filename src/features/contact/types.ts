export type ContactStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: ContactStatus
  ip_address: string | null
  created_at: string
  updated_at: string
}

export interface UpdateContactStatusRequest {
  id: string
  status: ContactStatus
}
