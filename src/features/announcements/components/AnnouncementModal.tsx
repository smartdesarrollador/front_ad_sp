import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Trash2 } from 'lucide-react'
import { useCreateAnnouncement } from '../hooks/useCreateAnnouncement'
import { useUpdateAnnouncement } from '../hooks/useUpdateAnnouncement'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Announcement } from '../types'

const schema = z
  .object({
    title: z.string().min(2, 'Mínimo 2 caracteres').max(200),
    message: z.string().optional(),
    cta_text: z.string().max(50).optional(),
    cta_url: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
    placement: z.enum(['home', 'dashboard', 'both']),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    priority: z.number({ error: 'Ingresa un número' }).int().min(0).optional(),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.starts_at && data.ends_at && data.ends_at <= data.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['ends_at'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface AnnouncementModalProps {
  item: Announcement | null
  isOpen: boolean
  onClose: () => void
}

export function AnnouncementModal({ item, isOpen, onClose }: AnnouncementModalProps) {
  const isEdit = item !== null
  const { mutate: create, isPending: creating } = useCreateAnnouncement()
  const { mutate: update, isPending: updating } = useUpdateAnnouncement()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      message: '',
      cta_text: '',
      cta_url: '',
      placement: 'both',
      starts_at: '',
      ends_at: '',
      priority: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    setImageFile(null)
    if (item) {
      reset({
        title: item.title,
        message: item.message,
        cta_text: item.cta_text,
        cta_url: item.cta_url,
        placement: item.placement,
        starts_at: item.starts_at ? item.starts_at.slice(0, 10) : '',
        ends_at: item.ends_at ? item.ends_at.slice(0, 10) : '',
        priority: item.priority,
        is_active: item.is_active,
      })
      setImagePreview(item.image_url)
    } else {
      reset({
        title: '', message: '', cta_text: '', cta_url: '',
        placement: 'both', starts_at: '', ends_at: '', priority: 0, is_active: true,
      })
      setImagePreview(null)
    }
  }, [isOpen, item, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar 2 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleClearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      starts_at: values.starts_at || undefined,
      ends_at: values.ends_at || undefined,
      image: imageFile ?? undefined,
    }
    const onError = (err: unknown) => {
      const msg = (err as { response?: { status?: number } })?.response?.status === 402
        ? 'Has alcanzado el límite de tu plan.'
        : 'Ocurrió un error. Intenta de nuevo.'
      alert(msg)
    }
    if (item) {
      update({ id: item.id, ...payload }, { onSuccess: onClose, onError })
    } else {
      create(payload as Parameters<typeof create>[0], { onSuccess: onClose, onError })
    }
  }

  if (!isOpen) return null

  const isPending = creating || updating

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-title"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 id="announcement-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Editar anuncio' : 'Nuevo anuncio'}
            </h2>
            <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imagen
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded-full text-white"
                        aria-label="Quitar imagen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/20" />
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="announcement-image-input"
                    />
                    <label
                      htmlFor="announcement-image-input"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                    </label>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG · máx 2 MB</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: 50% de descuento en Landing Pages"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensaje
                </label>
                <textarea
                  {...register('message')}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Texto del anuncio..."
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Texto del botón
                  </label>
                  <input
                    {...register('cta_text')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Ver oferta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL del botón
                  </label>
                  <input
                    {...register('cta_url')}
                    type="url"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                  {errors.cta_url && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cta_url.message}</p>}
                </div>
              </div>

              {/* Placement + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dónde se muestra
                  </label>
                  <select
                    {...register('placement')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="home">Solo Home</option>
                    <option value="dashboard">Solo Dashboard</option>
                    <option value="both">Home + Dashboard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register('priority', { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.priority && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.priority.message}</p>}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha inicio (opcional)
                  </label>
                  <input
                    {...register('starts_at')}
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha fin (opcional)
                  </label>
                  <input
                    {...register('ends_at')}
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.ends_at && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.ends_at.message}</p>}
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  id="announcement-is-active"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="announcement-is-active" className="text-sm text-gray-700 dark:text-gray-300">
                  Activo (visible de inmediato)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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
                {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear anuncio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
