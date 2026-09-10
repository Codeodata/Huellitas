'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Pet } from '@/types'
import { getPetEmoji, formatDate } from '@/lib/utils'

export default function MyPetsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as Pet['type'],
    breed: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchPets(user.id)
    }
    getUser()
  }, [router])

  const fetchPets = async (userId: string) => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (data) setPets(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (editingPet) {
      await supabase.from('pets').update(formData).eq('id', editingPet.id)
    } else {
      await supabase.from('pets').insert({ ...formData, owner_id: user?.id })
    }

    setFormData({ name: '', type: 'dog', breed: '', description: '' })
    setShowForm(false)
    setEditingPet(null)
    fetchPets(user?.id)
    setSubmitting(false)
  }

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet)
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      description: pet.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (petId: string) => {
    if (!confirm('¿Eliminar esta mascota?')) return
    await supabase.from('pets').delete().eq('id', petId)
    fetchPets(user?.id)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const petTypes: { value: Pet['type']; label: string; emoji: string }[] = [
    { value: 'dog', label: 'Perro', emoji: '🐕' },
    { value: 'cat', label: 'Gato', emoji: '🐱' },
    { value: 'bird', label: 'Pájaro', emoji: '🐦' },
    { value: 'rabbit', label: 'Conejo', emoji: '🐰' },
    { value: 'fish', label: 'Pez', emoji: '🐟' },
    { value: 'other', label: 'Otro', emoji: '🐾' },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis mascotas</h1>
            <p className="text-sm text-slate-600 mt-0.5">Gestioná los perfiles de tus mascotas</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingPet(null)
              setFormData({ name: '', type: 'dog', breed: '', description: '' })
            }}
            className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}
          >
            {showForm ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editingPet ? 'Editar mascota' : 'Nueva mascota'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Firulais"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Pet['type'] }))}
                    className="input"
                  >
                    {petTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.emoji} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Raza (opcional)</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, breed: e.target.value }))}
                  className="input"
                  placeholder="Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="input h-24 resize-none"
                  placeholder="Contanos sobre tu mascota..."
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'Guardando...' : editingPet ? 'Actualizar' : 'Agregar mascota'}
              </button>
            </form>
          </div>
        )}

        {pets.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="card p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {getPetEmoji(pet.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">{pet.name}</h3>
                    {pet.breed && <p className="text-sm text-slate-500">{pet.breed}</p>}
                    <p className="text-xs text-slate-400 mt-1">Agregada {formatDate(pet.created_at)}</p>
                  </div>
                </div>
                {pet.description && (
                  <p className="text-sm text-slate-600 mb-4">{pet.description}</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pet)} className="btn btn-secondary text-sm flex-1">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(pet.id)} className="btn btn-danger text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🐾
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">Todavía no tenés mascotas</p>
            <p className="text-slate-600 mb-6">Agregá a tus mascotas para vincularlas a tus posts.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Agregar mi primera mascota
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
