import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SupportPage from '../SupportPage'
import { useTickets } from '../hooks/useTickets'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { useUpdateTicket } from '../hooks/useUpdateTicket'
import { useCloseTicket } from '../hooks/useCloseTicket'
import { useAddComment } from '../hooks/useAddComment'
import { usePermissions } from '@/hooks/usePermissions'
import type { SupportTicket, SupportTicketDetail } from '../types'

vi.mock('../hooks/useTickets')
vi.mock('../hooks/useTicketDetail')
vi.mock('../hooks/useUpdateTicket')
vi.mock('../hooks/useCloseTicket')
vi.mock('../hooks/useAddComment')
vi.mock('@/hooks/usePermissions')
vi.mock('@/features/users/hooks/useUsers', () => ({
  useUsers: () => ({ users: [], isLoading: false }),
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

const mockTickets: SupportTicket[] = [
  {
    id: 't1',
    reference: 'TKT-AAAAA001',
    subject: 'No puedo acceder al sistema',
    description: 'Descripción del problema de acceso',
    category: 'access',
    priority: 'urgente',
    status: 'open',
    client_email: 'user1@example.com',
    assigned_to: null,
    resolved_at: null,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 't2',
    reference: 'TKT-BBBBB002',
    subject: 'Error en facturación',
    description: 'No se procesó el pago',
    category: 'billing',
    priority: 'alta',
    status: 'in_progress',
    client_email: 'user2@example.com',
    assigned_to: { id: 'a1', name: 'Agente1', email: 'agente1@app.com' },
    resolved_at: null,
    created_at: '2026-03-02T08:00:00Z',
    updated_at: '2026-03-02T08:00:00Z',
  },
  {
    id: 't3',
    reference: 'TKT-CCCCC003',
    subject: 'Solicitud de nueva funcionalidad',
    description: 'Me gustaría poder exportar datos',
    category: 'feature_request',
    priority: 'baja',
    status: 'resolved',
    client_email: 'user3@example.com',
    assigned_to: null,
    resolved_at: '2026-03-03T09:00:00Z',
    created_at: '2026-02-28T12:00:00Z',
    updated_at: '2026-03-03T09:00:00Z',
  },
]

const mockTicketDetail: SupportTicketDetail = {
  ...mockTickets[0],
  comments: [
    {
      id: 'c1',
      author: 'Soporte Team',
      role: 'agent',
      message: 'Estamos revisando tu caso',
      created_at: '2026-03-01T11:00:00Z',
      updated_at: '2026-03-01T11:00:00Z',
    },
    {
      id: 'c2',
      author: 'Usuario Final',
      role: 'client',
      message: 'Gracias, espero su respuesta',
      created_at: '2026-03-01T12:00:00Z',
      updated_at: '2026-03-01T12:00:00Z',
    },
  ],
}

const mockPermissionsAgent = {
  hasPermission: (perm: string) => ['support.assign', 'support.update'].includes(perm),
  hasRole: () => false,
  isOwner: false,
  isAdmin: true,
  canManageBilling: false,
  canUpgradePlan: false,
  getPrimaryRole: () => 'Agent',
  getRoleColor: () => '#2563eb',
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <SupportPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SupportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateTicket).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateTicket>,
    )
    vi.mocked(useCloseTicket).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useCloseTicket>,
    )
    vi.mocked(useAddComment).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useAddComment>,
    )
    vi.mocked(useTicketDetail).mockReturnValue({ ticket: null, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAgent)
  })

  it('cola renderiza tickets con referencias', () => {
    vi.mocked(useTickets).mockReturnValue({ tickets: mockTickets, isLoading: false })

    renderPage()

    expect(screen.getByText('TKT-AAAAA001')).toBeInTheDocument()
    expect(screen.getByText('TKT-BBBBB002')).toBeInTheDocument()
  })

  it('badge prioridad urgente tiene clases rojas', () => {
    vi.mocked(useTickets).mockReturnValue({ tickets: mockTickets, isLoading: false })

    const { container } = renderPage()

    const urgentBadges = container.querySelectorAll('.bg-red-100.text-red-700')
    expect(urgentBadges.length > 0).toBe(true)
    expect(urgentBadges[0].textContent).toBe('Urgente')
  })

  it('CommentThread muestra badge Agente azul y Cliente gris', async () => {
    vi.mocked(useTickets).mockReturnValue({ tickets: mockTickets, isLoading: false })
    vi.mocked(useTicketDetail).mockReturnValue({ ticket: mockTicketDetail, isLoading: false })

    const user = userEvent.setup()
    renderPage()

    // Click en el primer ticket
    await user.click(screen.getByText('TKT-AAAAA001'))

    // Verificar badges de comentarios
    const agentBadges = screen.getAllByText('Agente')
    expect(agentBadges.length > 0).toBe(true)
    // El badge "Agente" debe tener clases azules
    expect(agentBadges[0]).toHaveClass('text-blue-700')

    const clientBadges = screen.getAllByText('Cliente')
    expect(clientBadges.length > 0).toBe(true)
    // El badge "Cliente" debe tener clase gris
    expect(clientBadges[0]).toHaveClass('text-gray-600')
  })

  it('cerrar ticket llama mutate con id correcto', async () => {
    const closeTicketMock = { ...mockMutation, mutate: vi.fn() }
    vi.mocked(useCloseTicket).mockReturnValue(
      closeTicketMock as unknown as ReturnType<typeof useCloseTicket>,
    )
    vi.mocked(useTickets).mockReturnValue({ tickets: mockTickets, isLoading: false })
    vi.mocked(useTicketDetail).mockReturnValue({ ticket: mockTicketDetail, isLoading: false })

    const user = userEvent.setup()
    renderPage()

    // Abrir el panel del ticket t1
    await user.click(screen.getByText('TKT-AAAAA001'))

    // Click en "Cerrar ticket"
    const closeButton = screen.getByRole('button', { name: /cerrar ticket/i })
    await user.click(closeButton)

    expect(closeTicketMock.mutate).toHaveBeenCalledWith('t1')
  })
})
