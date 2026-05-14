import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateReleaseRequest, DesktopRelease } from '../types'

interface UploadState {
  progress: number
  isUploading: boolean
}

export function useUploadRelease() {
  const qc = useQueryClient()
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateReleaseRequest) => {
      const formData = new FormData()
      formData.append('version', data.version)
      formData.append('platform', data.platform)
      formData.append('app_type', data.app_type)
      formData.append('file', data.file)
      if (data.release_notes) {
        formData.append('release_notes', data.release_notes)
      }

      setUploadState({ progress: 0, isUploading: true })

      return apiClient
        .post<DesktopRelease>('/admin/releases/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10 * 60 * 1000,
          onUploadProgress: (event) => {
            if (event.total) {
              const pct = Math.round((event.loaded * 100) / event.total)
              setUploadState({ progress: pct, isUploading: true })
            }
          },
        })
        .then((r) => r.data)
    },
    onSuccess: () => {
      setUploadState({ progress: 100, isUploading: false })
      qc.invalidateQueries({ queryKey: ['admin-releases'] })
    },
    onError: () => {
      setUploadState({ progress: 0, isUploading: false })
    },
  })

  const resetProgress = () => setUploadState({ progress: 0, isUploading: false })

  return {
    ...mutation,
    progress: uploadState.progress,
    isUploading: uploadState.isUploading,
    resetProgress,
  }
}
