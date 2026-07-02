import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AnnouncementsPage from '../AnnouncementsPage'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useCreateAnnouncement } from '../hooks/useCreateAnnouncement'
import { useUpdateAnnouncement } from '../hooks/useUpdateAnnouncement'
import { useDeleteAnnouncement } from '../hooks/useDeleteAnnouncement'
import type { Announcement } from '../types'

vi.mock('../hooks/useAnnouncements')
vi.mock('../hooks/useCreateAnnouncement')
vi.mock('../hooks/useUpdateAnnouncement')
vi.mock('../hooks/useDeleteAnnouncement')

const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Black Friday',
    message: '50% de descuento en todos los servicios',
    image_url: null,
    cta_text: 'Ver oferta',
    cta_url: 'https://example.com/promo',
    placement: 'home',
    is_active: true,
    starts_at: null,
    ends_at: null,
    priority: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'a2',
    title: 'Mantenimiento programado',
    message: 'El sistema estará en mantenimiento el sábado',
    image_url: null,
    cta_text: '',
    cta_url: '',
    placement: 'dashboard',
    is_active: false,
    starts_at: null,
    ends_at: null,
    priority: 0,
    created_at: '2026-01-02T00:00:00Z',
  },
]

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

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <AnnouncementsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AnnouncementsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreateAnnouncement).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useCreateAnnouncement>,
    )
    vi.mocked(useUpdateAnnouncement).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateAnnouncement>,
    )
    vi.mocked(useDeleteAnnouncement).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useDeleteAnnouncement>,
    )
  })

  it('renderiza las tarjetas con sus badges', () => {
    vi.mocked(useAnnouncements).mockReturnValue({ items: mockAnnouncements, isLoading: false })

    renderPage()

    expect(screen.getByText('Black Friday')).toBeInTheDocument()
    expect(screen.getByText('Mantenimiento programado')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay anuncios', () => {
    vi.mocked(useAnnouncements).mockReturnValue({ items: [], isLoading: false })

    renderPage()

    expect(screen.getByText('Sin anuncios aún')).toBeInTheDocument()
  })

  it('togglear pide confirmación y llama a la mutación de update', async () => {
    vi.mocked(useAnnouncements).mockReturnValue({ items: mockAnnouncements, isLoading: false })
    const updateMock = { ...mockMutation, mutate: vi.fn() }
    vi.mocked(useUpdateAnnouncement).mockReturnValue(
      updateMock as unknown as ReturnType<typeof useUpdateAnnouncement>,
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /desactivar anuncio black friday/i }))

    expect(window.confirm).toHaveBeenCalled()
    expect(updateMock.mutate).toHaveBeenCalledWith({ id: 'a1', is_active: false })
  })

  it('crear anuncio abre el modal', async () => {
    vi.mocked(useAnnouncements).mockReturnValue({ items: [], isLoading: false })

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('borrar pide confirmación inline y llama a la mutación de delete', async () => {
    vi.mocked(useAnnouncements).mockReturnValue({ items: mockAnnouncements, isLoading: false })
    const deleteMock = { ...mockMutation, mutate: vi.fn() }
    vi.mocked(useDeleteAnnouncement).mockReturnValue(
      deleteMock as unknown as ReturnType<typeof useDeleteAnnouncement>,
    )

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /eliminar anuncio black friday/i }))
    await user.click(screen.getByText('Sí, eliminar'))

    expect(deleteMock.mutate).toHaveBeenCalledWith('a1')
  })
})
