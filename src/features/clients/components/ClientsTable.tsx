import { Eye, Building2, CheckCircle, Clock, AlertTriangle, XCircle, UserX, UserCheck } from 'lucide-react'
import type { Client, PlanType, ClientSubscriptionStatus } from '../types'

const PLAN_BADGE_CLASSES: Record<PlanType, string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  professional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  enterprise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const PLAN_NAMES: Record<PlanType, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

interface StatusConfig {
  label: string
  icon: React.ComponentType<{ className?: string }>
  css: string
}

const STATUS_CONFIG: Record<ClientSubscriptionStatus, StatusConfig> = {
  active: {
    label: 'Activo',
    icon: CheckCircle,
    css: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  trial: {
    label: 'Prueba',
    icon: Clock,
    css: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  past_due: {
    label: 'Pago Vencido',
    icon: AlertTriangle,
    css: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    css: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
}

function ClientAvatar({ name, primaryColor }: { name: string; primaryColor: string | null }) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: primaryColor ?? '#2563eb' }}
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </td>
      ))}
    </tr>
  )
}

interface ClientsTableProps {
  clients: Client[]
  isLoading: boolean
  canEdit: boolean
  onView: (client: Client) => void
  onSuspend: (client: Client) => void
}

export function ClientsTable({ clients, isLoading, canEdit, onView, onSuspend }: ClientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Cliente</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Plan</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Usuarios</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">MRR</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Creado</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!isLoading && clients.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                  <Building2 className="h-8 w-8" />
                  <span className="text-sm">No se encontraron clientes</span>
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            clients.map((client) => {
              const statusCfg = STATUS_CONFIG[client.subscription.status]
              const StatusIcon = statusCfg.icon
              const planCss = PLAN_BADGE_CLASSES[client.subscription.plan]
              const planName = PLAN_NAMES[client.subscription.plan]
              return (
                <tr
                  key={client.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={client.name} primaryColor={client.primary_color} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{client.subdomain}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{client.admin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${planCss}`}>
                      {planName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusCfg.css}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {client.usage.users.current}
                    {client.usage.users.limit !== null && (
                      <span className="text-gray-400"> / {client.usage.users.limit}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    ${client.subscription.mrr.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(client.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(client)}
                        title="Ver detalle"
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => onSuspend(client)}
                          title={client.is_active ? 'Suspender' : 'Activar'}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          {client.is_active ? (
                            <UserX className="h-4 w-4 text-red-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
