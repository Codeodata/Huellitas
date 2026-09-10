'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/types'
import { formatDate, getInitials } from '@/lib/utils'

interface CommentsProps {
  postId: string
}

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [postAuthorId, setPostAuthorId] = useState<string | null>(null)
  const [postTitle, setPostTitle] = useState<string>('')

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Cargar todos los comentarios (padres y respuestas)
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (commentsData) setComments(commentsData as any)

      // Traer info del post para notificaciones
      const { data: postData } = await supabase
        .from('posts')
        .select('author_id, title')
        .eq('id', postId)
        .single()

      if (postData) {
        setPostAuthorId(postData.author_id)
        setPostTitle(postData.title)
      }

      setLoading(false)
    }

    fetchAll()
  }, [postId])

  // Reorganizar comentarios en árbol (padres con sus respuestas)
  const threaded = useMemo<CommentWithReplies[]>(() => {
    const byId = new Map<string, CommentWithReplies>()
    comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }))

    const roots: CommentWithReplies[] = []
    byId.forEach((c) => {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies.push(c)
      } else {
        roots.push(c)
      }
    })
    return roots
  }, [comments])

  const addComment = async (content: string, parentId: string | null): Promise<Comment | null> => {
    if (!user) return null

    const { data: newCommentData, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
        parent_id: parentId,
      })
      .select()
      .single()

    if (error || !newCommentData) return null

    // Obtener nombre del autor para el mensaje de notificación
    const { data: fromProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const commenterName = fromProfile?.username || 'Alguien'

    // Enviar notificaciones
    const targets = new Set<string>()

    if (parentId) {
      // Es una respuesta a un comentario existente
      const parent = comments.find((c) => c.id === parentId)
      if (parent && parent.author_id !== user.id) {
        // Notificar al autor del comentario padre
        await supabase.from('notifications').insert({
          user_id: parent.author_id,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: user.id,
          message: `@${commenterName} respondió a tu comentario en "${postTitle}"`,
        })
        targets.add(parent.author_id)
      }

      // También notificar al dueño del post (si no es ni el que responde ni el autor del padre)
      if (postAuthorId && postAuthorId !== user.id && !targets.has(postAuthorId)) {
        await supabase.from('notifications').insert({
          user_id: postAuthorId,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: user.id,
          message: `@${commenterName} respondió en tu post "${postTitle}"`,
        })
      }
    } else {
      // Es un comentario raíz — notificar al dueño del post
      if (postAuthorId && postAuthorId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postAuthorId,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: user.id,
          message: `@${commenterName} comentó en tu post "${postTitle}"`,
        })
      }
    }

    // Traer el comentario con datos del profile para agregarlo al estado
    const { data: fullComment } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id(username, avatar_url)
      `)
      .eq('id', newCommentData.id)
      .single()

    return (fullComment as any) || null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    const added = await addComment(newComment, null)
    if (added) {
      setComments((prev) => [...prev, added])
      setNewComment('')
    }
    setSubmitting(false)
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim() || !user) return
    setSubmitting(true)
    const added = await addComment(replyContent, parentId)
    if (added) {
      setComments((prev) => [...prev, added])
      setReplyContent('')
      setReplyingTo(null)
    }
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar comentario?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) {
      // Borrar también las respuestas del estado local
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId))
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-slate-500">Cargando comentarios...</div>
  }

  const totalCount = comments.length

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Comentarios ({totalCount})
      </h3>

      {threaded.length > 0 ? (
        <div className="space-y-4 mb-6">
          {threaded.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              user={user}
              replyingTo={replyingTo}
              replyContent={replyContent}
              submitting={submitting}
              onStartReply={(id) => {
                setReplyingTo(id)
                setReplyContent('')
              }}
              onCancelReply={() => {
                setReplyingTo(null)
                setReplyContent('')
              }}
              onChangeReply={setReplyContent}
              onSubmitReply={handleReplySubmit}
              onDelete={handleDelete}
            />
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

// Item individual (con sus respuestas anidadas)
function CommentItem({
  comment,
  user,
  replyingTo,
  replyContent,
  submitting,
  onStartReply,
  onCancelReply,
  onChangeReply,
  onSubmitReply,
  onDelete,
  isReply = false,
}: {
  comment: CommentWithReplies
  user: any
  replyingTo: string | null
  replyContent: string
  submitting: boolean
  onStartReply: (id: string) => void
  onCancelReply: () => void
  onChangeReply: (content: string) => void
  onSubmitReply: (parentId: string) => void
  onDelete: (id: string) => void
  isReply?: boolean
}) {
  const isReplyingHere = replyingTo === comment.id
  const isOwner = user?.id === comment.author_id

  return (
    <div className={isReply ? '' : ''}>
      <div className="flex gap-3">
        <div className={`avatar flex-shrink-0 ${isReply ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-sm'}`}>
          {getInitials(comment.profiles?.username || 'U')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">
                @{comment.profiles?.username}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Acciones del comentario */}
          <div className="flex items-center gap-3 mt-1 ml-4">
            {user && (
              <button
                onClick={() => (isReplyingHere ? onCancelReply() : onStartReply(comment.id))}
                className="text-xs font-medium text-slate-500 hover:text-sky-600"
              >
                {isReplyingHere ? 'Cancelar' : 'Responder'}
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-slate-500 hover:text-red-600"
              >
                Eliminar
              </button>
            )}
          </div>

          {/* Form de respuesta */}
          {isReplyingHere && (
            <div className="mt-2 ml-4 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => onChangeReply(e.target.value)}
                className="input h-16 resize-none text-sm"
                placeholder={`Responder a @${comment.profiles?.username}...`}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onCancelReply}
                  className="btn btn-secondary text-xs"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                  className="btn btn-primary text-xs"
                  type="button"
                >
                  {submitting ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </div>
          )}

          {/* Respuestas anidadas */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-100">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  user={user}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  submitting={submitting}
                  onStartReply={onStartReply}
                  onCancelReply={onCancelReply}
                  onChangeReply={onChangeReply}
                  onSubmitReply={onSubmitReply}
                  onDelete={onDelete}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
