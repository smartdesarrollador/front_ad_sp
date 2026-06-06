import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Moon, Sun } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

const TIMEZONES = [
  'America/Mexico_City',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
]

function InterfaceTab() {
  const { i18n } = useTranslation()
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const currentLanguage = i18n.language?.split('-')[0] ?? 'es'
  const [timezone, setTimezone] = useState('America/Mexico_City')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interfaz</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza la apariencia y el comportamiento de la aplicación.</p>
      </div>

      {/* Dark mode */}
      <div className="rounded-lg border border-gray-200 p-5 space-y-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Tema</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {darkMode ? (
              <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <Sun className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">{darkMode ? 'Modo oscuro' : 'Modo claro'}</span>
          </div>
          <button
            onClick={toggleDarkMode}
            role="switch"
            aria-checked={darkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-lg border border-gray-200 p-5 space-y-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Idioma</h3>
        <select
          value={currentLanguage}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Timezone */}
      <div className="rounded-lg border border-gray-200 p-5 space-y-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Zona horaria</h3>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Date format */}
      <div className="rounded-lg border border-gray-200 p-5 space-y-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Formato de fecha</h3>
        <select
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          {DATE_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>Los cambios de idioma y tema se aplican al instante.</p>
      </div>
    </div>
  )
}

export default InterfaceTab
