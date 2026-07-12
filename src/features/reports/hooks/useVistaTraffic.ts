import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { VistaTrafficData } from '../types'

export function useVistaTraffic() {
  const { data: vistaTraffic, isLoading } = useQuery({
    queryKey: ['reports-vista-traffic'],
    queryFn: () =>
      apiClient.get<VistaTrafficData>('/admin/reports/vista-traffic/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { vistaTraffic, isLoading }
}
