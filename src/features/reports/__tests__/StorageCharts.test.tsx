import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StorageByPlanChart } from '../components/StorageByPlanChart'
import { StorageTopTenantsChart } from '../components/StorageTopTenantsChart'
import { StorageOccupancyChart } from '../components/StorageOccupancyChart'
import { formatStorage } from '../formatStorage'

describe('formatStorage', () => {
  it('shows MB below 1 GB and GB above', () => {
    expect(formatStorage(0)).toBe('0 GB')
    expect(formatStorage(0.037)).toBe('38 MB')
    expect(formatStorage(3.5)).toBe('3.5 GB')
  })
})

describe('storage charts — loading & empty states', () => {
  it('StorageByPlanChart renders skeleton while loading', () => {
    const { container } = render(<StorageByPlanChart byPlan={undefined} isLoading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('StorageByPlanChart shows empty message with no data', () => {
    render(<StorageByPlanChart byPlan={[]} isLoading={false} />)
    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument()
  })

  it('StorageTopTenantsChart shows empty message with no data', () => {
    render(<StorageTopTenantsChart topTenants={[]} isLoading={false} />)
    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument()
  })

  it('StorageOccupancyChart renders skeleton while loading', () => {
    const { container } = render(<StorageOccupancyChart occupancy={undefined} isLoading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
