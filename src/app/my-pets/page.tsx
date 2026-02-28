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
      await supabase
        .from('pets')
        .update(formData)
        .eq('id', editingPet.id)
    } else {
      await supabase
        .from('pets')
        .insert({ ...formData, owner_id: user?.id })
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
    if (!confirm('Are you sure you want to delete this pet?')) return
    
    await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
    
    fetchPets(user?.id)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <span className="text-xl font-bold">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">My Pets 🐾</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingPet(null)
              setFormData({ name: '', type: 'dog', breed: '', description: '' })
            }}
            className="neo-button neo-button-secondary px-6 py-3"
          >
            {showForm ? 'Cancel' : '+ Add Pet'}
          </button>
        </div>

        {showForm && (
          <div className="neo-card p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingPet ? 'Edit Pet' : 'Add New Pet'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="neo-input w-full"
                    placeholder="Buddy"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Pet['type'] }))}
                    className="neo-input w-full"
                  >
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐱 Cat</option>
                    <option value="bird">🐦 Bird</option>
                    <option value="rabbit">🐰 Rabbit</option>
                    <option value="fish">🐟 Fish</option>
                    <option value="other">🐾 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Breed (optional)</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="neo-input w-full"
                  placeholder="Golden Retriever"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="neo-input w-full h-24"
                  placeholder="Describe your pet..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="neo-button w-full py-3"
              >
                {submitting ? 'Saving...' : editingPet ? 'Update Pet' : 'Add Pet'}
              </button>
            </form>
          </div>
        )}

        {pets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="neo-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getPetEmoji(pet.type)}</span>
                    <div>
                      <h3 className="text-xl font-bold">{pet.name}</h3>
                      {pet.breed && <p className="text-gray-500">{pet.breed}</p>}
                    </div>
                  </div>
                </div>
                {pet.description && (
                  <p className="text-gray-600 mb-4">{pet.description}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  Added {formatDate(pet.created_at)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="neo-button px-4 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="neo-button bg-red-500 text-white px-4 py-2 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="neo-card p-12 text-center">
            <p className="text-xl font-bold text-gray-500 mb-4">No pets yet</p>
            <p className="text-gray-500 mb-6">Add your furry friends to link them to your posts!</p>
            <button
              onClick={() => setShowForm(true)}
              className="neo-button px-6 py-3"
            >
              Add Your First Pet
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
