export interface YapeConfig {
  phone: string
  holder_name: string
  is_enabled: boolean
  exchange_rate: string
  instructions_note: string
  updated_at: string | null
}

export type YapeProofStatus = 'pending' | 'approved' | 'rejected'

export interface YapeProofPromo {
  code: string
  original_amount: string
  discount_amount: string
  final_amount: string
}

export interface YapeProof {
  id: string
  screenshot_url: string
  plan: string
  amount: string
  promo: YapeProofPromo | null
  status: YapeProofStatus
  tenant_name: string
  tenant_email: string
  tenant_slug: string
  created_at: string
  reviewed_at: string | null
}

export interface YapeProofsKpi {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface YapeProofsResponse {
  proofs: YapeProof[]
  kpi: YapeProofsKpi
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface YapeProofFilters {
  status: string
  plan: string
  date_from: string
  date_to: string
}
