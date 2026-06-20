import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KnowledgeBasePage from '../KnowledgeBasePage'
import type { KnowledgeArticle } from '../types'

const mockArticles: KnowledgeArticle[] = [
  {
    id: 'art-1',
    title: 'Planes y precios',
    content: 'Ofrecemos 4 planes: Free, Starter, Professional, Enterprise.',
    category: 'pricing',
    keywords: ['planes', 'precio'],
    is_active: true,
    order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Características del Workspace',
    content: 'El Workspace incluye proyectos, tareas y calendario.',
    category: 'features',
    keywords: ['workspace', 'proyectos'],
    is_active: false,
    order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

vi.mock('../hooks/useKnowledgeBase', () => ({
  useKnowledgeBase: () => ({ articles: mockArticles, isLoading: false }),
}))

vi.mock('../hooks/useArticleMutations', () => ({
  useCreateArticle: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
  useUpdateArticle: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
  useDeleteArticle: () => ({ mutate: vi.fn(), isPending: false }),
  useToggleArticle: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('KnowledgeBasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and article count', () => {
    render(<KnowledgeBasePage />)
    expect(screen.getByText('Base de Conocimiento')).toBeInTheDocument()
    expect(screen.getByText('2 artículos')).toBeInTheDocument()
  })

  it('renders both articles', () => {
    render(<KnowledgeBasePage />)
    expect(screen.getByText('Planes y precios')).toBeInTheDocument()
    expect(screen.getByText('Características del Workspace')).toBeInTheDocument()
  })

  it('filters articles by search text', async () => {
    render(<KnowledgeBasePage />)
    const input = screen.getByPlaceholderText('Buscar artículos…')
    fireEvent.change(input, { target: { value: 'workspace' } })
    await waitFor(() => {
      expect(screen.queryByText('Planes y precios')).not.toBeInTheDocument()
      expect(screen.getByText('Características del Workspace')).toBeInTheDocument()
    })
  })

  it('shows stats cards with correct counts', () => {
    render(<KnowledgeBasePage />)
    // Total = 2, activos = 1, inactivos = 1 → multiple "1" and "2" in DOM
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getByText('Total artículos')).toBeInTheDocument()
  })

  it('opens create modal on button click', () => {
    render(<KnowledgeBasePage />)
    fireEvent.click(screen.getByRole('button', { name: /nuevo artículo/i }))
    // Modal title shares text with button → use getByRole dialog or heading
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ej: planes y precios/i)).toBeInTheDocument()
  })
})
