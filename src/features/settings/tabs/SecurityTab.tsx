import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChangePassword } from '../hooks/useChangePassword'
import { useMFASetup } from '../hooks/useMFASetup'
import { useMFADisable } from '../hooks/useMFADisable'
import type { MFASetupResponse } from '../types'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'La contraseña actual es requerida'),
    new_password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

function SecurityTab() {
  const user = useAuthStore((s) => s.user)
  const changePassword = useChangePassword()
  const mfaSetup = useMFASetup()
  const mfaDisable = useMFADisable()
  const [qrData, setQrData] = useState<MFASetupResponse | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitPassword = (data: PasswordFormData) => {
    changePassword.mutate(
      { current_password: data.current_password, new_password: data.new_password },
      {
        onSuccess: () => {
          reset()
          setPasswordSuccess(true)
          setTimeout(() => setPasswordSuccess(false), 3000)
        },
      },
    )
  }

  const handleEnableMFA = () => {
    mfaSetup.mutate(undefined, {
      onSuccess: (data) => setQrData(data),
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona tu contraseña y autenticación de dos factores.</p>
      </div>

      {/* Change password section */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-4 dark:border-gray-700">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Cambiar contraseña</h3>

        <form
          data-testid="change-password-form"
          onSubmit={handleSubmit(onSubmitPassword)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña actual
            </label>
            <input
              id="current_password"
              type="password"
              {...register('current_password')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-400"
            />
            {errors.current_password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nueva contraseña
            </label>
            <input
              id="new_password"
              type="password"
              {...register('new_password')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-400"
            />
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirm_password"
              type="password"
              {...register('confirm_password')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-400"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirm_password.message}</p>
            )}
          </div>

          {changePassword.isError && (
            <p className="text-sm text-red-600 dark:text-red-400">Error al cambiar la contraseña. Verifica tu contraseña actual.</p>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Contraseña actualizada correctamente.
            </div>
          )}

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {changePassword.isPending ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      {/* MFA section */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Autenticación de dos factores (MFA)</h3>
        </div>

        {user?.mfaEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                MFA Habilitado
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              La autenticación de dos factores está activa en tu cuenta.
            </p>
            <button
              onClick={() => mfaDisable.mutate()}
              disabled={mfaDisable.isPending}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {mfaDisable.isPending ? 'Deshabilitando...' : 'Deshabilitar MFA'}
            </button>
          </div>
        ) : qrData ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.).
            </p>
            <img src={qrData.qr_uri} alt="MFA QR Code" className="h-40 w-40 border border-gray-200 rounded dark:border-gray-600" />
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Clave secreta (ingreso manual):</p>
              <p className="font-mono text-sm text-gray-800 select-all dark:text-gray-200">{qrData.secret}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agrega una capa extra de seguridad con autenticación de dos factores.
            </p>
            <button
              onClick={handleEnableMFA}
              disabled={mfaSetup.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {mfaSetup.isPending ? 'Configurando...' : 'Habilitar MFA'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityTab
