import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import AuthLayout from './components/AuthLayout'
import GoogleOAuthButton from './components/GoogleOAuthButton'
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

        {globalError && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
          >
            {globalError}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">o</span>
          </div>
        </div>

        <GoogleOAuthButton />

        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
