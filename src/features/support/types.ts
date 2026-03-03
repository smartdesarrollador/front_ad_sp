export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed'
export type TicketPriority = 'urgente' | 'alta' | 'media' | 'baja'
export type TicketCategory = 'technical' | 'billing' | 'access' | 'feature_request' | 'other'
export type CommentRole = 'agent' | 'client'

export interface TicketAssignee {
  id: string
  name: string
  email: string
}

export interface TicketComment {
  id: string
  author: string
  role: CommentRole
  message: string
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  reference: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  client_email: string
  assigned_to: TicketAssignee | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicketDetail extends SupportTicket {
  comments: TicketComment[]
}

export interface TicketUpdateRequest {
  id: string
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: string | null
}

export interface AddCommentRequest {
  ticket_id: string
  message: string
}
