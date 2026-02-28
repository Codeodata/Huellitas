import Link from 'next/link'
import { PostWithDetails } from '@/types'
import { formatDate, getPetEmoji, getPostTypeLabel } from '@/lib/utils'

interface PostCardProps {
  post: PostWithDetails
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`}>
      <div className="neo-card p-4 hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className={`neo-tag ${
            post.type === 'lost' ? 'bg-red-500 text-white' : 
            post.type === 'found' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {getPostTypeLabel(post.type)}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {formatDate(post.created_at)}
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {post.description}
        </p>
        
        {post.pets && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{getPetEmoji(post.pets.type)}</span>
            <span className="font-medium">{post.pets.name}</span>
            {post.pets.breed && (
              <span className="text-sm text-gray-500">({post.pets.breed})</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            📍 {post.address || 'Location not specified'}
          </span>
          {post.profiles && (
            <span className="font-medium">
              @{post.profiles.username}
            </span>
          )}
        </div>
        
        {post.status === 'resolved' && (
          <div className="mt-3 bg-green-100 border-2 border-black p-2 text-center font-bold text-green-600">
            ✓ RESOLVED
          </div>
        )}
      </div>
    </Link>
  )
}
