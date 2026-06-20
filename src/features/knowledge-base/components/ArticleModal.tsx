import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import type { ArticleCategory, KnowledgeArticle } from '../types'
import { CATEGORY_LABELS } from '../types'
import { useCreateArticle, useUpdateArticle } from '../hooks/useArticleMutations'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ArticleCategory[]

const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  content: z.string().min(10, 'El contenido es obligatorio'),
  category: z.enum(['general', 'pricing', 'features', 'onboarding', 'faq', 'support']),
  keywordsRaw: z.string().optional(),
  order: z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface Props {
  article?: KnowledgeArticle | null
  onClose: () => void
}

export function ArticleModal({ article, onClose }: Props) {
  const isEdit = !!article
  const createArticle = useCreateArticle()
  const updateArticle = useUpdateArticle()
  const isPending = createArticle.isPending || updateArticle.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      keywordsRaw: '',
      order: 0,
    },
  })

  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        content: article.content,
        category: article.category,
        keywordsRaw: article.keywords.join(', '),
        order: article.order,
      })
    } else {
      reset({ title: '', content: '', category: 'general', keywordsRaw: '', order: 0 })
    }
  }, [article, reset])

  const onSubmit = async (values: FormValues) => {
    const keywords = (values.keywordsRaw ?? '')
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    const payload = {
      title: values.title,
      content: values.content,
      category: values.category,
      keywords,
      order: values.order,
    }

    if (isEdit && article) {
      await updateArticle.mutateAsync({ id: article.id, ...payload })
    } else {
      await createArticle.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="article-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Editar artículo' : 'Nuevo artículo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              {...register('title')}
              placeholder="Ej: Planes y precios"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                {...register('category')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                aria-label="Seleccionar categoría"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden
              </label>
              <input
                {...register('order')}
                type="number"
                min={0}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenido{' '}
              <span className="text-xs text-gray-400 font-normal">(Markdown soportado)</span>
            </label>
            <textarea
              {...register('content')}
              rows={8}
              placeholder="Describe el tema con claridad. El asistente usará este texto para responder."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Palabras clave{' '}
              <span className="text-xs text-gray-400 font-normal">(separadas por coma)</span>
            </label>
            <input
              {...register('keywordsRaw')}
              placeholder="planes, precio, starter, professional"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              El asistente busca artículos usando estas palabras cuando el usuario hace una pregunta.
            </p>
          </div>

          {/* Error */}
          {(createArticle.isError || updateArticle.isError) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al guardar. Intenta de nuevo.
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </div>
    </div>
  )
}
