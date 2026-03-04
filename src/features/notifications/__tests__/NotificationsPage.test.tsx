import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotificationsPage from '../NotificationsPage'
import { useNotifications } from '../hooks/useNotifications'
import { useMarkAsRead } from '../hooks/useMarkAsRead'
import type { AppNotification } from '../types'

vi.mock('../hooks/useNotifications')
vi.mock('../hooks/useMarkAsRead')
vi.mock('../hooks/useMarkAllAsRead', () => ({
  useMarkAllAsRead: () => ({ mutate: vi.fn(), isPending: false }),
}))

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  status: 'idle' as const,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isIdle: true,
  isPaused: false,
  submittedAt: 0,
}

const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    category: 'security',
    title: 'Intento de acceso fallido',
    message: 'Se detectaron 3 intentos fallidos desde 192.168.1.1',
    icon: 'Shield',
    read: false,
    created_at: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    id: 'n2',
    category: 'users',
    title: 'Nuevo usuario registrado',
    message: 'juan@example.com se registró en el sistema',
    icon: 'UserPlus',
    read: false,
    created_at: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    id: 'n3',
    category: 'billing',
    title: 'Pago procesado',
    message: 'Se procesó el pago de $99 correctamente',
    icon: 'CreditCard',
    read: true,
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <NotificationsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMarkAsRead).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useMarkAsRead>,
    )
  })

  it('badge muestra contador correcto de no leídas', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      isLoading: false,
    })

    renderPage()

    // Badge en el header con el contador (puede aparecer también en el filtro "Sin leer")
    const badges = screen.getAllByText('2')
    expect(badges.length > 0).toBe(true)
  })

  it('filtro "Sin leer" muestra solo notificaciones no leídas', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      isLoading: false,
    })

    renderPage()

    // Click en el filtro "Sin leer"
    const sinLeerButton = screen.getByRole('button', { name: /sin leer/i })
    fireEvent.click(sinLeerButton)

    // Las 2 no leídas deben verse
    expect(screen.getByText('Intento de acceso fallido')).toBeInTheDocument()
    expect(screen.getByText('Nuevo usuario registrado')).toBeInTheDocument()

    // La leída no debe verse
    expect(screen.queryByText('Pago procesado')).not.toBeInTheDocument()
  })

  it('marcar como leída llama mutate con el id correcto', () => {
    const markAsReadMock = { ...mockMutation, mutate: vi.fn() }
    vi.mocked(useMarkAsRead).mockReturnValue(
      markAsReadMock as unknown as ReturnType<typeof useMarkAsRead>,
    )
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      isLoading: false,
    })

    renderPage()

    // Click en "Marcar como leída" de la primera notificación no leída
    const markReadButtons = screen.getAllByRole('button', { name: /marcar como leída/i })
    fireEvent.click(markReadButtons[0])

    expect(markAsReadMock.mutate).toHaveBeenCalledWith('n1')
  })

  it('BulkActions oculta botón cuando no hay notificaciones sin leer', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [mockNotifications[2]], // solo la leída
      unreadCount: 0,
      isLoading: false,
    })

    renderPage()

    expect(
      screen.queryByRole('button', { name: /marcar todas como leídas/i }),
    ).not.toBeInTheDocument()
  })
})
