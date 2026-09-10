'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/types'
import { formatDate, getInitials } from '@/lib/utils'

interface CommentsProps {
  postId: string
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (data) setComments(data as any)
      setLoading(false)
    }

    fetchComments()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)

    const { data: { user: authUser } } = await supabase.auth.getUser()

    const { data: newCommentData, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: authUser?.id,
        content: newComment.trim(),
      })
      .select()
      .single()

    if (!error && newCommentData) {
      const { data: commentData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(username, avatar_url)
        `)
        .eq('id', newCommentData.id)
        .single()

      if (commentData) setComments([...comments, commentData as any])

      const { data: postData } = await supabase
        .from('posts')
        .select('id, author_id, title')
        .eq('id', postId)
        .single()

      const { data: fromProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authUser?.id)
        .single()

      const commenterName = fromProfile?.username || 'Alguien'

      // Solo notificar al dueño del post (y solo si no está comentando en su propio post)
      if (postData && postData.author_id !== authUser?.id) {
        await supabase.from('notifications').insert({
          user_id: postData.author_id,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: authUser?.id,
          message: `@${commenterName} comentó en tu post "${postData.title}"`,
        })
      }

      setNewComment('')
    }

    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar comentario?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) setComments(comments.filter((c) => c.id !== commentId))
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-slate-500">Cargando comentarios...</div>
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Comentarios ({comments.length})
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full avatar text-sm flex-shrink-0">
                {getInitials(comment.profiles?.username || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-slate-50 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">
                      @{comment.profiles?.username}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.content}</p>
                </div>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-slate-500 hover:text-red-600 mt-1 ml-4"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-4">Aún no hay comentarios. ¡Sé el primero!</p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input h-20 resize-none"
            placeholder="Escribí un comentario..."
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn btn-primary text-sm"
            >
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-600">
          Iniciá sesión para comentar
        </div>
      )}
    </div>
  )
}
