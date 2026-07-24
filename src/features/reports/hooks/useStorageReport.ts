import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { StorageReportData } from '../types'

export function useStorageReport() {
  const { data: storage, isLoading } = useQuery({
    queryKey: ['reports-storage'],
    queryFn: () =>
      apiClient.get<StorageReportData>('/admin/reports/storage/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { storage, isLoading }
}
