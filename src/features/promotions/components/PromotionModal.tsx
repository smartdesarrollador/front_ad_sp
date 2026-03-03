import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreatePromotion } from '../hooks/useCreatePromotion'
import { useUpdatePromotion } from '../hooks/useUpdatePromotion'
import type { Promotion } from '../types'

const PLANS = ['free', 'starter', 'professional', 'enterprise']
const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const schema = z
  .object({
    code: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(20, 'Máximo 20 caracteres')
      .regex(/^[A-Z0-9]+$/, 'Solo mayúsculas y números'),
    name: z.string().min(3, 'Mínimo 3 caracteres'),
    description: z.string().optional(),
    type: z.enum(['percentage', 'fixed_amount', 'trial_extension']),
    value: z.number({ error: 'Ingresa un número' }).positive('Debe ser positivo'),
    max_discount: z.number().min(0).optional().nullable(),
    applicable_plans: z.array(z.string()),
    new_customers_only: z.boolean(),
    starts_at: z.string().min(1, 'Requerido'),
    expires_at: z.string().min(1, 'Requerido'),
    max_uses: z.number().int().positive().optional().nullable(),
    max_uses_per_customer: z.number().int().min(1, 'Mínimo 1'),
  })
  .superRefine((data, ctx) => {
    if (data.starts_at && data.expires_at && data.expires_at <= data.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['expires_at'],
      })
    }
    if (data.type === 'percentage' && (data.value < 1 || data.value > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El valor debe estar entre 1 y 100',
        path: ['value'],
      })
    }
    if (data.type === 'trial_extension' && (data.value < 1 || data.value > 90)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El valor debe estar entre 1 y 90 días',
        path: ['value'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface PromotionModalProps {
  promotion: Promotion | null
  isOpen: boolean
  onClose: () => void
}

export function PromotionModal({ promotion, isOpen, onClose }: PromotionModalProps) {
  const isEdit = promotion !== null
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicable_plans: [],
      new_customers_only: false,
      max_uses_per_customer: 1,
      type: 'percentage',
    },
  })

  const watchedType = watch('type')
  const watchedPlans = watch('applicable_plans')

  useEffect(() => {
    if (isOpen) {
      if (promotion) {
        reset({
          code: promotion.code,
          name: promotion.name,
          description: promotion.description,
          type: promotion.type,
          value: promotion.value,
          max_discount: promotion.max_discount,
          applicable_plans: promotion.applicable_plans,
          new_customers_only: promotion.new_customers_only,
          starts_at: promotion.starts_at,
          expires_at: promotion.expires_at,
          max_uses: promotion.max_uses,
          max_uses_per_customer: promotion.max_uses_per_customer,
        })
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          type: 'percentage',
          value: undefined,
          max_discount: null,
          applicable_plans: [],
          new_customers_only: false,
          starts_at: '',
          expires_at: '',
          max_uses: null,
          max_uses_per_customer: 1,
        })
      }
    }
  }, [isOpen, promotion, reset])

  if (!isOpen) return null

  const mutation = isEdit ? updatePromotion : createPromotion
  const isPending = mutation.isPending
  const error = mutation.error as { response?: { status?: number } } | null
  const is402 = error?.response?.status === 402

  const generateCode = () => {
    const code = Math.random().toString(36).slice(2, 10).toUpperCase()
    setValue('code', code)
  }

  const togglePlan = (plan: string) => {
    const current = watchedPlans ?? []
    if (current.includes(plan)) {
      setValue('applicable_plans', current.filter((p) => p !== plan))
    } else {
      setValue('applicable_plans', [...current, plan])
    }
  }

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updatePromotion.mutate(
        { id: promotion.id, ...values },
        { onSuccess: () => { reset(); onClose() } },
      )
    } else {
      createPromotion.mutate(
        values,
        { onSuccess: () => { reset(); onClose() } },
      )
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {/* Error messages */}
              {is402 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                  Has alcanzado el límite de promociones de tu plan.
                </div>
              )}
              {error && !is402 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                  Ocurrió un error. Intenta de nuevo.
                </div>
              )}

              {/* Código + Generar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('code')}
                    type="text"
                    placeholder="SUMMER2026"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
                  >
                    Generar
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.code.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Descuento de verano"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Descripción opcional de la promoción..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Tipo + Valor + Max descuento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed_amount">Monto fijo ($)</option>
                    <option value="trial_extension">Extensión trial (+días)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder={watchedType === 'percentage' ? '10' : watchedType === 'trial_extension' ? '30' : '50'}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.value && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.value.message}</p>
                  )}
                </div>
              </div>

              {/* Max descuento (solo percentage) */}
              {watchedType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descuento máximo ($)
                  </label>
                  <input
                    {...register('max_discount', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) })}
                    type="number"
                    step="0.01"
                    placeholder="Sin límite"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {/* Planes aplicables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Planes aplicables
                  <span className="ml-1 text-xs font-normal text-gray-400">(vacío = todos)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLANS.map((plan) => {
                    const selected = (watchedPlans ?? []).includes(plan)
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => togglePlan(plan)}
                        className={`px-3 py-1.5 text-sm rounded-md border font-medium transition-colors ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        {PLAN_LABELS[plan]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Solo nuevos clientes */}
              <div className="flex items-center gap-2">
                <input
                  {...register('new_customers_only')}
                  type="checkbox"
                  id="new_customers_only"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="new_customers_only"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Solo para nuevos clientes
                </label>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('starts_at')}
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.starts_at && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.starts_at.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('expires_at')}
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.expires_at && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.expires_at.message}</p>
                  )}
                </div>
              </div>

              {/* Límites de uso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Límite de usos totales
                  </label>
                  <input
                    {...register('max_uses', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) })}
                    type="number"
                    placeholder="Ilimitado"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usos por cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('max_uses_per_customer', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.max_uses_per_customer && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.max_uses_per_customer.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending
                  ? 'Guardando...'
                  : isEdit
                    ? 'Guardar cambios'
                    : 'Crear promoción'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
