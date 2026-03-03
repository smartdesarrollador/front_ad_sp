import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Invoice } from '../types'

interface InvoicesResponse {
  invoices: Invoice[]
}

export function useInvoices() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () =>
      apiClient.get<InvoicesResponse>('/admin/billing/invoices').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return {
    invoices: data?.invoices ?? [],
    isLoading,
  }
}
