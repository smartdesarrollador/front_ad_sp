import { useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useAnnouncements } from './hooks/useAnnouncements'
import { useDeleteAnnouncement } from './hooks/useDeleteAnnouncement'
import { useUpdateAnnouncement } from './hooks/useUpdateAnnouncement'
import { AnnouncementCard } from './components/AnnouncementCard'
import { AnnouncementModal } from './components/AnnouncementModal'
import type { Announcement } from './types'

export default function AnnouncementsPage() {
  const { items, isLoading } = useAnnouncements()
  const { mutate: deleteItem } = useDeleteAnnouncement()
  const { mutate: updateItem } = useUpdateAnnouncement()

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Announcement | null>(null)

  const handleEdit = (item: Announcement) => {
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

  const handleToggle = (item: Announcement) => {
    const next = !item.is_active
    if (window.confirm(`¿Deseas ${next ? 'activar' : 'desactivar'} "${item.title}"?`)) {
      updateItem({ id: item.id, is_active: next })
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anuncios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? 'Cargando...'
              : `${items.length} anuncios · ${items.filter((i) => i.is_active).length} activos`}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Anuncio
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
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Sin anuncios aún</p>
          <p className="text-sm mt-1">Crea el primer anuncio para mostrarlo en Home o Dashboard del Hub.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={deleteItem}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnnouncementModal item={editItem} isOpen={showModal} onClose={handleClose} />
    </div>
  )
}
