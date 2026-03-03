export type { Invoice, InvoiceStatus } from '@/features/subscriptions/types'

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
  card_type: string
}
