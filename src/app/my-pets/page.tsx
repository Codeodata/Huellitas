'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Página deprecada: redirigimos a /services
export default function MyPetsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/services')
  }, [router])

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )
}
