import { createBrowserRouter, Navigate } from 'react-router-dom'
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
              {
                path: 'roles',
                lazy: () =>
                  import('@/pages/RolesPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'permissions',
                lazy: () =>
                  import('@/pages/PermissionsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'subscription',
                lazy: () =>
                  import('@/pages/SubscriptionPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'billing',
                lazy: () =>
                  import('@/pages/BillingPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'reports',
                lazy: () =>
                  import('@/pages/ReportsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'audit',
                lazy: () =>
                  import('@/pages/AuditPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'clients',
                lazy: () =>
                  import('@/pages/ClientsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'promotions',
                lazy: () =>
                  import('@/pages/PromotionsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'support',
                lazy: () =>
                  import('@/pages/SupportPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'notifications',
                lazy: () =>
                  import('@/pages/NotificationsPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'settings',
                lazy: () =>
                  import('@/pages/SettingsPage').then((m) => ({ Component: m.default })),
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
        path: 'accept-invite',
        lazy: () =>
          import('@/features/auth/AcceptInvitePage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'auth/google/callback',
        lazy: () =>
          import('@/features/auth/GoogleCallbackPage').then((m) => ({ Component: m.default })),
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
])
