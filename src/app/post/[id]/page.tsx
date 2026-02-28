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
  loading: () => <div className="h-[300px] bg-gray-200 flex items-center justify-center border-4 border-black"><span className="font-bold">Loading map...</span></div>
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

      if (data) {
        setPost(data as any)
      }
      setLoading(false)
    }

    fetchPost()
  }, [params.id])

  const handleMarkResolved = async () => {
    if (!user || !post) return
    
    const { error } = await supabase
      .from('posts')
      .update({ status: 'resolved' })
      .eq('id', post.id)

    if (!error) {
      setPost({ ...post, status: 'resolved' })
    }
  }

  const handleDelete = async () => {
    if (!user || !post) return
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (!error) {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <span className="text-xl font-bold">Loading...</span>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Post not found</p>
          <button onClick={() => router.back()} className="neo-button">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === post.author_id

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="mb-4 font-bold hover:text-primary"
        >
          ← Back
        </button>

        <div className="neo-card p-8">
          <div className="flex items-start justify-between mb-6">
            <span className={`neo-tag text-lg ${
              post.type === 'lost' ? 'bg-red-500 text-white' : 
              post.type === 'found' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {getPostTypeLabel(post.type)}
            </span>
            <span className="text-gray-500">
              {formatDate(post.created_at)}
            </span>
          </div>

          <h1 className="text-3xl font-black mb-4">{post.title}</h1>
          
          {post.status === 'resolved' && (
            <div className="bg-green-100 border-2 border-black p-4 mb-6 text-center font-bold text-green-600">
              ✓ This issue has been resolved
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            {post.pets && (
              <div className="flex items-center gap-2">
                <span className="text-4xl">{getPetEmoji(post.pets.type)}</span>
                <div>
                  <p className="font-bold text-lg">{post.pets.name}</p>
                  {post.pets.breed && <p className="text-gray-500">{post.pets.breed}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Location</h2>
            <p className="text-gray-600 mb-4">📍 {post.address || 'Location on map'}</p>
            <div className="h-[300px]">
              <MapView posts={[post]} center={[post.latitude, post.longitude]} />
            </div>
          </div>

          {(post.contact_email || post.contact_phone) && (
            <div className="mb-6 neo-card p-4 bg-accent/30">
              <h2 className="font-bold text-lg mb-3">📞 Contact Information</h2>
              <div className="space-y-2">
                {post.contact_email && (
                  <a 
                    href={`mailto:${post.contact_email}`}
                    className="flex items-center gap-2 font-medium hover:text-primary"
                  >
                    📧 {post.contact_email}
                  </a>
                )}
                {post.contact_phone && (
                  <a 
                    href={`https://wa.me/${post.contact_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-medium hover:text-primary"
                  >
                    📱 {post.contact_phone} (WhatsApp)
                  </a>
                )}
              </div>
            </div>
          )}

          <Comments postId={post.id} />

          <div className="flex items-center justify-between pt-6 border-t-2 border-black mt-8">
            <div className="flex items-center gap-2">
              <span className="font-bold">Posted by:</span>
              <span className="text-primary font-bold">@{post.profiles?.username}</span>
            </div>
          </div>

          {isOwner && post.status === 'active' && (
            <div className="flex gap-4 mt-6 pt-6 border-t-2 border-black">
              <button
                onClick={handleMarkResolved}
                className="neo-button bg-green-500 px-6 py-3"
              >
                ✓ Mark as Resolved
              </button>
              <button
                onClick={handleDelete}
                className="neo-button bg-red-500 text-white px-6 py-3"
              >
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
