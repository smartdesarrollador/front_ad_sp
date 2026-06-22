import { useMemo, useState } from 'react'
import { Inbox, Search } from 'lucide-react'

import { useContactMessages } from './hooks/useContactMessages'
import { ContactStatusBadge } from './components/ContactStatusBadge'
import { ContactDetailPanel } from './components/ContactDetailPanel'
import type { ContactMessage, ContactStatus } from './types'

export default function ContactPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | ContactStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const { messages, isLoading } = useContactMessages({ status: statusFilter, search })

  const newCount = useMemo(
    () => messages.filter((m) => m.status === 'new').length,
    [messages],
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mensajes de Contacto
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? 'Cargando...'
              : `${messages.length} mensaje${messages.length !== 1 ? 's' : ''} · ${newCount} nuevo${newCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
            <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {newCount} nuevo{newCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Card con filtros + tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Filtros */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ContactStatus)}
            aria-label="Filtrar por estado"
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevo</option>
            <option value="read">Leído</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Fecha</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4"><div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    </tr>
                  ))
                : messages.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                        No hay mensajes
                      </td>
                    </tr>
                  )
                  : messages.map((msg) => (
                    <tr
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className={`py-3 px-4 text-gray-900 dark:text-white ${msg.status === 'new' ? 'font-semibold' : ''}`}>
                        {msg.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{msg.email}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        <ContactStatusBadge status={msg.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <ContactDetailPanel
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </div>
  )
}
