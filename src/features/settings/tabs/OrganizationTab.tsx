import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { useUpdateOrganization } from '../hooks/useUpdateOrganization'
import type { OrganizationUpdateRequest } from '../types'

const COLOR_PRESETS = ['#2563eb', '#7c3aed', '#dc2626', '#16a34a', '#d97706', '#0891b2']

const schema = z.object({
  name: z.string().min(1, 'El nombre de la organización es requerido'),
  primary_color: z.string(),
})

function OrganizationTab() {
  const tenant = useAuthStore((s) => s.tenant)
  const updateOrganization = useUpdateOrganization()
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationUpdateRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: tenant?.name ?? '',
      primary_color: COLOR_PRESETS[0],
    },
  })

  const onSubmit = (data: OrganizationUpdateRequest) => {
    updateOrganization.mutate({ ...data, primary_color: selectedColor })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organización</h2>
        <p className="text-sm text-gray-500">Configura los datos de tu organización.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
            Nombre de la organización
          </label>
          <input
            id="org-name"
            {...register('name')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
            Subdominio
          </label>
          <input
            id="subdomain"
            value={tenant?.subdomain ?? ''}
            readOnly
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">El subdominio no puede ser modificado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color primario
          </label>
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="flex gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {updateOrganization.isError && (
          <p className="text-sm text-red-600">Error al guardar los cambios. Inténtalo de nuevo.</p>
        )}

        {updateOrganization.isSuccess && (
          <p className="text-sm text-green-600">Organización actualizada correctamente.</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateOrganization.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {updateOrganization.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizationTab
