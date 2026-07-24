import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2 } from 'lucide-react'
import { useUpdatePlan } from '../hooks/useUpdatePlan'
import type { AdminPlan } from '../types'

const limitField = z.number().min(0, 'Debe ser ≥ 0').nullable()

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  description: z.string().max(300).optional(),
  price_monthly: z.number({ error: 'Precio requerido' }).min(0, 'Debe ser ≥ 0'),
  price_annual: z.number({ error: 'Precio requerido' }).min(0, 'Debe ser ≥ 0'),
  popular: z.boolean(),
  limits: z.object({
    max_users: limitField,
    storage_gb: limitField,
    max_projects: limitField,
    max_custom_roles: limitField,
    api_calls_per_month: limitField,
    max_image_upload_mb: limitField,
    max_file_upload_mb: limitField,
  }),
  highlights: z
    .array(
      z.object({
        label: z.string().min(1, 'Label requerido'),
        included: z.boolean(),
      }),
    )
    .min(1, 'Al menos 1 highlight')
    .max(10, 'Máximo 10 highlights'),
})

type FormData = z.infer<typeof schema>

// `step` define la granularidad del input. Almacenamiento admite fracciones de GB
// (0.25 GB = 256 MB); el resto de límites son enteros.
const LIMIT_FIELDS: { name: keyof FormData['limits']; label: string; step?: number }[] = [
  { name: 'max_users', label: 'Usuarios' },
  { name: 'storage_gb', label: 'Almacenamiento (GB)', step: 0.01 },
  { name: 'max_projects', label: 'Proyectos' },
  { name: 'max_custom_roles', label: 'Roles personalizados' },
  { name: 'api_calls_per_month', label: 'Llamadas API/mes' },
  { name: 'max_image_upload_mb', label: 'Peso máx. imagen (MB)' },
  { name: 'max_file_upload_mb', label: 'Peso máx. archivo (MB)' },
]

interface Props {
  plan: AdminPlan | null
  onClose: () => void
}

export function PlanEditModal({ plan, onClose }: Props) {
  const updatePlan = useUpdatePlan()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'highlights' })

  useEffect(() => {
    if (plan) {
      reset({
        display_name: plan.display_name,
        description: plan.description,
        price_monthly: plan.price_monthly,
        price_annual: plan.price_annual,
        popular: plan.popular,
        limits: plan.limits,
        highlights: plan.highlights,
      })
    }
  }, [plan, reset])

  if (!plan) return null

  const onSubmit = (data: FormData) => {
    updatePlan.mutate(
      { id: plan.id, data },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-edit-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="plan-edit-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar plan: {plan.display_name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* display_name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del plan
            </label>
            <input
              {...register('display_name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.display_name && (
              <p className="text-red-500 text-xs mt-1">{errors.display_name.message}</p>
            )}
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <input
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio mensual ($)
              </label>
              <input
                type="number"
                min={0}
                {...register('price_monthly', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.price_monthly && (
                <p className="text-red-500 text-xs mt-1">{errors.price_monthly.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio anual ($)
              </label>
              <input
                type="number"
                min={0}
                {...register('price_annual', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.price_annual && (
                <p className="text-red-500 text-xs mt-1">{errors.price_annual.message}</p>
              )}
            </div>
          </div>

          {/* popular */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popular"
              {...register('popular')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="popular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Marcar como "Más popular"
            </label>
          </div>

          {/* Límites del plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Límites del plan
            </label>
            <div className="grid grid-cols-2 gap-4">
              {LIMIT_FIELDS.map(({ name, label, step }) => (
                <Controller
                  key={name}
                  control={control}
                  name={`limits.${name}`}
                  render={({ field }) => {
                    const isUnlimited = field.value === null
                    return (
                      <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {label}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={step ?? 1}
                            disabled={isUnlimited}
                            value={isUnlimited ? '' : field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                          />
                          <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isUnlimited}
                              onChange={(e) => field.onChange(e.target.checked ? null : 0)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            Sin límite
                          </label>
                        </div>
                        {errors.limits?.[name] && (
                          <p className="text-red-500 text-xs mt-1">{errors.limits[name]?.message}</p>
                        )}
                      </div>
                    )
                  }}
                />
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Highlights ({fields.length}/10)
              </label>
              {fields.length < 10 && (
                <button
                  type="button"
                  onClick={() => append({ label: '', included: true })}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir highlight
                </button>
              )}
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`highlights.${idx}.included`)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                  />
                  <input
                    {...register(`highlights.${idx}.label`)}
                    placeholder="Descripción del highlight"
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label="Eliminar highlight"
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.highlights && (
              <p className="text-red-500 text-xs mt-1">
                {typeof errors.highlights.message === 'string' ? errors.highlights.message : 'Error en highlights'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updatePlan.isPending}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {updatePlan.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
