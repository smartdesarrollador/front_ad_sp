/**
 * Lectura de errores de validación del backend.
 *
 * El API devuelve los errores de campo en DOS formas según cómo los emita la vista:
 *
 *   1. `{ error: { price_annual: ['...'] } }`
 *      Vistas que construyen la respuesta a mano (ej. AdminPlanDetailView, que hace
 *      `Response({'error': serializer.errors}, 400)`).
 *
 *   2. `{ error: { code, message, details: { usd_to_pen: ['...'] } } }`
 *      Vistas que usan `serializer.is_valid(raise_exception=True)` y pasan por
 *      `core/exceptions.py::custom_exception_handler`.
 *
 * Buscar solo en la primera dejaba mudos los formularios que pegan contra vistas del
 * segundo tipo: el backend rechazaba el dato con un motivo claro y el usuario solo veía
 * el botón girar.
 */

interface ErrorEnvelope {
  response?: {
    data?: {
      error?: Record<string, unknown> & { details?: Record<string, unknown> }
    }
  }
}

function firstString(value: unknown): string | null {
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return typeof value === 'string' ? value : null
}

/** Mensaje de error de un campo concreto en la respuesta 400 del backend. */
export function backendFieldError(error: unknown, field: string): string | null {
  const data = (error as ErrorEnvelope).response?.data?.error
  if (!data) return null
  return firstString(data[field]) ?? firstString(data.details?.[field]) ?? null
}

/** Mensaje general del error, para cuando no corresponde a un campo del formulario. */
export function backendMessage(error: unknown, fallback: string): string {
  const data = (error as ErrorEnvelope).response?.data?.error
  return firstString(data?.message) ?? firstString(data?.detail) ?? fallback
}
