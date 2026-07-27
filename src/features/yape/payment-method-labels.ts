import type { PaymentMethod } from './types'

/**
 * Etiquetas y colores del método de pago, compartidos por la tabla, los filtros y el
 * modal de revisión. Un método desconocido (uno nuevo en el backend que este build aún
 * no conoce) cae en el estilo neutro y muestra su código en crudo, en vez de pintarse
 * como si fuera otro.
 */
export const METHOD_LABELS: Record<PaymentMethod, string> = {
  yape:   'Yape',
  paypal: 'PayPal',
}

export const METHOD_CLASSES: Record<PaymentMethod, string> = {
  yape:   'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  paypal: 'bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-300',
}

const NEUTRAL_CLASSES = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'

export function methodLabel(method: string): string {
  return METHOD_LABELS[method as PaymentMethod] ?? method
}

export function methodClasses(method: string): string {
  return METHOD_CLASSES[method as PaymentMethod] ?? NEUTRAL_CLASSES
}
