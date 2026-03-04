import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useInviteUser } from '../hooks/useInviteUser'
import { useRolesForSelect } from '../hooks/useRolesForSelect'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const schema = z.object({
  email: z.string().email('Email inválido'),
  role_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { mutate, isPending, error } = useInviteUser()
  const { roles } = useRolesForSelect()
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!isOpen) return null

  const onSubmit = (values: FormValues) => {
    mutate(
      { email: values.email, role_id: values.role_id || undefined },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      },
    )
  }

  const is402 = (error as { response?: { status?: number } } | null)?.response?.status === 402
  const is403 = (error as { response?: { status?: number } } | null)?.response?.status === 403

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-user-modal-title"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="invite-user-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">Invitar Usuario</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm text-blue-700 dark:text-blue-300">
              Se enviará un email de invitación con link de activación.
            </div>

            {/* Plan limit error */}
            {is402 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                Has alcanzado el límite de usuarios de tu plan.
              </div>
            )}

            {/* Generic error */}
            {error && !is402 && !is403 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                Error al enviar la invitación. Intenta de nuevo.
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="usuario@empresa.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Role select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol (opcional)
              </label>
              <select
                {...register('role_id')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sin rol asignado</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
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
                {isPending ? (
                  <>
                    <span className="sr-only">Enviando...</span>
                    Enviando...
                  </>
                ) : (
                  'Enviar invitación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
