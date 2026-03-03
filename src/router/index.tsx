import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/pages/DashboardPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'users',
                lazy: () =>
                  import('@/pages/UsersPage').then((m) => ({ Component: m.default })),
              },
            ],
          },
        ],
      },
      {
        path: 'login',
        lazy: () =>
          import('@/features/auth/LoginPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'register',
        lazy: () =>
          import('@/features/auth/RegisterPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'forgot-password',
        lazy: () =>
          import('@/features/auth/ForgotPasswordPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reset-password',
        lazy: () =>
          import('@/features/auth/ResetPasswordPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'auth/google/callback',
        lazy: () =>
          import('@/features/auth/GoogleCallbackPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
])
