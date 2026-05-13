import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReleasesPage from '../ReleasesPage'
import { useReleases } from '../hooks/useReleases'
import { useUploadRelease } from '../hooks/useUploadRelease'
import { useUpdateRelease } from '../hooks/useUpdateRelease'
import { useDeleteRelease } from '../hooks/useDeleteRelease'
import type { DesktopRelease } from '../types'

vi.mock('../hooks/useReleases')
vi.mock('../hooks/useUploadRelease')
vi.mock('../hooks/useUpdateRelease')
vi.mock('../hooks/useDeleteRelease')
vi.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: vi.fn() }))

const mockReleases: DesktopRelease[] = [
  {
    id: 'rel-1',
    version: '1.0.0',
    platform: 'windows',
    file_url: 'https://example.com/app.exe',
    file_name: 'app-1.0.0-setup.exe',
    file_size: 52428800,
    file_size_mb: 50.0,
    sha256: 'abc123',
    release_notes: 'Initial release',
    is_published: true,
    download_count: 42,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'rel-2',
    version: '0.9.0',
    platform: 'macos',
    file_url: 'https://example.com/app.dmg',
    file_name: 'app-0.9.0.dmg',
    file_size: 40960000,
    file_size_mb: 39.1,
    sha256: 'def456',
    release_notes: 'Beta',
    is_published: false,
    download_count: 0,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
]

const noopMutation = {
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
  const router = createMemoryRouter([{ path: '/', element: <ReleasesPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ReleasesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateRelease).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof useUpdateRelease>,
    )
    vi.mocked(useDeleteRelease).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof useDeleteRelease>,
    )
    vi.mocked(useUploadRelease).mockReturnValue({
      ...(noopMutation as unknown as ReturnType<typeof useUploadRelease>),
      progress: 0,
      isUploading: false,
      resetProgress: vi.fn(),
    })
  })

  it('renders release rows', () => {
    vi.mocked(useReleases).mockReturnValue({ releases: mockReleases, isLoading: false })

    renderPage()

    expect(screen.getByText('1.0.0')).toBeInTheDocument()
    expect(screen.getByText('0.9.0')).toBeInTheDocument()
    expect(screen.getByText('Windows')).toBeInTheDocument()
    expect(screen.getByText('macOS')).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    vi.mocked(useReleases).mockReturnValue({ releases: [], isLoading: true })

    renderPage()

    expect(screen.queryByText(/no hay releases/i)).not.toBeInTheDocument()
  })

  it('shows empty state when no releases', () => {
    vi.mocked(useReleases).mockReturnValue({ releases: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/no hay releases/i)).toBeInTheDocument()
  })

  it('opens upload modal on button click', async () => {
    vi.mocked(useReleases).mockReturnValue({ releases: [], isLoading: false })

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /subir release/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Subir Nuevo Release')).toBeInTheDocument()
  })

  it('calls togglePublish with negated is_published', async () => {
    const mutateMock = vi.fn()
    vi.mocked(useReleases).mockReturnValue({ releases: mockReleases, isLoading: false })
    vi.mocked(useUpdateRelease).mockReturnValue({
      ...(noopMutation as unknown as ReturnType<typeof useUpdateRelease>),
      mutate: mutateMock,
    })

    const user = userEvent.setup()
    renderPage()

    const despublishBtn = screen.getByLabelText('Despublicar 1.0.0')
    await user.click(despublishBtn)

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rel-1', is_published: false }),
    )
  })
})
