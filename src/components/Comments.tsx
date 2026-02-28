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

    const { data: newCommentData, error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: authUser?.id,
      content: newComment.trim(),
    }).select().single()

    if (!error && newCommentData) {
      // Fetch the comment with author info
      const { data: commentData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(username, avatar_url)
        `)
        .eq('id', newCommentData.id)
        .single()

      if (commentData) {
        setComments([...comments, commentData as any])
      }

      // Get post info to find the owner
      const { data: postData } = await supabase
        .from('posts')
        .select('id, author_id, title')
        .eq('id', postId)
        .single()

      // Get commenter's profile
      const { data: fromProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authUser?.id)
        .single()

      const commenterName = fromProfile?.username || 'Someone'
      const notificationsToCreate: any[] = []

      // Notify post owner (if not commenting on own post)
      if (postData && postData.author_id !== authUser?.id) {
        notificationsToCreate.push({
          user_id: postData.author_id,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: authUser?.id,
          message: `@${commenterName} commented on your post "${postData.title}"`,
        })
      }

      // Get all users who commented on this post (unique, excluding current user)
      const { data: existingComments } = await supabase
        .from('comments')
        .select('author_id')
        .eq('post_id', postId)

      const uniqueCommenterIds = [...new Set(existingComments?.map(c => c.author_id) || [])]
        .filter(id => id !== authUser?.id && id !== postData?.author_id)

      // Notify other commenters
      for (const commenterId of uniqueCommenterIds) {
        notificationsToCreate.push({
          user_id: commenterId,
          type: 'comment',
          post_id: postId,
          comment_id: newCommentData.id,
          from_user_id: authUser?.id,
          message: `@${commenterName} also commented on "${postData?.title}"`,
        })
      }

      // Create all notifications
      if (notificationsToCreate.length > 0) {
        await supabase.from('notifications').insert(notificationsToCreate)
      }

      setNewComment('')
    }

    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (!error) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">💬 Comments ({comments.length})</h3>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="neo-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-white font-bold flex items-center justify-center text-sm">
                    {getInitials(comment.profiles?.username || 'U')}
                  </div>
                  <span className="font-bold">@{comment.profiles?.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No comments yet. Be the first to comment!</p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="neo-input w-full h-24"
            placeholder="Write a comment..."
            required
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="neo-button px-6 py-2"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="neo-card p-4 text-center bg-gray-50">
          <p className="text-gray-600">Please login to comment</p>
        </div>
      )}
    </div>
  )
}
