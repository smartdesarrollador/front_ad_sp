import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Check, CreditCard, Loader2, Smartphone } from 'lucide-react'
import { backendFieldError, backendMessage } from '@/lib/apiErrors'
import { useCurrencyConfig } from '@/features/currency/hooks/useCurrencyConfig'
import { useUpdatePaymentMethod } from '../hooks/useUpdatePaymentMethod'
import type { PaymentMethod, PaymentMethodConfig } from '../types'

/**
 * `exchange_rate` NO está aquí a propósito: se gestiona en Moneda (/currency), que es su
 * fuente de verdad (CurrencyConfig). Dos campos editables del mismo número acaban
 * divergiendo. Al no estar en el formulario, tampoco viaja en el PATCH.
 *
 * Tampoco se replica aquí el guardarraíl «no habilitar sin destino de pago»: vive en el
 * backend, y duplicarlo daría dos reglas que se pueden desincronizar. El 400 se pinta
 * junto al interruptor.
 */
const schema = z.object({
  holder_name:       z.string(),
  phone:             z.string(),
  checkout_url:      z.string().url('Debe ser un enlace válido (https://...)').or(z.literal('')),
  account_email:     z.string().email('Correo inválido').or(z.literal('')),
  instructions_note: z.string(),
  is_enabled:        z.boolean(),
})

type FormData = z.infer<typeof schema>

/** Campos editables de cada método. Lo que no está aquí no se pinta ni se envía. */
const FIELDS_BY_METHOD: Record<PaymentMethod, (keyof FormData)[]> = {
  yape:   ['phone', 'holder_name'],
  paypal: ['checkout_url', 'account_email', 'holder_name'],
}

const METHOD_ICON: Record<PaymentMethod, typeof Smartphone> = {
  yape:   Smartphone,
  paypal: CreditCard,
}

interface FieldMeta {
  label: string
  placeholder: string
  hint?: string
  type?: string
}

const FIELD_META: Record<string, FieldMeta> = {
  phone: {
    label:       'Número Yape',
    placeholder: '955 365 043',
  },
  checkout_url: {
    label:       'Enlace de pago',
    placeholder: 'https://paypal.me/tuempresa',
    hint:        'El cliente abre este enlace para pagar. Ej. tu PayPal.me.',
  },
  account_email: {
    label:       'Correo de la cuenta',
    placeholder: 'pagos@tuempresa.com',
    hint:        'Alternativa al enlace: el cliente envía el pago a este correo.',
    type:        'email',
  },
  holder_name: {
    label:       'Titular de la cuenta',
    placeholder: 'Juan Pérez García',
  },
}

interface Props {
  config: PaymentMethodConfig
  canManage: boolean
}

export function PaymentMethodCard({ config, canManage }: Props) {
  const update = useUpdatePaymentMethod()
  // Fuente de verdad del tipo de cambio; aquí solo se muestra.
  const { config: currency } = useCurrencyConfig()
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Motivo por el que el backend rechazó habilitar el método: va junto al interruptor,
  // que es donde el admin acaba de actuar.
  const [enabledError, setEnabledError] = useState<string | null>(null)

  const fields = FIELDS_BY_METHOD[config.method] ?? []
  const Icon = METHOD_ICON[config.method] ?? CreditCard

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      holder_name: '', phone: '', checkout_url: '', account_email: '',
      instructions_note: '', is_enabled: false,
    },
  })

  useEffect(() => {
    reset({
      holder_name:       config.holder_name,
      phone:             config.phone,
      checkout_url:      config.checkout_url,
      account_email:     config.account_email,
      instructions_note: config.instructions_note,
      is_enabled:        config.is_enabled,
    })
  }, [config, reset])

  const isEnabled = watch('is_enabled')

  function onSubmit(data: FormData) {
    setSaved(false)
    setSubmitError(null)
    setEnabledError(null)

    // Solo lo que cambió: un PATCH parcial evita pisar con '' un campo que este método
    // ni siquiera muestra.
    const editable: (keyof FormData)[] = [...fields, 'instructions_note', 'is_enabled']
    const payload = Object.fromEntries(
      (Object.keys(dirtyFields) as (keyof FormData)[])
        .filter((field) => editable.includes(field))
        .map((field) => [field, data[field]]),
    )
    if (Object.keys(payload).length === 0) return

    update.mutate({ method: config.method, data: payload }, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
      // Sin esto, un guardado rechazado por el backend sería MUDO: el botón gira y
      // nada más (LL-110).
      onError: (error) => {
        const enabled = backendFieldError(error, 'is_enabled')
        if (enabled) {
          setEnabledError(enabled)
          return
        }
        setSubmitError(
          backendMessage(error, 'No se pudo guardar la configuración. Intenta de nuevo.'),
        )
      },
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </span>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{config.display_name}</h3>
          {!config.is_configured && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Falta el dato de destino del pago
            </p>
          )}
        </div>
      </div>

      {/* noValidate: la validación nativa del navegador cancela el submit antes de que
          React lo vea, y el mensaje de zod nunca llega a pintarse (LL-110). */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Método de pago activo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Si se desactiva, el cliente no verá {config.display_name} al pagar
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              aria-label={`Activar ${config.display_name}`}
              disabled={!canManage}
              onClick={() => setValue('is_enabled', !isEnabled, { shouldDirty: true })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                isEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {enabledError && <p className="text-red-500 text-xs mt-2">{enabledError}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => {
            const meta = FIELD_META[field]
            return (
              <div key={field}>
                <label
                  htmlFor={`${config.method}-${field}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {meta.label}
                </label>
                <input
                  id={`${config.method}-${field}`}
                  type={meta.type ?? 'text'}
                  disabled={!canManage}
                  {...register(field)}
                  placeholder={meta.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                />
                {meta.hint && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{meta.hint}</p>
                )}
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>
                )}
              </div>
            )
          })}

          {config.method === 'yape' && (
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de cambio (PEN / USD)
              </span>
              {/* Solo lectura, y leído de CurrencyConfig — no de la copia heredada de 2
                  decimales que aún sirve el endpoint de Yape. */}
              <p className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                {currency ? `${currency.usd_to_pen} soles por dólar` : '—'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Se usa para mostrar el monto aproximado en S/.{' '}
                <Link to="/currency" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Se edita en Moneda
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor={`${config.method}-instructions_note`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nota adicional para el cliente (opcional)
          </label>
          <textarea
            id={`${config.method}-instructions_note`}
            {...register('instructions_note')}
            rows={3}
            disabled={!canManage}
            placeholder="Ej: El pago puede tardar hasta 24 horas en verificarse..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none disabled:opacity-60"
          />
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={update.isPending}
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
            {/* Solo el error general: si el backend señaló un campo concreto, el mensaje
                se pinta junto a ese campo y repetirlo aquí sería ruido. */}
            {submitError && <span className="text-red-500 text-sm">{submitError}</span>}
          </div>
        )}
      </form>
    </div>
  )
}
