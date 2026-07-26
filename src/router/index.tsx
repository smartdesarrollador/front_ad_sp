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
                path: 'plans',
                lazy: () =>
                  import('@/pages/PlansPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'currency',
                lazy: () =>
                  import('@/pages/CurrencyPage').then((m) => ({ Component: m.default })),
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
                path: 'releases',
                lazy: () =>
                  import('@/pages/ReleasesPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'licenses',
                lazy: () =>
                  import('@/pages/LicensesPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'yape',
                lazy: () =>
                  import('@/pages/YapePage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'knowledge-base',
                lazy: () =>
                  import('@/pages/KnowledgeBasePage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'footer',
                lazy: () =>
                  import('@/pages/FooterPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'contact',
                lazy: () =>
                  import('@/pages/ContactPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'catalog',
                lazy: () =>
                  import('@/pages/CatalogPage').then((m) => ({ Component: m.default })),
              },
              {
                path: 'announcements',
                lazy: () =>
                  import('@/pages/AnnouncementsPage').then((m) => ({ Component: m.default })),
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
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
])
