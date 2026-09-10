'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PostWithDetails, Profile } from '@/types'
import { formatDate, getPetEmoji, getPostTypeInfo, POST_TYPES } from '@/lib/utils'

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

type SortOrder = 'newest' | 'oldest'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set()) // vacío = todos
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped')

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
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(username, avatar_url),
          pets:pet_id(name, type, breed, photo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!error && data) setPosts(data as any)
    }
    fetchPosts()
  }, [])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
        const { data } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:author_id(username, avatar_url),
            pets:pet_id(name, type, breed, photo_url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        if (data) setPosts(data as any)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filtrado y ordenamiento
  const filteredPosts = useMemo(() => {
    let out = posts.slice()

    if (activeTypes.size > 0) {
      out = out.filter((p) => activeTypes.has(p.type))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      )
    }

    out.sort((a, b) => {
      const at = new Date(a.created_at).getTime()
      const bt = new Date(b.created_at).getTime()
      return sort === 'newest' ? bt - at : at - bt
    })

    return out
  }, [posts, activeTypes, search, sort])

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const clearFilters = () => {
    setActiveTypes(new Set())
    setSearch('')
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const typeKeys = ['lost', 'found', 'adoption', 'foster', 'sitter_needed', 'emergency']

  // Contadores por tipo (sobre los filtrados por búsqueda para que sea coherente)
  const searchFiltered = search.trim()
    ? posts.filter((p) => {
        const q = search.toLowerCase()
        return (
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
        )
      })
    : posts

  const countByType = (t: string) => searchFiltered.filter((p) => p.type === t).length

  const centerOnPost = (post: PostWithDetails) => {
    setUserLocation([post.latitude, post.longitude])
    setSelectedPostId(post.id)
  }

  const hasFilters = activeTypes.size > 0 || search.trim().length > 0

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

        {/* Layout mapa + panel */}
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
              <div className="h-[420px] sm:h-[520px] lg:h-[720px]">
                <MapView posts={filteredPosts} center={userLocation || undefined} />
              </div>
            </div>
          </div>

          {/* Panel lateral: filtros + secciones */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
            {/* Buscador */}
            <div className="card p-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.15 5.15a7.5 7.5 0 0011.5 11.5z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título, descripción o barrio..."
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Filtros de tipo (multi-select) */}
            <div className="card p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Filtrar por tipo</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {typeKeys.map((t) => {
                  const info = POST_TYPES[t]
                  const isActive = activeTypes.has(t)
                  const count = countByType(t)
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        isActive
                          ? `${info.badgeBg} ${info.badgeText} border-transparent`
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{info.emoji}</span>
                      <span>{info.short}</span>
                      <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-white/60' : 'bg-slate-100'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Toggles de vista y orden */}
            <div className="card p-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide mr-1">Vista</span>
              <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Por tipo
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Lista
                </button>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="ml-auto text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
              >
                <option value="newest">Más nuevos</option>
                <option value="oldest">Más viejos</option>
              </select>
            </div>

            {/* Lista/Secciones */}
            <div className="card overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                <h3 className="text-sm font-semibold text-slate-900">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado' : 'resultados'}
                </h3>
              </div>

              <div className="max-h-[420px] sm:max-h-[520px] lg:max-h-[600px] overflow-y-auto">
                {filteredPosts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-3">
                      🐾
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Sin resultados</p>
                    <p className="text-xs text-slate-600 mb-4">
                      {hasFilters ? 'Probá ajustar los filtros.' : '¡Sé el primero en publicar!'}
                    </p>
                    {!hasFilters && (
                      <Link href="/create-post" className="btn btn-primary text-sm">
                        Crear post
                      </Link>
                    )}
                  </div>
                ) : viewMode === 'grouped' ? (
                  <GroupedList
                    posts={filteredPosts}
                    typeKeys={typeKeys}
                    selectedPostId={selectedPostId}
                    onFocus={centerOnPost}
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredPosts.map((p) => (
                      <PostListItem
                        key={p.id}
                        post={p}
                        selected={selectedPostId === p.id}
                        onFocus={() => centerOnPost(p)}
                      />
                    ))}
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

// Vista agrupada por tipo con secciones colapsables
function GroupedList({
  posts,
  typeKeys,
  selectedPostId,
  onFocus,
}: {
  posts: PostWithDetails[]
  typeKeys: string[]
  selectedPostId: string | null
  onFocus: (p: PostWithDetails) => void
}) {
  return (
    <div>
      {typeKeys.map((type) => {
        const info = POST_TYPES[type]
        const list = posts.filter((p) => p.type === type)
        if (list.length === 0) return null
        return (
          <div key={type}>
            <div className={`flex items-center justify-between px-4 py-2 sticky top-0 z-10 ${info.badgeBg}`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{info.emoji}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${info.badgeText}`}>
                  {info.label}
                </span>
              </div>
              <span className={`text-xs font-semibold ${info.badgeText}`}>{list.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {list.map((p) => (
                <PostListItem
                  key={p.id}
                  post={p}
                  selected={selectedPostId === p.id}
                  onFocus={() => onFocus(p)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
  const info = getPostTypeInfo(post.type)

  return (
    <div
      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
        selected ? 'bg-sky-50/50' : ''
      }`}
      onClick={onFocus}
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
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
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${info.badgeBg} ${info.badgeText} flex-shrink-0`}>
              <span>{info.emoji}</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 mb-1.5">{post.description}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">📍 {post.address || 'Córdoba'}</span>
            <span className="flex-shrink-0 ml-2">{formatDate(post.created_at)}</span>
          </div>
          <div className="mt-1">
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
