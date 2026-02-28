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

export function getPostTypeColor(type: string): string {
  const colors: Record<string, string> = {
    lost: 'bg-red-500',
    found: 'bg-green-500',
    sitter_needed: 'bg-blue-500'
  }
  return colors[type] || 'bg-gray-500'
}

export function getPostTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    lost: 'LOST',
    found: 'FOUND',
    sitter_needed: 'SITTER NEEDED'
  }
  return labels[type] || type
}
