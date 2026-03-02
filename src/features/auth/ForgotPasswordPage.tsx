import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import { useForgotPassword } from './hooks/useForgotPassword'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const forgotMutation = useForgotPassword()

  const onSubmit = (data: FormData) => {
    forgotMutation.mutate(data.email, {
      onSuccess: () => setEmailSent(true),
    })
  }

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Instrucciones enviadas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Si ese correo está registrado, recibirás las instrucciones para restablecer tu
            contraseña.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Volver al inicio de sesión
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
            Recuperar contraseña
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu email y te enviaremos las instrucciones.
          </p>
        </div>

        {forgotMutation.isError && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
          >
            Ocurrió un error. Por favor inténtalo más tarde.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="forgot-email"
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

          <button
            type="submit"
            disabled={forgotMutation.isPending}
            className="btn btn-primary w-full"
          >
            {forgotMutation.isPending ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Enviando...</span>
              </>
            ) : (
              'Enviar instrucciones'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
