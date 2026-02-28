'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { Pet } from '@/types'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-200 flex items-center justify-center border-4 border-black"><span className="font-bold">Loading map...</span></div>
})

export default function CreatePostPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found' | 'sitter_needed',
    title: '',
    description: '',
    petId: '',
    address: '',
    latitude: 40.7128,
    longitude: -74.0060,
    contactEmail: '',
    contactPhone: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
      
      if (petsData) setPets(petsData)
    }
    
    getUser()
  }, [router])

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    
    setGettingLocation(true)
    setError('')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        setGettingLocation(false)
      },
      async () => {
        try {
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          if (data.latitude && data.longitude) {
            setFormData(prev => ({
              ...prev,
              latitude: data.latitude,
              longitude: data.longitude,
            }))
            setGettingLocation(false)
            return
          }
        } catch (e) {
          console.log('IP geolocation failed')
        }
        
        setError('No GPS available. Desktop Macs don\'t have GPS hardware. Click on the map to set your location - that\'s what most users do!')
        setGettingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    )
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { data: { user: authUser } } = await supabase.auth.getUser()

    const { error } = await supabase.from('posts').insert({
      author_id: authUser?.id,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      pet_id: formData.petId || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
      contact_email: formData.contactEmail || null,
      contact_phone: formData.contactPhone || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="neo-card p-8">
          <h1 className="text-3xl font-black mb-6">Create Post 🐾</h1>
          
          {error && (
            <div className="bg-red-100 border-2 border-black p-4 mb-4 font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Post Type</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'lost', label: '🐕 Lost Pet', color: 'bg-red-500' },
                  { value: 'found', label: '✅ Found Pet', color: 'bg-green-500' },
                  { value: 'sitter_needed', label: '🏠 Need Sitter', color: 'bg-blue-500' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: option.value as any }))}
                    className={`neo-button px-4 py-2 ${formData.type === option.value ? option.color : 'opacity-50'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="neo-input w-full"
                placeholder={formData.type === 'lost' ? 'Lost Golden Retriever in Downtown' : 
                             formData.type === 'found' ? 'Found Cat Near Central Park' : 
                             'Need Pet Sitter for Weekend'}
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="neo-input w-full h-32"
                placeholder="Provide details about the pet, location, contact info, etc."
                required
              />
            </div>

            {pets.length > 0 && (
              <div>
                <label className="block font-bold mb-2">Link to Pet (optional)</label>
                <select
                  value={formData.petId}
                  onChange={(e) => setFormData(prev => ({ ...prev, petId: e.target.value }))}
                  className="neo-input w-full"
                >
                  <option value="">Select a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-bold">Location</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="neo-button neo-button-accent px-4 py-2 text-sm"
                >
                  {gettingLocation ? '📍 Getting...' : '📍 Use GPS'}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                📍 Click on the map to set location: <strong>{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</strong>
              </p>
              
              <div className="h-[300px] mb-4">
                <MapPicker 
                  center={[formData.latitude, formData.longitude]} 
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="neo-input w-full"
                placeholder="Address or area name (optional)"
              />
            </div>

            <div className="neo-card p-4 bg-gray-50">
              <h3 className="font-bold mb-4">📞 Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">Other users can reach you through:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="neo-input w-full"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="neo-input w-full"
                    placeholder="+62812345678"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave empty if you prefer to be contacted through comments only.</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="neo-button bg-gray-300 px-6 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="neo-button flex-1 py-3"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
