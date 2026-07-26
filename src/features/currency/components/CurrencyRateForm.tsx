import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Loader2 } from 'lucide-react'
import { backendFieldError, backendMessage } from '@/lib/apiErrors'
import { MAX_USD_TO_PEN, MIN_USD_TO_PEN, parseRate, rateRangeError } from '@/lib/currency'
import type { AdminPlan } from '@/features/plans/types'
import { useUpdateCurrencyConfig } from '../hooks/useUpdateCurrencyConfig'
import type { CurrencyConfig } from '../types'
import { CurrencyImpactModal } from './CurrencyImpactModal'

/** Hasta 4 decimales, los que admite CurrencyConfig.usd_to_pen. */
const RATE_PATTERN = /^\d+(\.\d{1,4})?$/

const baseSchema = z.object({
  usd_to_pen: z
    .string()
    .min(1, 'Requerido')
    .regex(RATE_PATTERN, 'Usa un número con hasta 4 decimales (ej. 3.7500)'),
})

// Espeja CurrencyConfigUpdateSerializer.validate_usd_to_pen. El servidor sigue siendo
// la autoridad — ver el onError del confirm.
const schema = baseSchema.superRefine((data, ctx) => {
  const message = rateRangeError(Number(data.usd_to_pen))
  if (message) ctx.addIssue({ code: 'custom', path: ['usd_to_pen'], message })
})

// Del BASE, no del refinado: mismo patrón que PlanEditModal.
type FormData = z.infer<typeof baseSchema>

interface Props {
  config: CurrencyConfig
  plans: AdminPlan[]
  plansFailed: boolean
  /** Notifica la tasa que se está tecleando para que la tabla se actualice en vivo. */
  onRateDraft: (rate: number | null) => void
}

export function CurrencyRateForm({ config, plans, plansFailed, onRateDraft }: Props) {
  const update = useUpdateCurrencyConfig()
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  /** Valor pendiente de confirmar; `null` = no hay diálogo abierto. */
  const [pending, setPending] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { usd_to_pen: config.usd_to_pen },
  })

  useEffect(() => {
    reset({ usd_to_pen: config.usd_to_pen })
  }, [config, reset])

  const typedRate = watch('usd_to_pen')

  useEffect(() => {
    onRateDraft(parseRate(typedRate))
  }, [typedRate, onRateDraft])

  // El submit no muta: abre la confirmación con el impacto sobre los precios.
  function onSubmit(data: FormData) {
    setSaved(false)
    setSubmitError(null)
    setPending(data.usd_to_pen)
  }

  function handleConfirm() {
    if (pending === null) return
    update.mutate(
      { usd_to_pen: pending },
      {
        onSuccess: () => {
          setPending(null)
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        },
        onError: (error) => {
          // Cierra la confirmación: el motivo pertenece al campo, no al diálogo.
          setPending(null)
          const fieldError = backendFieldError(error, 'usd_to_pen')
          if (fieldError) {
            setError('usd_to_pen', { type: 'server', message: fieldError })
            return
          }
          setSubmitError(
            backendMessage(error, 'No se pudo guardar el tipo de cambio. Intenta de nuevo.'),
          )
        },
      },
    )
  }

  return (
    <>
      {/* noValidate: sin él, min/max/step del input bloquean el submit por validación
          nativa del navegador y el mensaje de rango de zod —el que explica el error de
          céntimos— nunca llega a verse; en su lugar sale el bocadillo nativo, que no se
          puede redactar ni traducir. Los atributos se conservan porque siguen guiando al
          spinner y al teclado móvil. */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-5"
      >
        <div>
          <label
            htmlFor="usd-to-pen"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tipo de cambio (soles por dólar)
          </label>
          <input
            id="usd-to-pen"
            type="number"
            step="0.0001"
            min={MIN_USD_TO_PEN}
            max={MAX_USD_TO_PEN}
            inputMode="decimal"
            {...register('usd_to_pen')}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.usd_to_pen ? (
            <p className="text-red-500 text-xs mt-1">{errors.usd_to_pen.message}</p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Rango permitido: {MIN_USD_TO_PEN.toFixed(4)} – {MAX_USD_TO_PEN.toFixed(4)}
            </p>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm"
          >
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            // Guardar sin cambios dispararía el "Debes enviar al menos un campo" del
            // serializer: un error feo por una acción legítima.
            disabled={!isDirty || update.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {update.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
              <Check className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </form>

      {pending !== null && (
        <CurrencyImpactModal
          currentRate={parseRate(config.usd_to_pen)}
          newRate={Number(pending)}
          plans={plans}
          plansFailed={plansFailed}
          isPending={update.isPending}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  )
}
