import { useState } from 'react'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { ArticleCategory, KnowledgeArticle } from '../types'
import { CATEGORY_LABELS } from '../types'

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']
const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pricing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  features: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  onboarding: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  faq: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  support: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function getArticleColor(title: string): string {
  return PALETTE[title.charCodeAt(0) % PALETTE.length]
}

interface Props {
  article: KnowledgeArticle
  onEdit: (article: KnowledgeArticle) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function ArticleCard({ article, onEdit, onDelete, onToggle }: Props) {
  const [confirming, setConfirming] = useState(false)
  const accentColor = getArticleColor(article.title)

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    onDelete(article.id)
  }

  const preview = article.content.replace(/#+\s/g, '').slice(0, 120)

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-opacity ${
        article.is_active ? 'opacity-100' : 'opacity-60'
      }`}
    >
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggle(article.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={article.is_active ? 'Desactivar artículo' : 'Activar artículo'}
              title={article.is_active ? 'Desactivar' : 'Activar'}
            >
              {article.is_active ? (
                <Eye className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => onEdit(article)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Editar artículo"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-colors ${
                confirming
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={confirming ? 'Confirmar eliminación' : 'Eliminar artículo'}
              title={confirming ? '¿Confirmar?' : 'Eliminar'}
            >
              <Trash2
                className={`w-3.5 h-3.5 ${confirming ? 'text-red-600' : 'text-gray-500'}`}
              />
            </button>
          </div>
        </div>

        {/* Category badge */}
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            CATEGORY_COLORS[article.category]
          }`}
        >
          {CATEGORY_LABELS[article.category]}
        </span>

        {/* Content preview */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-3">
          {preview}
          {article.content.length > 120 && '…'}
        </p>

        {/* Keywords */}
        {article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
            {article.keywords.length > 4 && (
              <span className="text-[10px] text-gray-400">+{article.keywords.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Orden: {article.order}</span>
        <span
          className={`text-[10px] font-medium ${
            article.is_active
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {article.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}
