import { useState } from 'react'
import { X } from 'lucide-react'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useUpdateTicket } from '../hooks/useUpdateTicket'
import type { TicketAssignee } from '../types'

interface AssignAgentModalProps {
  ticketId: string
  currentAssignee: TicketAssignee | null
  isOpen: boolean
  onClose: () => void
}

export function AssignAgentModal({
  ticketId,
  currentAssignee,
  isOpen,
  onClose,
}: AssignAgentModalProps) {
  const { users } = useUsers()
  const updateTicket = useUpdateTicket()
  const [selectedUserId, setSelectedUserId] = useState(currentAssignee?.id ?? '')

  if (!isOpen) return null

  const handleConfirm = () => {
    updateTicket.mutate(
      { id: ticketId, assigned_to: selectedUserId || null },
      { onSuccess: onClose },
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-60" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Asignar Agente
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agente
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={updateTicket.isPending}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
