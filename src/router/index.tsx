import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import App from '@/App'
import { useAuthStore } from '@/store/authStore'

function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <AuthGuard />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/DashboardPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
      {
        path: 'login',
        lazy: () => import('@/pages/LoginPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
])
