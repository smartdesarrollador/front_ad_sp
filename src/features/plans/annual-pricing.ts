/**
 * Aritmética del precio anual de un plan.
 *
 * Desde que el ciclo anual cobra de verdad (ver
 * `prd/features/renovacion-y-expiracion-de-planes.md`), lo que un admin escribe en
 * "Precio anual ($)" es literalmente lo que paga el cliente. Estas funciones traducen
 * ese número a lo que significa —descuento y ahorro— y espejan la regla que el backend
 * valida en `PlanUpdateSerializer.validate()`.
 *
 * OJO: hay un gemelo en el Hub
 * (`apps/frontend_next_hub/features/subscription/plans-data.ts`), que usa la misma
 * fórmula para anunciar el descuento al cliente. Son apps independientes (cada una con
 * su Docker, sin paquete compartido), así que la duplicación es deliberada: si cambias
 * la fórmula aquí, cámbiala allí.
 */

export const MONTHS_PER_YEAR = 12

/** Ahorro en USD frente a pagar 12 mensualidades. Negativo si el anual es más caro. */
export function annualSavings(priceMonthly: number, priceAnnual: number): number {
  return priceMonthly * MONTHS_PER_YEAR - priceAnnual
}

/**
 * Descuento anual en % entero, o `null` si no hay ahorro real que anunciar (sin precio,
 * sin descuento, o anual más caro). Devolver `null` en vez de 0 obliga a decidir qué
 * mostrar cuando no hay nada que ofrecer, en lugar de anunciar un "−0%".
 */
export function annualDiscountPercent(
  priceMonthly: number,
  priceAnnual: number,
): number | null {
  if (!priceMonthly || !priceAnnual || priceMonthly <= 0 || priceAnnual <= 0) return null
  const savings = annualSavings(priceMonthly, priceAnnual)
  if (savings <= 0) return null
  return Math.round((savings / (priceMonthly * MONTHS_PER_YEAR)) * 100)
}

/**
 * La regla del backend, espejada para dar feedback antes de enviar el formulario: un
 * anual por encima de 12 mensualidades cobraría MÁS a quien se compromete por más
 * tiempo, al revés del descuento que la UI del cliente anuncia. El servidor sigue siendo
 * la autoridad; esto solo evita el viaje de ida y vuelta.
 */
export function exceedsTwelveMonths(priceMonthly: number, priceAnnual: number): boolean {
  if (!Number.isFinite(priceMonthly) || !Number.isFinite(priceAnnual)) return false
  return priceAnnual > priceMonthly * MONTHS_PER_YEAR
}
