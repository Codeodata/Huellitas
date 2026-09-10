'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PostWithDetails, Profile } from '@/types'
import { formatDate, getPetEmoji, getPostTypeLabel } from '@/lib/utils'

// Coordenadas de Córdoba, Argentina
const CORDOBA_CENTER: [number, number] = [-31.4201, -64.1888]

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm text-slate-600">Cargando mapa...</span>
      </div>
    </div>
  ),
})

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

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

  const detectUserLocation = () => {
    if (!navigator.geolocation) return
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setDetectingLocation(false)
      },
      () => {
        setUserLocation(CORDOBA_CENTER)
        setDetectingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
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
      if (!error && data) setPosts(data as any)
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

          if (filter !== 'all') query = query.eq('type', filter)

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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const filters = [
    { value: 'all', label: 'Todos', dot: 'bg-slate-400' },
    { value: 'lost', label: 'Perdidas', dot: 'bg-rose-500' },
    { value: 'found', label: 'Encontradas', dot: 'bg-emerald-500' },
    { value: 'sitter_needed', label: 'Cuidador', dot: 'bg-sky-500' },
  ]

  const stats = {
    lost: posts.filter((p) => p.type === 'lost').length,
    found: posts.filter((p) => p.type === 'found').length,
    sitter: posts.filter((p) => p.type === 'sitter_needed').length,
  }

  // Coordenadas al hacer click en un post de la lista
  const centerOnPost = (post: PostWithDetails) => {
    setUserLocation([post.latitude, post.longitude])
    setSelectedPostId(post.id)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Hola, {profile?.username || 'amigo'} 👋
            </h1>
            <p className="text-slate-600 mt-1">Comunidad de Córdoba</p>
          </div>
          <Link href="/create-post" className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.lost}</p>
                <p className="text-xs text-slate-500">Perdidas</p>
              </div>
            </div>
          </div>
          <div className="card p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.found}</p>
                <p className="text-xs text-slate-500">Encontradas</p>
              </div>
            </div>
          </div>
          <div className="card p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.sitter}</p>
                <p className="text-xs text-slate-500">Cuidador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`filter-pill whitespace-nowrap flex items-center gap-2 ${filter === f.value ? 'active' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full ${f.dot}`} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Layout mapa + lista */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Mapa */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="relative">
              <button
                onClick={detectUserLocation}
                disabled={detectingLocation}
                className="absolute top-3 right-3 z-[400] btn btn-secondary shadow-md text-xs"
              >
                {detectingLocation ? '📍 Buscando...' : '📍 Mi ubicación'}
              </button>
              <div className="h-[420px] sm:h-[520px] lg:h-[640px]">
                <MapView posts={posts} center={userLocation || undefined} />
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                <h3 className="text-sm font-semibold text-slate-900">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </h3>
                <span className="text-xs text-slate-500">Ordenado por fecha</span>
              </div>

              <div className="max-h-[420px] sm:max-h-[520px] lg:max-h-[640px] overflow-y-auto">
                {posts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {posts.map((post) => (
                      <PostListItem
                        key={post.id}
                        post={post}
                        selected={selectedPostId === post.id}
                        onFocus={() => centerOnPost(post)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-3">
                      🐾
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Aún no hay posts</p>
                    <p className="text-xs text-slate-600 mb-4">¡Sé el primero en publicar!</p>
                    <Link href="/create-post" className="btn btn-primary text-sm">
                      Crear post
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Item compacto de la lista lateral
function PostListItem({
  post,
  selected,
  onFocus,
}: {
  post: PostWithDetails & { photo_url?: string | null }
  selected: boolean
  onFocus: () => void
}) {
  const photoUrl = (post as any).photo_url || post.pets?.photo_url

  const typeColor =
    post.type === 'lost'
      ? { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' }
      : post.type === 'found'
      ? { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
      : { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' }

  return (
    <div
      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
        selected ? 'bg-sky-50/50' : ''
      }`}
      onClick={onFocus}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {post.pets ? getPetEmoji(post.pets.type) : '🐾'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{post.title}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColor.bg} ${typeColor.text} flex-shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
              {getPostTypeLabel(post.type)}
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 mb-1.5">{post.description}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">📍 {post.address || 'Córdoba'}</span>
            <span className="flex-shrink-0 ml-2">{formatDate(post.created_at)}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Link
              href={`/post/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Ver detalles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
