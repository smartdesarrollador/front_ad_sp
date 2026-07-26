/**
 * Conversión y formato USD → PEN.
 *
 * USD es la moneda base y la ÚNICA que se persiste: los precios de `Plan`, los
 * importes de las facturas y los comprobantes de pago están todos en dólares
 * (ver `utils/currency.py` en el backend). Este módulo solo decide cómo se
 * PINTA un importe — ningún valor que salga de aquí se envía al servidor.
 *
 * OJO: hay un gemelo de estas funciones en el Hub
 * (`apps/frontend_next_hub/lib/currency.ts`), sin la parte de validación del rango
 * porque allí no se edita la tasa. Son apps independientes, cada una con su Docker
 * y sin paquete compartido, así que la duplicación es deliberada — igual que la de
 * `features/plans/annual-pricing.ts`. Si cambias una fórmula aquí, cámbiala allí.
 */

export const BASE_CURRENCY = 'USD'
export const SUPPORTED_CURRENCIES = ['USD', 'PEN'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

/**
 * Espeja `CurrencyConfigUpdateSerializer.MIN_RATE/MAX_RATE`
 * (`apps/backend_django/apps/subscriptions/serializers.py`). El servidor sigue
 * siendo la autoridad; esto solo evita el viaje de ida y vuelta.
 */
export const MIN_USD_TO_PEN = 1
export const MAX_USD_TO_PEN = 20

/** `decimal_places=4` del campo `CurrencyConfig.usd_to_pen`. */
export const RATE_DECIMALS = 4

/**
 * Un precio de catálogo con céntimos comunica una precisión que no existe: es
 * una referencia, no lo que se cobra. Un importe a transferir, en cambio, se
 * teclea exacto — redondearlo a soles enteros haría que el comprobante no
 * cuadre con lo esperado.
 */
export const CATALOG_DECIMALS = 0
export const AMOUNT_DECIMALS = 2

const LOCALES: Record<Currency, string> = { USD: 'en-US', PEN: 'es-PE' }

// PlanCard formatea varias veces por render y la tabla de conversión ocho veces;
// construir un Intl.NumberFormat es caro comparado con formatear.
const formatters = new Map<string, Intl.NumberFormat>()

/** Half-up explícito: la regla queda testeable en vez de depender del redondeo interno de Intl. */
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Convierte a número el tipo de cambio que llega del backend como string de 4
 * decimales. Devuelve `null` ante cualquier valor no utilizable — vacío, basura,
 * cero o negativo — y **nunca** un valor por defecto: un `?? 3.75` pintaría un
 * precio falso con total confianza en una pantalla de precios.
 */
export function parseRate(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/** Mensaje de error si la tasa está fuera del rango que acepta el backend, o `null` si es válida. */
export function rateRangeError(rate: number): string | null {
  if (!Number.isFinite(rate)) return 'Introduce un tipo de cambio válido.'
  if (rate < MIN_USD_TO_PEN || rate > MAX_USD_TO_PEN) {
    return (
      `El tipo de cambio (${rate}) está fuera del rango permitido ` +
      `(${MIN_USD_TO_PEN} – ${MAX_USD_TO_PEN}). Verifica que sean soles por dólar ` +
      `(ej. 3.7500), no céntimos.`
    )
  }
  return null
}

/** Importe en USD → su equivalente en la moneda de la tasa. `null` si no hay tasa utilizable. */
export function convertUsd(amountUsd: number, rate: number | null): number | null {
  if (rate === null || !Number.isFinite(amountUsd)) return null
  return amountUsd * rate
}

/**
 * Importe formateado con el símbolo de su moneda.
 *
 * `Intl` inserta un espacio duro (U+00A0) entre "S/" y el número; se normaliza a
 * espacio normal para que copiar el valor no arrastre un carácter invisible y
 * para que los tests se lean `'S/ 296'` en vez de un escape.
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  decimals: number = CATALOG_DECIMALS,
): string {
  const key = `${currency}:${decimals}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALES[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(key, formatter)
  }
  return formatter.format(roundTo(amount, decimals)).replace(/\u00A0/g, ' ')
}

/**
 * Atajo para el caso habitual: un precio en USD mostrado como referencia en
 * soles. `null` cuando no hay tasa — el llamador debe omitir la línea entera en
 * ese caso, no pintar un cero.
 */
export function formatUsdAsPen(
  amountUsd: number,
  rate: number | null,
  decimals: number = CATALOG_DECIMALS,
): string | null {
  const converted = convertUsd(amountUsd, rate)
  return converted === null ? null : formatMoney(converted, 'PEN', decimals)
}
