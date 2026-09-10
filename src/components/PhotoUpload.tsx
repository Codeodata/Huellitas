'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PhotoUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  userId: string
}

export default function PhotoUpload({ value, onChange, userId }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('post-photos').getPublicUrl(fileName)
      onChange(data.publicUrl)
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    // Intentar borrar del storage
    try {
      const path = value.split('/post-photos/')[1]
      if (path) {
        await supabase.storage.from('post-photos').remove([path])
      }
    } catch {
      // Ignorar errores al borrar (podría ser una foto de otro usuario)
    }

    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Foto subida" className="w-full h-64 object-cover" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-white shadow-sm"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-white shadow-sm"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Subiendo...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center text-2xl mx-auto mb-2 transition-colors">
                📷
              </div>
              <p className="text-sm font-medium text-slate-700">Subir foto</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG o WEBP · hasta 5MB</p>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
