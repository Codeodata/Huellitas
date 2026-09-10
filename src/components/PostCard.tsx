import Link from 'next/link'
import { PostWithDetails } from '@/types'
import { formatDate, getPetEmoji, getPostTypeLabel } from '@/lib/utils'

interface PostCardProps {
  post: PostWithDetails & { photo_url?: string | null }
}

export default function PostCard({ post }: PostCardProps) {
  const photoUrl = (post as any).photo_url || post.pets?.photo_url

  const badgeClass =
    post.type === 'lost'
      ? 'badge-red'
      : post.type === 'found'
      ? 'badge-green'
      : 'badge-blue'

  return (
    <Link href={`/post/${post.id}`}>
      <div className="card card-hover overflow-hidden group h-full flex flex-col">
        {/* Foto o placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {post.pets ? getPetEmoji(post.pets.type) : '🐾'}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`badge ${badgeClass}`}>{getPostTypeLabel(post.type)}</span>
          </div>
          {post.status === 'resolved' && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-green">✓ Resuelto</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">{post.description}</p>

          {post.pets && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="text-lg">{getPetEmoji(post.pets.type)}</span>
              <span className="font-medium text-slate-700">{post.pets.name}</span>
              {post.pets.breed && (
                <span className="text-slate-500">· {post.pets.breed}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {post.address || 'Córdoba'}
            </span>
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
