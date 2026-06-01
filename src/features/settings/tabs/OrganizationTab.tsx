import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Globe } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateOrganization } from '../hooks/useUpdateOrganization'
import type { OrganizationUpdateRequest } from '../types'

const COLOR_PRESETS = ['#2563eb', '#7c3aed', '#dc2626', '#16a34a', '#d97706', '#0891b2']

const MAX_LOGO_SIZE    = 2 * 1024 * 1024   // 2 MB
const MAX_FAVICON_SIZE = 512 * 1024         // 512 KB
const ACCEPT_IMAGES    = 'image/jpeg,image/png'

const schema = z.object({
  name: z.string().min(1, 'El nombre de la organización es requerido'),
  primary_color: z.string(),
})

function OrganizationTab() {
  const tenant = useAuthStore((s) => s.tenant)
  const updateOrganization = useUpdateOrganization()
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])

  const [logoFile,      setLogoFile]      = useState<File | null>(null)
  const [faviconFile,   setFaviconFile]   = useState<File | null>(null)
  const [logoPreview,   setLogoPreview]   = useState<string | null>(tenant?.logo_url ?? null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(tenant?.favicon_url ?? null)
  const [logoError,     setLogoError]     = useState<string | null>(null)
  const [faviconError,  setFaviconError]  = useState<string | null>(null)

  const logoInputRef    = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  // Sync previews when AuthContext loads tenant from localStorage asynchronously
  useEffect(() => {
    if (tenant?.logo_url && !logoFile) setLogoPreview(tenant.logo_url)
  }, [tenant?.logo_url]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tenant?.favicon_url && !faviconFile) setFaviconPreview(tenant.favicon_url)
  }, [tenant?.favicon_url]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationUpdateRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: tenant?.name ?? '',
      primary_color: COLOR_PRESETS[0],
    },
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError('El logo no puede superar 2 MB.')
      return
    }
    setLogoError(null)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FAVICON_SIZE) {
      setFaviconError('El favicon no puede superar 512 KB.')
      return
    }
    setFaviconError(null)
    setFaviconFile(file)
    setFaviconPreview(URL.createObjectURL(file))
  }

  const onSubmit = (data: OrganizationUpdateRequest) => {
    updateOrganization.mutate({
      ...data,
      primary_color: selectedColor,
      logo: logoFile,
      favicon: faviconFile,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organización</h2>
        <p className="text-sm text-gray-500">Configura los datos de tu organización.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
            Nombre de la organización
          </label>
          <input
            id="org-name"
            {...register('name')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
            Subdominio
          </label>
          <input
            id="subdomain"
            value={tenant?.subdomain ?? ''}
            readOnly
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">El subdominio no puede ser modificado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color primario
          </label>
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="flex gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Identidad Visual */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Identidad Visual</h3>
          <p className="text-xs text-gray-500 mb-4">
            El logo aparecerá en el Navbar de Hub, Workspace y Vista. El favicon se mostrará en la pestaña del navegador.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Logo de la empresa</p>
              <div className="flex flex-col items-start gap-2">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={ACCEPT_IMAGES}
                  className="sr-only"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                </button>
                <p className="text-xs text-gray-400">JPG, PNG · máx 2 MB</p>
                {logoError && <p className="text-xs text-red-600">{logoError}</p>}
              </div>
            </div>

            {/* Favicon */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Favicon</p>
              <div className="flex flex-col items-start gap-2">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {faviconPreview ? (
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Globe className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept={ACCEPT_IMAGES}
                  className="sr-only"
                  onChange={handleFaviconChange}
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  {faviconPreview ? 'Cambiar favicon' : 'Subir favicon'}
                </button>
                <p className="text-xs text-gray-400">JPG, PNG · máx 512 KB</p>
                {faviconError && <p className="text-xs text-red-600">{faviconError}</p>}
              </div>
            </div>
          </div>
        </div>

        {updateOrganization.isError && (
          <p className="text-sm text-red-600">Error al guardar los cambios. Inténtalo de nuevo.</p>
        )}

        {updateOrganization.isSuccess && (
          <p className="text-sm text-green-600">Organización actualizada correctamente.</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateOrganization.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {updateOrganization.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizationTab
