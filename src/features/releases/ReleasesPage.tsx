import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useReleases } from './hooks/useReleases'
import { useUpdateRelease } from './hooks/useUpdateRelease'
import { useDeleteRelease } from './hooks/useDeleteRelease'
import { ReleaseTable } from './components/ReleaseTable'
import { UploadReleaseModal } from './components/UploadReleaseModal'
import type { DesktopRelease } from './types'

export default function ReleasesPage() {
  const { releases, isLoading } = useReleases()
  const { mutate: updateRelease } = useUpdateRelease()
  const { mutate: deleteRelease } = useDeleteRelease()

  const [showUpload, setShowUpload] = useState(false)
  const [editingRelease, setEditingRelease] = useState<DesktopRelease | null>(null)

  const handleTogglePublish = (release: DesktopRelease) => {
    updateRelease({ id: release.id, is_published: !release.is_published })
  }

  const handleDelete = (release: DesktopRelease) => {
    if (
      window.confirm(
        `¿Eliminar el release ${release.version} (${release.platform})? Esta acción no se puede deshacer.`,
      )
    ) {
      deleteRelease(release.id)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Desktop App Releases
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading ? 'Cargando...' : `${releases.length} releases en total`}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Subir Release
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <ReleaseTable
          releases={releases}
          isLoading={isLoading}
          onTogglePublish={handleTogglePublish}
          onEdit={setEditingRelease}
          onDelete={handleDelete}
        />
      </div>

      <UploadReleaseModal isOpen={showUpload} onClose={() => setShowUpload(false)} />

      {editingRelease && (
        <EditNotesModal release={editingRelease} onClose={() => setEditingRelease(null)} />
      )}
    </div>
  )
}

interface EditNotesModalProps {
  release: DesktopRelease
  onClose: () => void
}

function EditNotesModal({ release, onClose }: EditNotesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, true)
  const { mutate, isPending } = useUpdateRelease()

  const { register, handleSubmit } = useForm({
    defaultValues: { release_notes: release.release_notes },
  })

  const onSubmit = ({ release_notes }: { release_notes: string }) => {
    mutate({ id: release.id, release_notes }, { onSuccess: onClose })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-notes-modal-title"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="edit-notes-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Editar notas — {release.version}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            <textarea
              {...register('release_notes')}
              rows={5}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
