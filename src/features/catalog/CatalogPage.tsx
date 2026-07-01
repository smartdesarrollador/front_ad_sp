import { useState } from 'react'
import { Plus, Layers } from 'lucide-react'
import { useCatalogItems } from './hooks/useCatalogItems'
import { useDeleteCatalogItem } from './hooks/useDeleteCatalogItem'
import { CatalogItemCard } from './components/CatalogItemCard'
import { CatalogItemModal } from './components/CatalogItemModal'
import type { CatalogItem } from './types'

export default function CatalogPage() {
  const { items, isLoading } = useCatalogItems()
  const { mutate: deleteItem } = useDeleteCatalogItem()

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<CatalogItem | null>(null)

  const handleEdit = (item: CatalogItem) => {
    setEditItem(item)
    setShowModal(true)
  }

  const handleNew = () => {
    setEditItem(null)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditItem(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogo de Servicios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? 'Cargando...'
              : `${items.length} servicios · ${items.filter((i) => i.is_active).length} activos`}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Sin servicios en el catálogo</p>
          <p className="text-sm mt-1">Crea el primer servicio para que aparezca en tus apps.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CatalogItemModal item={editItem} isOpen={showModal} onClose={handleClose} />
    </div>
  )
}
