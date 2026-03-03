import { Download, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Invoice, InvoiceStatus } from '../types'

const STATUS_BADGES: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: 'Pagado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  open: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  void: { label: 'Anulado', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  uncollectible: { label: 'Incobrable', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface Props {
  invoices: Invoice[]
  isLoading: boolean
}

export function InvoicePreview({ invoices, isLoading }: Props) {
  const navigate = useNavigate()
  const preview = invoices.slice(0, 3)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Facturas recientes</h3>
        <button
          onClick={() => navigate('/billing')}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Ver historial completo &rarr;
        </button>
      </div>

      {isLoading ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : preview.length === 0 ? (
        <p className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
          No hay facturas disponibles
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {preview.map((invoice) => {
            const badge = STATUS_BADGES[invoice.status] ?? STATUS_BADGES.open
            return (
              <li
                key={invoice.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {formatDate(invoice.invoice_date)}
                  </p>
                  {(invoice.period_start || invoice.period_end) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(invoice.period_start)} &ndash; {formatDate(invoice.period_end)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {invoice.amount_display}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  {invoice.pdf_url && (
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                      aria-label="Descargar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
