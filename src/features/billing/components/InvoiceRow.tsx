import { Download } from 'lucide-react'
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
  invoice: Invoice
}

export function InvoiceRow({ invoice }: Props) {
  const badge = STATUS_BADGES[invoice.status] ?? STATUS_BADGES.open

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        {formatDate(invoice.invoice_date)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(invoice.period_start)} &ndash; {formatDate(invoice.period_end)}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
        {invoice.amount_display}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {invoice.pdf_url ? (
          <a
            href={invoice.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
            aria-label="Descargar PDF"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  )
}
