'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { PostWithDetails, Profile } from '@/types'
import PostCard from '@/components/PostCard'

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center border-4 border-black"><span className="font-bold">Loading map...</span></div>
})

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) setProfile(profile)
      setLoading(false)
    }
    
    getUser()
  }, [router])

  useEffect(() => {
    detectUserLocation()
  }, [])

  const detectUserLocation = async () => {
    if (navigator.geolocation) {
      setDetectingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          setDetectingLocation(false)
        },
        async () => {
          try {
            const response = await fetch('https://ipapi.co/json/')
            const data = await response.json()
            if (data.latitude && data.longitude) {
              setUserLocation([data.latitude, data.longitude])
            }
          } catch (e) {
            console.log('IP geolocation failed')
          }
          setDetectingLocation(false)
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      )
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(username, avatar_url),
          pets:pet_id(name, type, breed, photo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (!error && data) {
        setPosts(data as any)
      }
    }

    fetchPosts()
  }, [filter])

  useEffect(() => {
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        const fetchPosts = async () => {
          let query = supabase
            .from('posts')
            .select(`
              *,
              profiles:author_id(username, avatar_url),
              pets:pet_id(name, type, breed, photo_url)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
  
          if (filter !== 'all') {
            query = query.eq('type', filter)
          }
  
          const { data } = await query
          if (data) setPosts(data as any)
        }
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <span className="text-xl font-bold">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-black mb-2">
            Welcome back, {profile?.username || 'Pet Parent'}! 🐾
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Check out what&apos;s happening in your neighborhood</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'lost', 'found', 'sitter_needed'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`neo-button px-2 sm:px-4 py-2 text-xs sm:text-sm ${
                  filter === type ? '' : 'opacity-50'
                } ${
                  type === 'lost' ? 'bg-red-500' :
                  type === 'found' ? 'bg-green-500' :
                  type === 'sitter_needed' ? 'bg-blue-500' : ''
                }`}
              >
                {type === 'all' ? '📋 All' : 
                 type === 'lost' ? '🐕 Lost' :
                 type === 'found' ? '✅ Found' : '🏠 Sitter'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`neo-button px-3 sm:px-4 py-2 text-xs sm:text-sm ${viewMode === 'map' ? '' : 'opacity-50'}`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`neo-button px-3 sm:px-4 py-2 text-xs sm:text-sm ${viewMode === 'list' ? '' : 'opacity-50'}`}
            >
              📝 List
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="relative">
            <button
              onClick={detectUserLocation}
              disabled={detectingLocation}
              className="neo-button neo-button-accent absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] px-2 sm:px-4 py-2 text-xs sm:text-sm"
              style={{ zIndex: 1000 }}
            >
              {detectingLocation ? '📍 Getting...' : '📍 My Location'}
            </button>
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-none">
              <MapView 
                posts={posts} 
                center={userLocation || undefined} 
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl font-bold text-gray-500">No posts yet</p>
                <p className="text-gray-500">Be the first to create a post!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
