import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from './components/AuthLayout'
import GoogleOAuthButton from './components/GoogleOAuthButton'
import { useRegister } from './hooks/useRegister'

const schema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    organizationName: z
      .string()
      .min(2, 'El nombre de la organización debe tener al menos 2 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptTerms: false },
  })

  const registerMutation = useRegister()

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          const serverErrors = error.response.data as Record<string, string[]>
          if (serverErrors.email?.[0]) {
            setError('email', { message: serverErrors.email[0] })
          }
          if (serverErrors.name?.[0]) {
            setError('name', { message: serverErrors.name[0] })
          }
        }
      },
    })
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">¡Cuenta creada!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Revisa tu correo para verificar tu cuenta y activarla.
          </p>
          <Link to="/login" className="inline-block btn btn-primary">
            Ir al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Crear cuenta</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombre completo
            </label>
            <input id="name" type="text" {...register('name')} className="input" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input id="reg-email" type="email" {...register('email')} className="input" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombre de la organización
            </label>
            <input
              id="organizationName"
              type="text"
              {...register('organizationName')}
              className="input"
            />
            {errors.organizationName && (
              <p className="mt-1 text-xs text-red-600">{errors.organizationName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              {...register('password')}
              className="input"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="input"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="acceptTerms"
              type="checkbox"
              {...register('acceptTerms')}
              className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              Acepto los{' '}
              <span className="text-primary-600 hover:underline">términos y condiciones</span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="btn btn-primary w-full"
          >
            {registerMutation.isPending ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Cargando...</span>
              </>
            ) : (
              'Crear cuenta'
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

        <GoogleOAuthButton text="Registrarse con Google" />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
