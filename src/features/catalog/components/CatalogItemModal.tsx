import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Trash2 } from 'lucide-react'
import { useCreateCatalogItem } from '../hooks/useCreateCatalogItem'
import { useUpdateCatalogItem } from '../hooks/useUpdateCatalogItem'
import type { CatalogItem, TargetApp } from '../types'

const TARGET_APP_OPTIONS: { value: TargetApp; label: string }[] = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile',  label: 'Mobile' },
  { value: 'web',     label: 'Web' },
]

const CATEGORY_OPTIONS = [
  'web', 'marketing', 'automatizacion', 'diseño', 'ia', 'desarrollo', 'consultoria', 'otro',
]

const schema = z.object({
  name:              z.string().min(2, 'Mínimo 2 caracteres').max(100),
  short_description: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  description:       z.string().optional(),
  icon_color:        z.string().optional(),
  category:          z.string().optional(),
  link_url:          z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
  badge_text:        z.string().max(30).optional(),
  target_apps:       z.array(z.enum(['desktop', 'mobile', 'web'])).optional(),
  is_active:         z.boolean().optional(),
  order:             z.number().int().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

interface CatalogItemModalProps {
  item: CatalogItem | null
  isOpen: boolean
  onClose: () => void
}

export function CatalogItemModal({ item, isOpen, onClose }: CatalogItemModalProps) {
  const { mutate: create, isPending: creating } = useCreateCatalogItem()
  const { mutate: update, isPending: updating } = useUpdateCatalogItem()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      short_description: '',
      description: '',
      icon_color: '#6366f1',
      category: '',
      link_url: '',
      badge_text: '',
      target_apps: [],
      is_active: true,
      order: 0,
    },
  })

  const targetApps = watch('target_apps') ?? []

  useEffect(() => {
    if (!isOpen) return
    setImageFile(null)
    if (item) {
      reset({
        name:              item.name,
        short_description: item.short_description,
        description:       item.description,
        icon_color:        item.icon_color,
        category:          item.category,
        link_url:          item.link_url,
        badge_text:        item.badge_text,
        target_apps:       item.target_apps,
        is_active:         item.is_active,
        order:             item.order,
      })
      setImagePreview(item.image_url)
    } else {
      reset({
        name: '', short_description: '', description: '',
        icon_color: '#6366f1', category: '', link_url: '',
        badge_text: '', target_apps: [], is_active: true, order: 0,
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

  const toggleApp = (app: TargetApp) => {
    const current = targetApps
    const next = current.includes(app)
      ? current.filter((a) => a !== app)
      : [...current, app]
    setValue('target_apps', next)
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      image: imageFile ?? undefined,
    }
    if (item) {
      update(
        { id: item.id, ...payload },
        {
          onSuccess: onClose,
          onError: (err: unknown) => {
            const msg = (err as { response?: { status?: number } })?.response?.status === 402
              ? 'Has alcanzado el límite de tu plan.'
              : 'Ocurrió un error. Intenta de nuevo.'
            alert(msg)
          },
        },
      )
    } else {
      create(payload as Parameters<typeof create>[0], {
        onSuccess: onClose,
        onError: (err: unknown) => {
          const msg = (err as { response?: { status?: number } })?.response?.status === 402
            ? 'Has alcanzado el límite de tu plan.'
            : 'Ocurrió un error. Intenta de nuevo.'
          alert(msg)
        },
      })
    }
  }

  if (!isOpen) return null

  const isPending = creating || updating
  const iconColor = watch('icon_color') ?? '#6366f1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagen / Ícono
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
                <div
                  className="w-16 h-16 rounded-lg flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  style={{ backgroundColor: `${iconColor}20` }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: iconColor }} />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="catalog-image-input"
                />
                <label
                  htmlFor="catalog-image-input"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG · máx 2 MB</p>
              </div>

              {/* Color fallback */}
              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
                  Color
                </label>
                <input
                  type="color"
                  {...register('icon_color')}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0.5 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Páginas Web"
            />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
          </div>

          {/* Short description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción corta <span className="text-red-500">*</span>
            </label>
            <input
              {...register('short_description')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Landing pages y sitios corporativos profesionales."
            />
            {errors.short_description && (
              <p className="text-xs text-red-500 mt-0.5">{errors.short_description.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción completa
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Descripción detallada del servicio..."
            />
          </div>

          {/* Category + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sin categoría</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Badge (opcional)
              </label>
              <input
                {...register('badge_text')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Nuevo"
              />
            </div>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL "Más información"
            </label>
            <input
              {...register('link_url')}
              type="url"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://..."
            />
            {errors.link_url && (
              <p className="text-xs text-red-500 mt-0.5">{errors.link_url.message}</p>
            )}
          </div>

          {/* Target apps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mostrar en
            </label>
            <div className="flex gap-3">
              {TARGET_APP_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={targetApps.includes(value)}
                    onChange={() => toggleApp(value)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order + Active */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden
              </label>
              <input
                type="number"
                min={0}
                {...register('order', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activo (visible en apps)
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {item ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </div>
      </div>
    </div>
  )
}
