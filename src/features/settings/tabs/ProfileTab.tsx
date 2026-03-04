import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import type { ProfileUpdateRequest } from '../types'

const schema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
})

function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  })

  const onSubmit = (data: ProfileUpdateRequest) => {
    updateProfile.mutate(data, {
      onSuccess: () => reset(data),
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
        <p className="text-sm text-gray-500">Actualiza tu información personal.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-primary-600" />
          )}
        </div>
        <div>
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Cambiar foto
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />
          <p className="text-xs text-gray-500">JPG, PNG o GIF. Máximo 2MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="firstName"
              {...register('firstName')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              id="lastName"
              {...register('lastName')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">El email no puede ser modificado.</p>
        </div>

        {updateProfile.isError && (
          <p className="text-sm text-red-600">Error al guardar los cambios. Inténtalo de nuevo.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            disabled={!isDirty || updateProfile.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending || !isDirty}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileTab
