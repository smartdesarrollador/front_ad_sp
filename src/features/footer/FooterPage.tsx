import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  PanelBottom,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Loader2,
} from 'lucide-react'
import { useFooterConfig } from './hooks/useFooterConfig'
import {
  useUpdateFooter,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
} from './hooks/useFooterMutations'
import type { FooterLink } from './types'

const schema = z.object({
  tagline:      z.string().max(200),
  email:        z.string().email('Email inválido').or(z.literal('')),
  whatsapp:     z.string().max(30),
  phone:        z.string().max(30),
  facebook_url:  z.string().url('URL inválida').or(z.literal('')),
  instagram_url: z.string().url('URL inválida').or(z.literal('')),
  youtube_url:   z.string().url('URL inválida').or(z.literal('')),
  linkedin_url:  z.string().url('URL inválida').or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const SOCIAL_FIELDS = [
  { key: 'facebook_url'  as const, label: 'Facebook',  icon: Facebook,  placeholder: 'https://facebook.com/...' },
  { key: 'instagram_url' as const, label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { key: 'youtube_url'   as const, label: 'YouTube',   icon: Youtube,   placeholder: 'https://youtube.com/...' },
  { key: 'linkedin_url'  as const, label: 'LinkedIn',  icon: Linkedin,  placeholder: 'https://linkedin.com/...' },
]

export default function FooterPage() {
  const { footer, isLoading } = useFooterConfig()
  const updateFooter = useUpdateFooter()
  const createLink   = useCreateLink()
  const updateLink   = useUpdateLink()
  const deleteLink   = useDeleteLink()

  const [savedOk, setSavedOk] = useState(false)
  const formInitialized = useRef(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tagline: '', email: '', whatsapp: '', phone: '',
      facebook_url: '', instagram_url: '', youtube_url: '', linkedin_url: '',
    },
  })

  useEffect(() => {
    if (footer && !formInitialized.current) {
      reset(footer)
      formInitialized.current = true
    }
  }, [footer, reset])

  const onSubmit = (values: FormValues) => {
    updateFooter.mutate(values, {
      onSuccess: () => {
        setSavedOk(true)
        setTimeout(() => setSavedOk(false), 3000)
      },
    })
  }

  const handleAddLink = () => {
    const nextOrder = (footer?.links.length ?? 0)
    createLink.mutate({ label: 'Nuevo enlace', url: '/', order: nextOrder })
  }

  const handleDeleteLink = (id: number) => deleteLink.mutate(id)

  const handleMoveLink = (link: FooterLink, direction: 'up' | 'down') => {
    const links = [...(footer?.links ?? [])].sort((a, b) => a.order - b.order)
    const idx = links.findIndex((l) => l.id === link.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= links.length) return
    updateLink.mutate({ id: link.id, order: links[swapIdx].order })
    updateLink.mutate({ id: links[swapIdx].id, order: link.order })
  }

  const handleLinkBlur = (link: FooterLink, field: 'label' | 'url', value: string) => {
    if (value === link[field]) return
    updateLink.mutate({ id: link.id, [field]: value })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PanelBottom className="h-6 w-6 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Configuración del Footer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Estos datos aparecen en el footer de todas las landing pages del Hub.
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={updateFooter.isPending}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
        >
          {updateFooter.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Save className="h-4 w-4" />}
          {savedOk ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Identidad ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Identidad
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tagline
            </label>
            <input
              {...register('tagline')}
              placeholder="Ej: Soluciones digitales para tu negocio"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* ── Contacto ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Información de Contacto
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { key: 'email'    as const, label: 'Email',     placeholder: 'hola@empresa.com' },
              { key: 'whatsapp' as const, label: 'WhatsApp',  placeholder: '+51999999999' },
              { key: 'phone'    as const, label: 'Teléfono',  placeholder: '+51 1 234 5678' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {label}
                </label>
                <input
                  {...register(key)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors[key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[key]?.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Redes Sociales ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Redes Sociales
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Icon className="h-4 w-4" />
                  {label}
                </label>
                <input
                  {...register(key)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors[key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[key]?.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* ── Enlaces ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Enlaces del Footer
          </h2>
          <button
            onClick={handleAddLink}
            disabled={createLink.isPending}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Agregar enlace
          </button>
        </div>

        {(!footer?.links || footer.links.length === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            No hay enlaces. Haz clic en "Agregar enlace" para comenzar.
          </p>
        ) : (
          <div className="space-y-2">
            {[...footer.links].sort((a, b) => a.order - b.order).map((link, idx, arr) => (
              <div
                key={link.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveLink(link, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveLink(link, 'down')}
                    disabled={idx === arr.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Label */}
                <input
                  defaultValue={link.label}
                  onBlur={(e) => handleLinkBlur(link, 'label', e.target.value)}
                  placeholder="Etiqueta"
                  className="flex-1 min-w-0 px-2 py-1.5 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-primary-400 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-colors"
                />

                {/* URL */}
                <input
                  defaultValue={link.url}
                  onBlur={(e) => handleLinkBlur(link, 'url', e.target.value)}
                  placeholder="/ruta o https://..."
                  className="flex-[2] min-w-0 px-2 py-1.5 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-primary-400 bg-transparent text-sm text-gray-500 dark:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-colors font-mono"
                />

                {/* Delete */}
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={deleteLink.isPending}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
