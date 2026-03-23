import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import AuthLayout from './components/AuthLayout'
import { useLogin } from './hooks/useLogin'
import { publicClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginResponse } from '@/types/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

type FormData = z.infer<typeof schema>

interface LocationState {
  resetSuccess?: boolean
  inviteSuccess?: boolean
  error?: string
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const { setUser, setAccessToken } = useAuthStore()

  const [mfaState, setMfaState] = useState<{ token: string } | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const loginMutation = useLogin()

  const mfaMutation = useMutation({
    mutationFn: ({ mfa_token, code }: { mfa_token: string; code: string }) =>
      publicClient.post<LoginResponse>('/auth/mfa/validate', { mfa_token, code }),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setAccessToken(data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
      localStorage.setItem('authUser', JSON.stringify(data.user))
      navigate('/')
    },
  })

  const onSubmit = (data: FormData) => {
    setGlobalError(null)
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        if ('mfaRequired' in result) {
          setMfaState({ token: result.mfaToken })
        } else if ('error' in result && result.error === 'no_admin_access') {
          setGlobalError('no_admin_access')
        }
      },
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setGlobalError('Credenciales incorrectas')
        }
      },
    })
  }

  if (mfaState) {
    return (
      <AuthLayout>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Verificación en dos pasos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa el código de 6 dígitos de tu app autenticadora
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="input text-center text-2xl tracking-widest"
            placeholder="000000"
            aria-label="Código MFA"
          />
          {mfaMutation.isError && (
            <p className="text-sm text-red-600">Código inválido. Inténtalo de nuevo.</p>
          )}
          <button
            type="button"
            onClick={() => mfaMutation.mutate({ mfa_token: mfaState.token, code: mfaCode })}
            disabled={mfaMutation.isPending || mfaCode.length !== 6}
            className="btn btn-primary w-full"
          >
            {mfaMutation.isPending ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Verificando...</span>
              </>
            ) : (
              'Verificar'
            )}
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {state?.resetSuccess && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
            Contraseña actualizada correctamente
          </div>
        )}

        {state?.inviteSuccess && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
            Cuenta activada correctamente. Inicia sesión para continuar.
          </div>
        )}

        {(globalError || state?.error === 'no_admin_access') && (
          <div
            role="alert"
            className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-300"
          >
            {globalError === 'no_admin_access' || state?.error === 'no_admin_access' ? (
              <span>
                Esta cuenta no tiene acceso al panel de administración.{' '}
                <a
                  href="http://hub.local.test/login"
                  className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-200"
                >
                  Ir al Hub de Servicios
                </a>
              </span>
            ) : (
              globalError
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="input"
              placeholder="admin@empresa.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="input"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn btn-primary w-full"
          >
            {loginMutation.isPending ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Cargando...</span>
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <span className="text-gray-500 dark:text-gray-400 text-xs italic">
            Acceso solo por invitación
          </span>
        </div>
      </div>
    </AuthLayout>
  )
}
