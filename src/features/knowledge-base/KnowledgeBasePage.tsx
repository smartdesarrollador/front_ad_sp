import { useMemo, useState } from 'react'
import { Plus, BookOpen, Bot } from 'lucide-react'
import { useKnowledgeBase } from './hooks/useKnowledgeBase'
import { useDeleteArticle, useToggleArticle } from './hooks/useArticleMutations'
import { ArticleCard } from './components/ArticleCard'
import { ArticleFilters } from './components/ArticleFilters'
import { ArticleModal } from './components/ArticleModal'
import type { KnowledgeArticle } from './types'

export default function KnowledgeBasePage() {
  const { articles, isLoading } = useKnowledgeBase()
  const deleteArticle = useDeleteArticle()
  const toggleArticle = useToggleArticle()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalArticle, setModalArticle] = useState<KnowledgeArticle | null | undefined>(undefined)

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase()) ||
        a.keywords.some((k) => k.includes(search.toLowerCase()))
      const matchCategory = !category || a.category === category
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'active' ? a.is_active : !a.is_active)
      return matchSearch && matchCategory && matchStatus
    })
  }, [articles, search, category, statusFilter])

  const activeCount = articles.filter((a) => a.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Base de Conocimiento
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Artículos que el asistente IA usa para responder preguntas en el Hub.
          </p>
        </div>
        <button
          onClick={() => setModalArticle(null)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo artículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total artículos', value: articles.length, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Artículos activos', value: activeCount, icon: Bot, color: 'text-green-600' },
          { label: 'Artículos inactivos', value: articles.length - activeCount, icon: BookOpen, color: 'text-gray-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <ArticleFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalCount={filtered.length}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {articles.length === 0
              ? 'No hay artículos aún. Crea el primero.'
              : 'No hay artículos que coincidan con los filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={setModalArticle}
              onDelete={(id) => deleteArticle.mutate(id)}
              onToggle={(id) => toggleArticle.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            ¿Cómo funciona el asistente?
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Cuando un usuario escribe una pregunta en el chat del Hub, el sistema busca automáticamente
            los artículos más relevantes (por título, contenido y palabras clave) y los envía al AI
            como contexto. Solo los artículos <strong>activos</strong> son usados. Mantén el contenido
            actualizado para que el asistente responda correctamente.
          </p>
        </div>
      </div>

      {/* Modal */}
      {modalArticle !== undefined && (
        <ArticleModal
          article={modalArticle}
          onClose={() => setModalArticle(undefined)}
        />
      )}
    </div>
  )
}
