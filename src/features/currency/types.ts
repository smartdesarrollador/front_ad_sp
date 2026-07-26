export type DisplayCurrency = 'USD' | 'PEN'

export interface CurrencyConfig {
  /** String decimal de 4 decimales, ej. "3.7500" — es como lo emite el DecimalField de DRF. */
  usd_to_pen: string
  /** Moneda que el Hub mostrará por defecto. Se gestionará desde la UI en la Fase 3. */
  default_display_currency: DisplayCurrency
  /** Hoy siempre 'manual': la vista lo fuerza y el serializer no lo acepta del cliente. */
  source: 'manual' | 'auto'
  /** `Record<string, _>` a propósito: el backend documenta la forma como extensible a N monedas. */
  rates: Record<string, string>
  updated_at: string
  updated_by_email: string | null
}

/** `source` queda fuera: el serializer no lo acepta (ver CurrencyConfigUpdateSerializer). */
export interface CurrencyConfigUpdate {
  usd_to_pen?: string
  default_display_currency?: DisplayCurrency
}
