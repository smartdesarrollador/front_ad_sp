import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TicketStatusBadge } from './TicketStatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { CATEGORY_LABELS } from './TicketFilters'
import type { SupportTicket } from '../types'

const PER_PAGE = 15

interface TicketQueueProps {
  tickets: SupportTicket[]
  isLoading: boolean
  selectedTicketId: string | null
  onSelectTicket: (ticket: SupportTicket) => void
}

export function TicketQueue({
  tickets,
  isLoading,
  selectedTicketId,
  onSelectTicket,
}: TicketQueueProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(tickets.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = tickets.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Referencia
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Asunto
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Estado
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Prioridad
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Categoría
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Asignado
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
              </tr>
            ))
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Sin tickets
              </td>
            </tr>
          ) : (
            paginated.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  ticket.id === selectedTicketId
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                <td className="py-3 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {ticket.reference}
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs truncate">
                  {ticket.subject}
                </td>
                <td className="py-3 px-4">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="py-3 px-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {CATEGORY_LABELS[ticket.category]}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {ticket.assigned_to?.name ?? '—'}
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!isLoading && tickets.length > PER_PAGE && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {tickets.length} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
