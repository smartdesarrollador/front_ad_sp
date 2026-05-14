import { useCallback, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileArchive, Upload, X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useUploadRelease } from '../hooks/useUploadRelease'
import type { ReleaseAppType, ReleasePlatform } from '../types'

const ALLOWED_EXTENSIONS = ['.exe', '.msi', '.dmg']
const MAX_SIZE_BYTES = 500 * 1024 * 1024

const schema = z.object({
  version: z
    .string()
    .min(1, 'La versión es requerida')
    .regex(/^\d+\.\d+\.\d+/, 'Formato esperado: 1.0.0'),
  platform: z.enum(['windows', 'macos', 'linux'] as const, {
    error: 'Selecciona una plataforma',
  }),
  app_type: z.enum(['tauri', 'sidebar'] as const, {
    error: 'Selecciona el tipo de app',
  }),
  file: z
    .instanceof(File, { message: 'Selecciona un archivo' })
    .refine(
      (f) => ALLOWED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)),
      { message: 'Solo se aceptan archivos .exe, .msi o .dmg' },
    )
    .refine((f) => f.size <= MAX_SIZE_BYTES, {
      message: 'El archivo supera el límite de 500 MB',
    }),
  release_notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface UploadReleaseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadReleaseModal({ isOpen, onClose }: UploadReleaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  const { mutate, isPending, isUploading, progress, resetProgress, error } = useUploadRelease()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const selectedFile = watch('file')

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) setValue('file', file, { shouldValidate: true })
    },
    [setValue],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setValue('file', file, { shouldValidate: true })
  }

  const handleClose = () => {
    if (isUploading) return
    reset()
    resetProgress()
    onClose()
  }

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        version: values.version,
        platform: values.platform as ReleasePlatform,
        app_type: values.app_type as ReleaseAppType,
        file: values.file,
        release_notes: values.release_notes,
      },
      {
        onSuccess: () => {
          reset()
          resetProgress()
          onClose()
        },
      },
    )
  }

  if (!isOpen) return null

  type ApiError = { response?: { data?: { error?: { detail?: Record<string, string[]> } } } }
  const apiError = (error as ApiError | null)?.response?.data?.error?.detail

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={handleClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-release-modal-title"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="upload-release-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Subir Nuevo Release
            </h2>
            <button
              onClick={handleClose}
              disabled={isUploading}
              aria-label="Cerrar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            {error && !apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-400">
                Error al subir el release. Intenta de nuevo.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Versión <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('version')}
                  type="text"
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.version && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.version.message}
                  </p>
                )}
                {apiError?.version && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {apiError.version[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plataforma <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('platform')}
                  aria-label="Seleccionar plataforma"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                  <option value="linux">Linux</option>
                </select>
                {errors.platform && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.platform.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  App <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('app_type')}
                  aria-label="Seleccionar tipo de app"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="tauri">Tauri Desktop</option>
                  <option value="sidebar">Sidebar Offline</option>
                </select>
                {errors.app_type && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.app_type.message}
                  </p>
                )}
              </div>
            </div>

            <Controller
              name="file"
              control={control}
              render={() => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Archivo <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('release-file-input')?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FileArchive className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-gray-400">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">
                          Arrastra el archivo aquí o{' '}
                          <span className="text-blue-600 dark:text-blue-400">
                            haz clic para seleccionar
                          </span>
                        </p>
                        <p className="text-xs mt-1">.exe, .msi, .dmg — máx 500 MB</p>
                      </div>
                    )}
                    <input
                      id="release-file-input"
                      type="file"
                      accept=".exe,.msi,.dmg"
                      className="sr-only"
                      onChange={handleFileInput}
                    />
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.file.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas del release
              </label>
              <textarea
                {...register('release_notes')}
                rows={3}
                placeholder="Cambios, correcciones, mejoras..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {isUploading && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Subiendo archivo...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || isUploading}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {isUploading
                  ? `Subiendo ${progress}%...`
                  : isPending
                    ? 'Procesando...'
                    : 'Subir Release'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
