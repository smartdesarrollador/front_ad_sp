import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus, Tag } from 'lucide-react'
import { usePromotions } from './hooks/usePromotions'
import { useUpdatePromotion } from './hooks/useUpdatePromotion'
import { useDeletePromotion } from './hooks/useDeletePromotion'
import { usePermissions } from '@/hooks/usePermissions'
import { PromotionCard } from './components/PromotionCard'
import { PromotionModal } from './components/PromotionModal'
import type { Promotion, PromotionStatus, PromotionType } from './types'

const PromotionStatsModal = lazy(() =>
  import('./components/PromotionStatsModal').then((m) => ({ default: m.PromotionStatsModal })),
)

export default function PromotionsPage() {
  const { promotions, isLoading } = usePromotions()
  const { mutate: updatePromotion } = useUpdatePromotion()
  const { mutate: deletePromotion } = useDeletePromotion()
  const { hasPermission } = usePermissions()

  const [showModal, setShowModal] = useState(false)
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null)
  const [statsPromotion, setStatsPromotion] = useState<Promotion | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PromotionType | 'all'>('all')

  // El backend gatea todo el CRUD con un único permiso RBAC: promotions.manage
  const canManage = hasPermission('promotions.manage')

  const handleEdit = (promotion: Promotion) => {
    setEditPromotion(promotion)
    setShowModal(true)
  }

  const handleNewPromotion = () => {
    setEditPromotion(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditPromotion(null)
  }

  const handleToggle = (promotion: Promotion) => {
    const newStatus: PromotionStatus =
      promotion.status === 'active' ? 'paused' : 'active'
    const label = newStatus === 'active' ? 'activar' : 'pausar'
    if (window.confirm(`¿Deseas ${label} la promoción "${promotion.code}"?`)) {
      updatePromotion({ id: promotion.id, status: newStatus })
    }
  }

  const handleDelete = (id: string) => {
    const promotion = promotions.find((p) => p.id === id)
    deletePromotion(id, {
      onError: (err) => {
        const status = (err as { response?: { status?: number } }).response?.status
        if (status === 409) {
          // Tiene canjes registrados: el backend no permite borrarla
          if (
            window.confirm(
              `La promoción "${promotion?.code ?? ''}" tiene canjes registrados y no puede eliminarse. ¿Deseas pausarla en su lugar?`,
            )
          ) {
            updatePromotion({ id, status: 'paused' })
          }
        } else {
          window.alert('No se pudo eliminar la promoción. Intenta de nuevo.')
        }
      },
    })
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return promotions.filter((p) => {
      const matchSearch =
        !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchType = typeFilter === 'all' || p.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [promotions, search, statusFilter, typeFilter])

  const summary = useMemo(
    () => ({
      active: promotions.filter((p) => p.status === 'active').length,
      totalUses: promotions.reduce((acc, p) => acc + p.current_uses, 0),
      totalRevenue: promotions.reduce((acc, p) => acc + p.total_revenue, 0),
    }),
    [promotions],
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promociones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? 'Cargando...'
              : `${promotions.length} promociones · ${summary.active} activas`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleNewPromotion}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Promoción
          </button>
        )}
      </div>

      {/* KPI summary */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Activas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Usos
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.totalUses}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Ingresos
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${summary.totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código o nombre..."
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PromotionStatus | 'all')}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="paused">Pausada</option>
          <option value="expired">Expirada</option>
          <option value="depleted">Agotada</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PromotionType | 'all')}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todos los tipos</option>
          <option value="percentage">Porcentaje</option>
          <option value="fixed_amount">Monto fijo</option>
        </select>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay promociones</p>
          <p className="text-sm mt-1">
            {promotions.length === 0
              ? 'Crea la primera promoción para empezar.'
              : 'No hay resultados para los filtros seleccionados.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onViewStats={setStatsPromotion}
              canUpdate={canManage}
              canDelete={canManage}
              canViewStats={canManage}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PromotionModal
        promotion={editPromotion}
        isOpen={showModal}
        onClose={handleCloseModal}
      />

      {statsPromotion && (
        <Suspense fallback={null}>
          <PromotionStatsModal
            promotion={statsPromotion}
            onClose={() => setStatsPromotion(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
