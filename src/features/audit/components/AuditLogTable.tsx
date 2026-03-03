import { useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { AuditLogRow } from './AuditLogRow'
import type { AuditLogEntry } from '../types'

interface Props {
  logs: AuditLogEntry[]
  isLoading: boolean
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

const COLUMNS = ['Timestamp', 'Actor', 'Acción', 'Recurso', 'ID Recurso', 'IP', '']

export function AuditLogTable({ logs, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(sentinelRef, { threshold: 0.1 })

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {COLUMNS.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-700">
                  {COLUMNS.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : logs.map((log) => <AuditLogRow key={log.id} log={log} />)}
        </tbody>
      </table>

      {/* Scroll sentinel */}
      <div ref={sentinelRef} data-testid="scroll-sentinel" className="h-1" />

      {/* Footer state */}
      <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
        {isFetchingNextPage && (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando más...
          </span>
        )}
        {!hasNextPage && logs.length > 0 && !isFetchingNextPage && (
          <span>No hay más logs</span>
        )}
      </div>
    </div>
  )
}
