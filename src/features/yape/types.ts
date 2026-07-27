export interface YapeConfig {
  phone: string
  holder_name: string
  is_enabled: boolean
  exchange_rate: string
  instructions_note: string
  updated_at: string | null
}

export type PaymentMethod = 'yape' | 'paypal'

/**
 * Configuración de cobro de un método. Los campos que no aplican a un método llegan
 * vacíos en vez de ausentes, así el contrato es el mismo para todos y es la UI quien
 * decide qué pintar según `method`.
 */
export interface PaymentMethodConfig {
  method: PaymentMethod
  display_name: string
  is_enabled: boolean
  /** Si tiene el dato mínimo para que alguien pueda pagarle. Lo calcula el backend. */
  is_configured: boolean
  sort_order: number
  holder_name: string
  /** Yape */
  phone: string
  /** PayPal */
  checkout_url: string
  account_email: string
  instructions_note: string
  updated_at: string | null
}

export type PaymentMethodConfigUpdate = Partial<
  Pick<
    PaymentMethodConfig,
    | 'display_name'
    | 'is_enabled'
    | 'sort_order'
    | 'holder_name'
    | 'phone'
    | 'checkout_url'
    | 'account_email'
    | 'instructions_note'
  >
>

export type YapeProofStatus = 'pending' | 'approved' | 'rejected'

export interface YapeProofPromo {
  code: string
  original_amount: string
  discount_amount: string
  final_amount: string
}

export type YapeBillingCycle = 'monthly' | 'annual'

export interface YapeProof {
  id: string
  method: PaymentMethod
  /**
   * Moneda en la que cobra el método. Distingue «no hay conversión porque se pagó en
   * dólares» de «no la hay porque el comprobante es anterior al registro de tasa».
   */
  charge_currency: 'USD' | 'PEN'
  /**
   * Referencia verificable del pago cuando el método la da (ID de transacción de
   * PayPal). Vacía en Yape, donde la captura es la única evidencia.
   */
  transaction_reference: string
  screenshot_url: string
  plan: string
  /** Determina si el monto es de 1 mes o de 1 año, y cuántos días activa la aprobación. */
  billing_cycle: YapeBillingCycle
  amount: string
  /**
   * Testigo del cobro: tasa vigente e importe en soles al subir el comprobante.
   * `null` en comprobantes anteriores al registro de tasa. NO recalcular con la
   * tasa de hoy — es justo lo que hace irreconstruible un descuadre.
   */
  exchange_rate: string | null
  amount_pen: string | null
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
  method: string
  date_from: string
  date_to: string
}
