export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other'
  breed: string | null
  description: string | null
  photo_url: string | null
  created_at: string
}

export type PostType = 'lost' | 'found' | 'sitter_needed' | 'adoption' | 'foster' | 'emergency'

export interface Post {
  id: string
  author_id: string
  type: PostType
  pet_id: string | null
  title: string
  description: string
  latitude: number
  longitude: number
  address: string | null
  status: 'active' | 'resolved'
  created_at: string
  contact_email?: string | null
  contact_phone?: string | null
  photo_url?: string | null
  profiles?: Profile
  pets?: Pet
}

export interface PostWithDetails extends Post {
  profile?: Profile
  pet?: Pet
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  parent_id: string | null
  created_at: string
  profiles?: Profile
}

export type ServiceKind = 'offering' | 'seeking'
export type ServiceType = 'grooming' | 'walker' | 'sitter' | 'vet' | 'daycare' | 'trainer'

export interface Service {
  id: string
  author_id: string
  kind: ServiceKind
  service_type: ServiceType
  name: string
  description: string | null
  zone: string | null
  latitude: number | null
  longitude: number | null
  contact_email: string | null
  contact_phone: string | null
  price: string | null
  photo_url: string | null
  created_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'comment' | 'post_created'
  post_id: string
  comment_id?: string
  from_user_id: string
  message: string
  read: boolean
  created_at: string
  from_profile?: Profile
  post?: Post
}
