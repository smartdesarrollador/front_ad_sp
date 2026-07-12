import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ServiceAdoptionData } from '../types'

export function useServiceAdoption() {
  const { data: adoption, isLoading } = useQuery({
    queryKey: ['reports-service-adoption'],
    queryFn: () =>
      apiClient.get<ServiceAdoptionData>('/admin/reports/service-adoption/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { adoption, isLoading }
}
