import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, Link } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import { useResetPassword } from './hooks/useResetPassword'

const schema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const resetMutation = useResetPassword()

  const onSubmit = (data: FormData) => {
    if (!token) return
    resetMutation.mutate({ token, password: data.password })
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Token inválido</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Solicitar un nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nueva contraseña
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña.
          </p>
        </div>

        {resetMutation.isError && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
          >
            Ocurrió un error. El enlace puede haber expirado.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="input"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-new-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="input"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="btn btn-primary w-full"
          >
            {resetMutation.isPending ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Guardando...</span>
              </>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
