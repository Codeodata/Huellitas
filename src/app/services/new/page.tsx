'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'
import { ServiceKind, ServiceType } from '@/types'
import { SERVICE_TYPES } from '@/lib/utils'

export default function NewServicePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    kind: 'offering' as ServiceKind,
    serviceType: 'walker' as ServiceType,
    name: '',
    description: '',
    zone: '',
    contactEmail: '',
    contactPhone: '',
    price: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('Debés iniciar sesión')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('services').insert({
      author_id: user.id,
      kind: formData.kind,
      service_type: formData.serviceType,
      name: formData.name,
      description: formData.description || null,
      zone: formData.zone || null,
      contact_email: formData.contactEmail || null,
      contact_phone: formData.contactPhone || null,
      price: formData.price || null,
      photo_url: formData.photoUrl,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/services')
    }
  }

  const typeKeys = Object.keys(SERVICE_TYPES) as ServiceType[]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Publicar servicio</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Ofrecé un servicio o pedí ayuda con el cuidado de tu mascota
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kind: ofrece / busca */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">¿Qué querés hacer?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, kind: 'offering' }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.kind === 'offering'
                      ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-2">💼</div>
                  <div className="text-sm font-semibold text-slate-900">Ofrezco un servicio</div>
                  <div className="text-xs text-slate-500 mt-0.5">Soy prestador y busco clientes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, kind: 'seeking' }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.kind === 'seeking'
                      ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-2">🔎</div>
                  <div className="text-sm font-semibold text-slate-900">Busco un servicio</div>
                  <div className="text-xs text-slate-500 mt-0.5">Necesito contratar a alguien</div>
                </button>
              </div>
            </div>

            {/* Tipo de servicio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de servicio</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {typeKeys.map((t) => {
                  const info = SERVICE_TYPES[t]
                  const isActive = formData.serviceType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, serviceType: t }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        isActive
                          ? `border-slate-900 ${info.badgeBg} shadow-sm`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{info.emoji}</div>
                      <div className="text-xs font-semibold text-slate-900">{info.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Foto (opcional)</label>
              {user && (
                <PhotoUpload
                  value={formData.photoUrl}
                  onChange={(url) => setFormData((p) => ({ ...p, photoUrl: url }))}
                  userId={user.id}
                />
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {formData.kind === 'offering' ? 'Nombre del servicio / negocio' : 'Título del pedido'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="input"
                placeholder={
                  formData.kind === 'offering'
                    ? 'Ej: Peluquería Canina Firulais'
                    : 'Ej: Necesito paseador 2 veces por semana'
                }
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="input h-28 resize-none"
                placeholder="Contá los detalles: experiencia, horarios, requisitos, tipo de mascota..."
              />
            </div>

            {/* Zona y precio */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Zona</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData((p) => ({ ...p, zone: e.target.value }))}
                  className="input"
                  placeholder="Ej: Nueva Córdoba, Villa Belgrano..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio (opcional)</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  className="input"
                  placeholder="Ej: $5.000 por paseo"
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Contacto</h3>
              <p className="text-xs text-slate-500 mb-3">Cómo pueden comunicarse con vos</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                    className="input"
                    placeholder="+54 351 1234567"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'Publicando...' : 'Publicar servicio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
