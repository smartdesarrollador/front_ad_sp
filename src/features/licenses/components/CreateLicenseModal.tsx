import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useCreateLicense } from '../hooks/useCreateLicense'

const schema = z.object({
  user_id: z.string().min(1, 'Selecciona un usuario'),
  send_email: z.boolean().default(true),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateLicenseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLicenseModal({ isOpen, onClose }: CreateLicenseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  const { mutate, isPending, error } = useCreateLicense()
  const { users } = useUsers()
  const [search, setSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleClose = () => {
    if (isPending) return
    reset()
    setSearch('')
    onClose()
  }

  const onSubmit = (values: FormValues) => {
    mutate(
      { user_id: values.user_id, send_email: values.send_email, notes: values.notes },
      { onSuccess: handleClose },
    )
  }

  if (!isOpen) return null

  type ApiError = { response?: { data?: { error?: { detail?: Record<string, string[]> } } } }
  const apiError = (error as ApiError | null)?.response?.data?.error?.detail

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={handleClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-license-modal-title"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="create-license-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Nueva License Key
            </h2>
            <button
              onClick={handleClose}
              disabled={isPending}
              aria-label="Cerrar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            {error && !apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                Error al crear la licencia. Intenta de nuevo.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar usuario
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email o nombre..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
              />
              <select
                {...register('user_id')}
                size={5}
                aria-label="Seleccionar usuario"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} — {u.name}
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.user_id.message}
                </p>
              )}
              {apiError?.user_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {apiError.user_id[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas internas
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Referencia, motivo, etc."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                {...register('send_email')}
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Enviar key al correo del usuario
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending ? 'Creando...' : 'Crear Licencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
