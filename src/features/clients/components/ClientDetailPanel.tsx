import { useState } from 'react'
import { X, UserX, UserCheck } from 'lucide-react'
import { UsageMeters } from '@/features/subscriptions/components/UsageMeters'
import type { Client } from '../types'

type Tab = 'info' | 'uso' | 'usuarios'

interface ClientDetailPanelProps {
  client: Client | null
  onClose: () => void
  onSuspend: (client: Client) => void
  canEdit: boolean
}

export function ClientDetailPanel({ client, onClose, onSuspend, canEdit }: ClientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')

  if (!client) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de Cliente</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: client.primary_color ?? '#2563eb' }}
          >
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{client.subdomain}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {(['info', 'uso', 'usuarios'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'info' ? 'Info' : tab === 'uso' ? 'Uso' : 'Usuarios'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5">
          {activeTab === 'info' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Subdominio</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{client.subdomain}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Admin Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{client.admin_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Estado</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    client.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {client.is_active ? 'Activo' : 'Suspendido'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Plan</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{client.subscription.plan_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">MRR</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ${client.subscription.mrr.toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Creado</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(client.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'uso' && (
            <UsageMeters usage={client.usage} isLoading={false} />
          )}

          {activeTab === 'usuarios' && (
            <div>
              {client.recent_users.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Sin usuarios recientes</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                      <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Rol</th>
                      <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.recent_users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-white">{u.name}</td>
                        <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{u.email}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={u.is_active ? 'badge badge-active' : 'badge badge-inactive'}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onSuspend(client)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                client.is_active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {client.is_active ? (
                <>
                  <UserX className="h-4 w-4" />
                  Suspender
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Activar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
