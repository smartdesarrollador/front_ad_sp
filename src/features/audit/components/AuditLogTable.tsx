import { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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

const COLUMNS = ['Timestamp', 'Actor', 'Acción', 'Recurso', 'ID Recurso', 'IP', 'Detalles']

export function AuditLogTable({ logs, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(sentinelRef, { threshold: 0.1 })

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()
  // jsdom has 0-height containers → virtualizer returns 0 items; fall back to rendering all rows
  const useVirtualized = virtualItems.length > 0 || logs.length === 0
  const paddingTop = useVirtualized && virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom =
    useVirtualized && virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0
  const rowsToRender = useVirtualized ? virtualItems.map((vr) => logs[vr.index]) : logs

  return (
    <>
      <div
        ref={parentRef}
        className="max-h-[600px] overflow-y-auto overflow-x-auto"
      >
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
              : (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length} style={{ height: `${paddingTop}px`, padding: 0 }} />
                    </tr>
                  )}
                  {rowsToRender.map((log) => (
                    <AuditLogRow key={log.id} log={log} />
                  ))}
                  {paddingBottom > 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length} style={{ height: `${paddingBottom}px`, padding: 0 }} />
                    </tr>
                  )}
                </>
              )}
          </tbody>
        </table>

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

      {/* Scroll sentinel — outside scrollable div for IntersectionObserver */}
      <div ref={sentinelRef} data-testid="scroll-sentinel" className="h-1" />
    </>
  )
}
