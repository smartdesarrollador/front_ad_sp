/**
 * Formatea GB legible: MB cuando es < 1 GB (evita "0.0 GB"), GB con 1 decimal en el resto.
 *   0 → "0 GB" · 0.037 → "38 MB" · 3.5 → "3.5 GB"
 */
export function formatStorage(gb: number): string {
  if (gb <= 0) return '0 GB'
  if (gb < 1) {
    const mb = gb * 1024
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
  }
  return `${gb.toFixed(1)} GB`
}
