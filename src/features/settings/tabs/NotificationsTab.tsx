import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { NotificationPreferences } from '../types'

const DEFAULT_PREFS: NotificationPreferences = {
  security: true,
  billing: true,
  team: true,
  marketing: false,
  channel: 'email',
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
        <p className="text-sm text-gray-500">Configura qué notificaciones deseas recibir.</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Categorías</h3>

        <div className="space-y-3">
          {/* Security - always enabled */}
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.security}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-700">Seguridad</span>
              <Lock className="h-3 w-3 text-gray-400" aria-label="Siempre habilitado" />
            </div>
            <span className="text-xs text-gray-400">Siempre activo</span>
          </label>

          {/* Billing */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.billing}
              onChange={(e) => setPrefs((p) => ({ ...p, billing: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Facturación</span>
          </label>

          {/* Team */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.team}
              onChange={(e) => setPrefs((p) => ({ ...p, team: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Equipo</span>
          </label>

          {/* Marketing */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Marketing y novedades</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Canal de notificaciones</h3>

        <div className="space-y-2">
          {[
            { value: 'email', label: 'Email' },
            { value: 'in_app', label: 'En la aplicación' },
            { value: 'none', label: 'Ninguno' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="channel"
                value={opt.value}
                checked={prefs.channel === opt.value}
                onChange={() => setPrefs((p) => ({ ...p, channel: opt.value as NotificationPreferences['channel'] }))}
                className="h-4 w-4 border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {saved && (
        <p className="text-sm text-green-600">Preferencias guardadas.</p>
      )}

      <div>
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

export default NotificationsTab
