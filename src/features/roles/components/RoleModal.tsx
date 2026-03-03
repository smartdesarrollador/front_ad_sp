import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateRole } from '../hooks/useCreateRole'
import { useUpdateRole } from '../hooks/useUpdateRole'
import { usePermissionsList } from '../hooks/usePermissionsList'
import { PermissionsSelector } from './PermissionsSelector'
import type { RoleDetail } from '../types'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface RoleModalProps {
  role: RoleDetail | null
  isOpen: boolean
  onClose: () => void
}

export function RoleModal({ role, isOpen, onClose }: RoleModalProps) {
  const isEdit = role !== null
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const { permissions, isLoading: loadingPerms } = usePermissionsList()

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (isOpen) {
      if (role) {
        reset({ name: role.name, description: role.description })
        setSelectedPermissionIds(role.permissions.map((p) => p.id))
      } else {
        reset({ name: '', description: '' })
        setSelectedPermissionIds([])
      }
    }
  }, [isOpen, role, reset])

  if (!isOpen) return null

  const mutation = isEdit ? updateRole : createRole
  const isPending = mutation.isPending
  const error = mutation.error as { response?: { status?: number } } | null
  const is402 = error?.response?.status === 402
  const is403 = error?.response?.status === 403

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateRole.mutate(
        { id: role.id, name: values.name, description: values.description, permission_ids: selectedPermissionIds },
        { onSuccess: () => { reset(); onClose() } },
      )
    } else {
      createRole.mutate(
        { name: values.name, description: values.description, permission_ids: selectedPermissionIds },
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
              {isEdit ? 'Editar Rol' : 'Nuevo Rol'}
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
                  Has alcanzado el límite de roles personalizados de tu plan.
                </div>
              )}
              {is403 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                  No puedes modificar roles del sistema.
                </div>
              )}
              {error && !is402 && !is403 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                  Ocurrió un error. Intenta de nuevo.
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Nombre del rol"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Describe las responsabilidades de este rol..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permisos
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({selectedPermissionIds.length} seleccionados)
                  </span>
                </label>

                {loadingPerms ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <PermissionsSelector
                    permissions={permissions}
                    selectedIds={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                  />
                )}
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
                {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear rol'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
