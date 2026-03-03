import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { AuditLogEntry } from '../types'

function getActionBadgeClass(action: string): string {
  const a = action.toLowerCase()
  if (/create|add/.test(a)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (/delete|remove/.test(a)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (/update|edit|change|patch/.test(a)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (/login|logout/.test(a)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  if (/reveal/.test(a)) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}

interface Props {
  log: AuditLogEntry
}

export function AuditLogRow({ log }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasExtra = log.extra !== undefined && Object.keys(log.extra).length > 0
  const hasDetails = hasExtra || !!log.user_agent
  const actor = log.user_name ?? log.user_email ?? 'Sistema'
  const shortId = log.resource_id ? log.resource_id.slice(0, 8) : '—'

  return (
    <>
      <tr
        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={hasDetails ? () => setExpanded((prev) => !prev) : undefined}
      >
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {formatTimestamp(log.created_at)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
          {actor}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionBadgeClass(log.action)}`}>
            {log.action}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {log.resource_type}
        </td>
        <td
          className="px-4 py-3 text-sm text-gray-500 dark:text-gray-500 font-mono"
          title={log.resource_id ?? undefined}
        >
          {shortId}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-500 font-mono">
          {log.ip_address ?? '—'}
        </td>
        <td className="px-4 py-3 text-center">
          {hasDetails && (
            expanded
              ? <ChevronDown className="h-4 w-4 text-gray-400 mx-auto" />
              : <ChevronRight className="h-4 w-4 text-gray-400 mx-auto" />
          )}
        </td>
      </tr>

      {expanded && hasDetails && (
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={7} className="px-6 py-4 text-sm">
            {log.user_agent && (
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">User Agent: </span>
                {log.user_agent}
              </p>
            )}
            {hasExtra && (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 rounded p-3 overflow-x-auto text-gray-700 dark:text-gray-300">
                {JSON.stringify(log.extra, null, 2)}
              </pre>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
