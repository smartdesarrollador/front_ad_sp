import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Loader2 } from 'lucide-react'
import { useYapeConfig } from '../hooks/useYapeConfig'
import { useUpdateYapeConfig } from '../hooks/useUpdateYapeConfig'

const schema = z.object({
  phone:             z.string().min(1, 'Requerido'),
  holder_name:       z.string().min(1, 'Requerido'),
  exchange_rate:     z.string().min(1, 'Requerido'),
  instructions_note: z.string(),
  is_enabled:        z.boolean(),
})

type FormData = z.infer<typeof schema>

export function YapeConfigForm() {
  const { config, isLoading } = useYapeConfig()
  const update = useUpdateYapeConfig()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        phone: '', holder_name: '', exchange_rate: '3.75',
        instructions_note: '', is_enabled: true,
      },
    })

  useEffect(() => {
    if (config) {
      reset({
        phone:             config.phone,
        holder_name:       config.holder_name,
        exchange_rate:     config.exchange_rate,
        instructions_note: config.instructions_note,
        is_enabled:        config.is_enabled,
      })
    }
  }, [config, reset])

  const isEnabled = watch('is_enabled')

  function onSubmit(data: FormData) {
    setSaved(false)
    update.mutate(data, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Enable / disable toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">Método de pago activo</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Si se desactiva, el paso de Yape no aparecerá en el registro
          </p>
        </div>
        <button
          type="button"
          onClick={() => setValue('is_enabled', !isEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número Yape
          </label>
          <input
            {...register('phone')}
            placeholder="955 365 043"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titular de la cuenta
          </label>
          <input
            {...register('holder_name')}
            placeholder="Juan Pérez García"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.holder_name && (
            <p className="text-red-500 text-xs mt-1">{errors.holder_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de cambio (PEN / USD)
          </label>
          <input
            {...register('exchange_rate')}
            type="number"
            step="0.01"
            min="1"
            placeholder="3.75"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1">Se usa para mostrar el monto aproximado en S/</p>
          {errors.exchange_rate && (
            <p className="text-red-500 text-xs mt-1">{errors.exchange_rate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nota adicional para el cliente (opcional)
        </label>
        <textarea
          {...register('instructions_note')}
          rows={3}
          placeholder="Ej: El pago puede tardar hasta 24 horas en verificarse..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

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
        {update.isError && (
          <span className="text-red-500 text-sm">Error al guardar. Intenta de nuevo.</span>
        )}
      </div>
    </form>
  )
}
