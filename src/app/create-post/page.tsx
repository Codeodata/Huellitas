'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'

// Coordenadas de Córdoba, Argentina
const CORDOBA_CENTER: [number, number] = [-31.4201, -64.1888]

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-100 rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
    </div>
  ),
})

export default function CreatePostPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)

  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found' | 'sitter_needed' | 'adoption' | 'foster' | 'emergency',
    title: '',
    description: '',
    address: '',
    latitude: CORDOBA_CENTER[0],
    longitude: CORDOBA_CENTER[1],
    contactEmail: '',
    contactPhone: '',
    photoUrl: null as string | null,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router])

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      return
    }

    setGettingLocation(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        setGettingLocation(false)
      },
      () => {
        setError('No se pudo obtener la ubicación. Hacé clic en el mapa para seleccionarla manualmente.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    )
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('Debés iniciar sesión')
      setLoading(false)
      return
    }

    const { data: { user: authUser } } = await supabase.auth.getUser()

    const { error } = await supabase.from('posts').insert({
      author_id: authUser?.id,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
      contact_email: formData.contactEmail || null,
      contact_phone: formData.contactPhone || null,
      photo_url: formData.photoUrl,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const postTypes = [
    {
      value: 'lost',
      title: 'Perdí a mi mascota',
      tagline: 'Se escapó o no la encuentro',
      description: 'Publicá una alerta para que vecinos y voluntarios te ayuden a encontrarla.',
      emoji: '🐕',
      colors: {
        border: 'border-rose-500',
        bg: 'bg-rose-50',
        icon: 'bg-rose-100 text-rose-600',
        ring: 'ring-rose-100',
      },
    },
    {
      value: 'found',
      title: 'Encontré una mascota',
      tagline: 'La vi o la tengo conmigo',
      description: 'Compartila para reconectarla con su familia. Una foto ayuda muchísimo.',
      emoji: '🐶',
      colors: {
        border: 'border-emerald-500',
        bg: 'bg-emerald-50',
        icon: 'bg-emerald-100 text-emerald-600',
        ring: 'ring-emerald-100',
      },
    },
    {
      value: 'adoption',
      title: 'Doy en adopción',
      tagline: 'Busco hogar definitivo',
      description: 'La mascota está lista para una nueva familia. Compartí sus datos y contacto.',
      emoji: '❤️',
      colors: {
        border: 'border-purple-500',
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        ring: 'ring-purple-100',
      },
    },
    {
      value: 'foster',
      title: 'Busco tránsito',
      tagline: 'Hogar temporal para un rescatado',
      description: 'Necesito que alguien reciba a la mascota mientras encuentro adopción definitiva.',
      emoji: '🏡',
      colors: {
        border: 'border-amber-500',
        bg: 'bg-amber-50',
        icon: 'bg-amber-100 text-amber-600',
        ring: 'ring-amber-100',
      },
    },
    {
      value: 'sitter_needed',
      title: 'Necesito un cuidador',
      tagline: 'Alguien que la cuide un tiempo',
      description: 'Busco a alguien de confianza para que cuide a mi mascota mientras estoy afuera.',
      emoji: '🦮',
      colors: {
        border: 'border-sky-500',
        bg: 'bg-sky-50',
        icon: 'bg-sky-100 text-sky-600',
        ring: 'ring-sky-100',
      },
    },
    {
      value: 'emergency',
      title: 'Emergencia veterinaria',
      tagline: 'Mascota lastimada o en riesgo',
      description: 'Necesito ayuda urgente: transporte, contacto veterinario o dinero para atenderla.',
      emoji: '🚨',
      colors: {
        border: 'border-red-500',
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        ring: 'ring-red-100',
      },
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Crear post</h1>
          <p className="text-sm text-slate-600 mt-0.5">Ayudá a tu comunidad a reconectar con sus mascotas</p>
        </div>

        <div className="card p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de post */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">¿Qué querés publicar?</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {postTypes.map((option) => {
                  const isSelected = formData.type === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: option.value as any }))}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? `${option.colors.border} ${option.colors.bg} shadow-sm ring-4 ${option.colors.ring}`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className={`w-11 h-11 rounded-xl ${option.colors.icon} flex items-center justify-center text-xl mb-3`}>
                        {option.emoji}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mb-0.5">{option.title}</div>
                      <div className="text-xs text-slate-500 mb-2">{option.tagline}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{option.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Foto {formData.type === 'found' && <span className="text-sky-600">(recomendado)</span>}
              </label>
              {user && (
                <PhotoUpload
                  value={formData.photoUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, photoUrl: url }))}
                  userId={user.id}
                />
              )}
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder={
                  formData.type === 'lost'
                    ? 'Se perdió mi Golden en Nueva Córdoba'
                    : formData.type === 'found'
                    ? 'Encontré un gato en Cerro de las Rosas'
                    : 'Busco cuidador para el finde'
                }
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="input h-28 resize-none"
                placeholder="Contá los detalles: características de la mascota, dónde/cuándo, cómo contactarte..."
                required
              />
            </div>

            {/* Ubicación */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Ubicación</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="btn btn-secondary text-xs"
                >
                  {gettingLocation ? '📍 Buscando...' : '📍 Usar GPS'}
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-2">
                Hacé clic en el mapa o arrastrá para marcar la ubicación exacta
              </p>

              <div className="h-[300px] mb-3">
                <MapPicker
                  center={[formData.latitude, formData.longitude]}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 mb-3 text-xs text-slate-600 font-mono">
                📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>

              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="input"
                placeholder="Dirección o barrio (opcional)"
              />
            </div>

            {/* Contacto */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Contacto</h3>
              <p className="text-xs text-slate-500 mb-3">
                Cómo quieren contactarte otros usuarios (opcional)
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="input"
                    placeholder="+54 351 1234567"
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Publicando...' : 'Publicar post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
