'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { PostWithDetails } from '@/types'
import { formatDate, getPetEmoji, getPostTypeLabel } from '@/lib/utils'
import Comments from '@/components/Comments'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-100 rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
    </div>
  ),
})

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(username, avatar_url),
          pets:pet_id(name, type, breed, description, photo_url)
        `)
        .eq('id', params.id)
        .single()

      if (data) setPost(data as any)
      setLoading(false)
    }

    fetchPost()
  }, [params.id])

  const handleMarkResolved = async () => {
    if (!user || !post) return
    const { error } = await supabase.from('posts').update({ status: 'resolved' }).eq('id', post.id)
    if (!error) setPost({ ...post, status: 'resolved' })
  }

  const handleDelete = async () => {
    if (!user || !post) return
    if (!confirm('¿Eliminar este post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-4">Post no encontrado</p>
          <button onClick={() => router.back()} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === post.author_id
  const photoUrl = (post as any).photo_url || post.pets?.photo_url

  const badgeClass =
    post.type === 'lost'
      ? 'badge-red'
      : post.type === 'found'
      ? 'badge-green'
      : 'badge-blue'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="card overflow-hidden">
          {/* Foto */}
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={post.title} className="w-full h-64 sm:h-80 object-cover" />
          )}

          <div className="p-6 sm:p-8">
            {/* Meta */}
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${badgeClass}`}>{getPostTypeLabel(post.type)}</span>
              <span className="text-sm text-slate-500">{formatDate(post.created_at)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{post.title}</h1>

            <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
              <div className="w-6 h-6 rounded-full avatar text-xs">
                {(post.profiles?.username || 'U')[0].toUpperCase()}
              </div>
              <span>@{post.profiles?.username}</span>
            </div>

            {post.status === 'resolved' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 mb-6 text-center font-medium text-sm">
                ✓ Este post ya fue resuelto
              </div>
            )}

            {post.pets && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-6">
                <span className="text-3xl">{getPetEmoji(post.pets.type)}</span>
                <div>
                  <p className="font-semibold text-slate-900">{post.pets.name}</p>
                  {post.pets.breed && <p className="text-sm text-slate-500">{post.pets.breed}</p>}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción</h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Ubicación</h2>
              <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {post.address || `${post.latitude.toFixed(4)}, ${post.longitude.toFixed(4)}`}
              </p>
              <div className="h-[300px]">
                <MapView posts={[post]} center={[post.latitude, post.longitude]} />
              </div>
            </div>

            {(post.contact_email || post.contact_phone) && (
              <div className="p-4 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl border border-sky-100 mb-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Contacto</h2>
                <div className="space-y-2">
                  {post.contact_email && (
                    <a
                      href={`mailto:${post.contact_email}`}
                      className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600 transition-colors"
                    >
                      📧 {post.contact_email}
                    </a>
                  )}
                  {post.contact_phone && (
                    <a
                      href={`https://wa.me/${post.contact_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600 transition-colors"
                    >
                      📱 {post.contact_phone} (WhatsApp)
                    </a>
                  )}
                </div>
              </div>
            )}

            {isOwner && post.status === 'active' && (
              <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-slate-100">
                <button onClick={handleMarkResolved} className="btn btn-success">
                  ✓ Marcar como resuelto
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Eliminar post
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Comments postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
