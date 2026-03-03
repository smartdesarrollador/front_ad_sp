import { useState, useMemo } from 'react'
import { Inbox, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { useTickets } from './hooks/useTickets'
import { usePermissions } from '@/hooks/usePermissions'
import { TicketFilters } from './components/TicketFilters'
import { TicketQueue } from './components/TicketQueue'
import { TicketDetailView } from './components/TicketDetailView'
import type { SupportTicket, TicketStatus, TicketPriority, TicketCategory } from './types'

type TabType = 'bandeja' | 'historial'

const BANDEJA_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_client']
const HISTORIAL_STATUSES: TicketStatus[] = ['resolved', 'closed']

export default function SupportPage() {
  const { tickets, isLoading } = useTickets()
  const { hasPermission } = usePermissions()

  const [tab, setTab] = useState<TabType>('bandeja')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | TicketCategory>('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const isAgent = hasPermission('support.assign')
  const canUpdate = hasPermission('support.update')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const kpis = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === 'open').length
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length
    const resolvedToday = tickets.filter((t) => {
      if (!t.resolved_at) return false
      return new Date(t.resolved_at) >= today
    }).length
    return { total, open, inProgress, resolvedToday }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets])

  const filteredTickets = useMemo<SupportTicket[]>(() => {
    const tabStatuses = tab === 'bandeja' ? BANDEJA_STATUSES : HISTORIAL_STATUSES
    const q = search.toLowerCase()

    return tickets.filter((t) => {
      const matchTab = tabStatuses.includes(t.status)
      const matchSearch =
        !q ||
        t.reference.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.client_email.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchTab && matchSearch && matchStatus && matchPriority && matchCategory
    })
  }, [tickets, tab, search, statusFilter, priorityFilter, categoryFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Soporte</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {isLoading
            ? 'Cargando...'
            : `${kpis.total} tickets · ${kpis.open} abiertos`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Inbox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Abiertos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">En Progreso</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resueltos Hoy</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.resolvedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {(['bandeja', 'historial'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                tab === t
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'bandeja' ? 'Bandeja' : 'Historial'}
            </button>
          ))}
        </div>
      </div>

      {/* Card: Filters + Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <TicketFilters
            search={search}
            onSearch={handleSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilter={setCategoryFilter}
          />
        </div>

        <TicketQueue
          tickets={filteredTickets}
          isLoading={isLoading}
          selectedTicketId={selectedTicketId}
          onSelectTicket={handleSelectTicket}
        />
      </div>

      {/* Detail Panel */}
      <TicketDetailView
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        isAgent={isAgent}
        canUpdate={canUpdate}
      />
    </div>
  )
}
