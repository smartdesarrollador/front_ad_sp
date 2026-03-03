import { useState } from 'react'
import { X, UserCheck, XCircle } from 'lucide-react'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { useUpdateTicket } from '../hooks/useUpdateTicket'
import { useCloseTicket } from '../hooks/useCloseTicket'
import { PriorityBadge } from './PriorityBadge'
import { CommentThread } from './CommentThread'
import { CommentInput } from './CommentInput'
import { AssignAgentModal } from './AssignAgentModal'
import { CATEGORY_LABELS } from './TicketFilters'
import type { TicketStatus } from '../types'

interface TicketDetailViewProps {
  ticketId: string | null
  onClose: () => void
  isAgent: boolean
  canUpdate: boolean
}

export function TicketDetailView({ ticketId, onClose, isAgent, canUpdate }: TicketDetailViewProps) {
  const { ticket, isLoading } = useTicketDetail(ticketId)
  const updateTicket = useUpdateTicket()
  const closeTicket = useCloseTicket()
  const [showAssignModal, setShowAssignModal] = useState(false)

  if (ticketId === null) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white font-mono">
            {ticket?.reference ?? '...'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : ticket ? (
            <>
              {/* Subject + Description */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {ticket.subject}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Prioridad
                  </p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Categoría
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {CATEGORY_LABELS[ticket.category]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white break-all">
                    {ticket.client_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Asignado
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {ticket.assigned_to?.name ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Creado
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Resuelto
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {ticket.resolved_at
                      ? new Date(ticket.resolved_at).toLocaleDateString('es-ES')
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                {canUpdate && ticket.status !== 'closed' && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Estado
                    </label>
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        updateTicket.mutate({ id: ticket.id, status: e.target.value as TicketStatus })
                      }
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Abierto</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="waiting_client">Esperando Cliente</option>
                      <option value="resolved">Resuelto</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                )}

                {ticket.status !== 'closed' && (
                  <div className="flex flex-wrap gap-2">
                    {isAgent && (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <UserCheck className="h-4 w-4" />
                        Asignar Agente
                      </button>
                    )}
                    {canUpdate && (
                      <button
                        onClick={() => closeTicket.mutate(ticket.id)}
                        disabled={closeTicket.isPending}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Cerrar ticket
                      </button>
                    )}
                  </div>
                )}

                {ticket.status === 'closed' && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    Ticket cerrado
                  </span>
                )}
              </div>

              {/* Comment Thread */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Comentarios ({ticket.comments.length})
                </h4>
                <CommentThread comments={ticket.comments} isLoading={false} />
              </div>

              {/* Comment Input */}
              {canUpdate && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <CommentInput ticketId={ticket.id} isAgent={isAgent} />
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cerrar Panel
          </button>
        </div>
      </div>

      {ticket && (
        <AssignAgentModal
          ticketId={ticket.id}
          currentAssignee={ticket.assigned_to}
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  )
}
