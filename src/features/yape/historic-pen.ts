/**
 * Lectura del importe en soles que acompaña a un comprobante.
 *
 * Deliberadamente NO usa `parseRate` de `@/lib/currency`: aquella rechaza el `0`
 * porque una tasa de cambio cero no es utilizable, pero aquí el `0` es un importe
 * legítimo (un plan gratuito, un cupón del 100%) y mostrarlo como "sin conversión"
 * sería mentir.
 */
export function historicPen(amountPen: string | null): number | null {
  if (amountPen === null) return null
  const parsed = Number(amountPen)
  return Number.isFinite(parsed) ? parsed : null
}
