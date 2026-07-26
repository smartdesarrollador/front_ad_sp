import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { backendFieldError, backendMessage } from '@/lib/apiErrors'
import { useUpdateCurrencyConfig } from '../hooks/useUpdateCurrencyConfig'
import type { CurrencyConfig, DisplayCurrency } from '../types'

const OPTIONS: { value: DisplayCurrency; label: string }[] = [
  { value: 'USD', label: 'Dólares ($)' },
  { value: 'PEN', label: 'Soles (S/)' },
]

interface Props {
  config: CurrencyConfig
  canEdit: boolean
}

/**
 * Moneda con la que el Hub muestra los precios a quien todavía no ha elegido una.
 *
 * Va en su propia tarjeta y no dentro de `CurrencyRateForm` porque son dos ciclos
 * de vida distintos: aquel form no muta al enviar —abre el modal de impacto con el
 * diff por plan—, se deshabilita si no hay cambios y alimenta la tabla en vivo.
 * Un cambio de moneda por defecto no tiene impacto que previsualizar.
 */
export function DefaultCurrencyCard({ config, canEdit }: Props) {
  const update = useUpdateCurrencyConfig()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<DisplayCurrency | null>(null)

  function select(currency: DisplayCurrency) {
    // Reenviar la que ya está activa dispararía el "debes enviar al menos un
    // campo" del serializer: un error feo por una acción sin efecto.
    if (currency === config.default_display_currency) return
    setError(null)
    setPending(currency)
    update.mutate(
      { default_display_currency: currency },
      {
        onSettled: () => setPending(null),
        onError: (e) =>
          setError(
            backendFieldError(e, 'default_display_currency') ??
              backendMessage(e, 'No se pudo cambiar la moneda por defecto.'),
          ),
      },
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Moneda por defecto del Hub
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Es la moneda con la que se muestran los precios a{' '}
        <strong>quien todavía no ha elegido ninguna</strong>. Los clientes que ya cambiaron de
        moneda conservan su preferencia. No cambia en qué moneda se cobra: eso sigue siendo
        siempre en dólares.
      </p>

      <div className="flex items-center gap-2 mt-4" role="group" aria-label="Moneda por defecto">
        {OPTIONS.map((option) => {
          const active = config.default_display_currency === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              disabled={!canEdit || update.isPending}
              aria-pressed={active}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                active
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {pending === option.value && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {option.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="text-red-500 text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
