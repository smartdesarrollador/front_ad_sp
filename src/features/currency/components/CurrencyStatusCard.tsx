import { Clock, User } from 'lucide-react'
import type { CurrencyConfig } from '../types'

const SOURCE_LABELS: Record<CurrencyConfig['source'], string> = {
  manual: 'Manual',
  auto: 'Automático',
}

const SOURCE_CLASSES: Record<CurrencyConfig['source'], string> = {
  manual: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  auto: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

interface Props {
  config: CurrencyConfig
}

export function CurrencyStatusCard({ config }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de cambio vigente</p>
          <div className="flex items-baseline gap-2 mt-1">
            {/* Número plano, no formato moneda: es un ratio, no un importe. */}
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {config.usd_to_pen}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">soles por dólar</span>
          </div>
        </div>
        <span
          title="Hoy el tipo de cambio siempre se fija a mano; la actualización automática llegará más adelante."
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_CLASSES[config.source]}`}
        >
          {SOURCE_LABELS[config.source]}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Actualizado el {formatDate(config.updated_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {/* El backend emite null si el usuario que lo cambió fue eliminado. */}
          Por {config.updated_by_email ?? 'Sistema'}
        </span>
      </div>
    </div>
  )
}
