import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { DesktopLicenseFunnelData } from '../types'

export function useDesktopLicenseFunnel() {
  const { data: desktopFunnel, isLoading } = useQuery({
    queryKey: ['reports-desktop-licenses'],
    queryFn: () =>
      apiClient.get<DesktopLicenseFunnelData>('/admin/reports/desktop-licenses/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { desktopFunnel, isLoading }
}
