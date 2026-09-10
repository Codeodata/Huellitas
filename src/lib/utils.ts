export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

export function getPetEmoji(type: string): string {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    fish: '🐟',
    other: '🐾'
  }
  return emojis[type] || '🐾'
}

// Info central de cada tipo de post
export interface PostTypeInfo {
  label: string
  short: string
  emoji: string
  markerBg: string      // hex color para el pin del mapa
  markerRing: string    // hex color pastel para el aura del pin
  badgeBg: string       // clase tailwind bg pastel
  badgeText: string     // clase tailwind text
  badgeDot: string      // clase tailwind bg del dot
  cardBorder: string    // clase tailwind border activa
  cardBg: string        // clase tailwind bg activo
  cardIcon: string      // clases tailwind icono
  cardRing: string      // clase tailwind ring
}

export const POST_TYPES: Record<string, PostTypeInfo> = {
  lost: {
    label: 'Perdida',
    short: 'Perdida',
    emoji: '🐕',
    markerBg: '#F43F5E',
    markerRing: '#FECDD3',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    badgeDot: 'bg-rose-500',
    cardBorder: 'border-rose-500',
    cardBg: 'bg-rose-50',
    cardIcon: 'bg-rose-100 text-rose-600',
    cardRing: 'ring-rose-100',
  },
  found: {
    label: 'Encontrada',
    short: 'Encontrada',
    emoji: '🐶',
    markerBg: '#10B981',
    markerRing: '#A7F3D0',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    badgeDot: 'bg-emerald-500',
    cardBorder: 'border-emerald-500',
    cardBg: 'bg-emerald-50',
    cardIcon: 'bg-emerald-100 text-emerald-600',
    cardRing: 'ring-emerald-100',
  },
  sitter_needed: {
    label: 'Cuidador',
    short: 'Cuidador',
    emoji: '🦮',
    markerBg: '#0EA5E9',
    markerRing: '#BAE6FD',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
    badgeDot: 'bg-sky-500',
    cardBorder: 'border-sky-500',
    cardBg: 'bg-sky-50',
    cardIcon: 'bg-sky-100 text-sky-600',
    cardRing: 'ring-sky-100',
  },
  adoption: {
    label: 'En adopción',
    short: 'Adopción',
    emoji: '❤️',
    markerBg: '#A855F7',
    markerRing: '#E9D5FF',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    badgeDot: 'bg-purple-500',
    cardBorder: 'border-purple-500',
    cardBg: 'bg-purple-50',
    cardIcon: 'bg-purple-100 text-purple-600',
    cardRing: 'ring-purple-100',
  },
  foster: {
    label: 'Tránsito',
    short: 'Tránsito',
    emoji: '🏡',
    markerBg: '#F59E0B',
    markerRing: '#FDE68A',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    badgeDot: 'bg-amber-500',
    cardBorder: 'border-amber-500',
    cardBg: 'bg-amber-50',
    cardIcon: 'bg-amber-100 text-amber-600',
    cardRing: 'ring-amber-100',
  },
  emergency: {
    label: 'Emergencia',
    short: 'Emergencia',
    emoji: '🚨',
    markerBg: '#DC2626',
    markerRing: '#FCA5A5',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    badgeDot: 'bg-red-600',
    cardBorder: 'border-red-500',
    cardBg: 'bg-red-50',
    cardIcon: 'bg-red-100 text-red-600',
    cardRing: 'ring-red-100',
  },
}

export function getPostTypeInfo(type: string): PostTypeInfo {
  return POST_TYPES[type] || POST_TYPES.lost
}

// Info central de cada tipo de servicio
export interface ServiceTypeInfo {
  label: string
  emoji: string
  badgeBg: string
  badgeText: string
  cardIcon: string
}

export const SERVICE_TYPES: Record<string, ServiceTypeInfo> = {
  grooming: {
    label: 'Peluquería',
    emoji: '✂️',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-700',
    cardIcon: 'bg-pink-100 text-pink-600',
  },
  walker: {
    label: 'Paseador',
    emoji: '🦮',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
    cardIcon: 'bg-sky-100 text-sky-600',
  },
  sitter: {
    label: 'Cuidador',
    emoji: '🏠',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    cardIcon: 'bg-amber-100 text-amber-600',
  },
  vet: {
    label: 'Veterinario',
    emoji: '⚕️',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    cardIcon: 'bg-red-100 text-red-600',
  },
  daycare: {
    label: 'Guardería',
    emoji: '🏡',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    cardIcon: 'bg-emerald-100 text-emerald-600',
  },
  trainer: {
    label: 'Adiestrador',
    emoji: '🎓',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    cardIcon: 'bg-purple-100 text-purple-600',
  },
}

export function getServiceTypeInfo(type: string): ServiceTypeInfo {
  return SERVICE_TYPES[type] || SERVICE_TYPES.walker
}

export function getPostTypeColor(type: string): string {
  return getPostTypeInfo(type).markerBg
}

export function getPostTypeLabel(type: string): string {
  return getPostTypeInfo(type).label
}
