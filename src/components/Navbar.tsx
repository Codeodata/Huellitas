'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types'
import { formatDate } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      if (user) fetchNotifications(user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchNotifications(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select(`*, from_profile:from_user_id(username)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data as any)
      setUnreadCount(data.filter((n: any) => !n.read).length)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const NavPill = ({
    href,
    icon,
    label,
  }: {
    href: string
    icon: React.ReactNode
    label: string
  }) => (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
        isActive(href)
          ? 'bg-white text-slate-900 shadow-md'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  )

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Huellitas"
              className="w-9 h-9 rounded-xl group-hover:scale-105 transition-transform"
            />
            <span className="text-base sm:text-lg font-bold text-white hidden sm:inline">
              Huellitas
            </span>
          </Link>

          {loading ? (
            <div className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              {/* Barra segmentada oscura */}
              <div className="flex items-center gap-0.5 bg-slate-800 rounded-full p-1 overflow-x-auto ring-1 ring-slate-700/50">
                <NavPill
                  href="/dashboard"
                  label="Inicio"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                />
                <NavPill
                  href="/create-post"
                  label="Nuevo"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />
                <NavPill
                  href="/services"
                  label="Servicios"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                  }
                />
              </div>

              {/* Campana + salir */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
                    aria-label="Notificaciones"
                  >
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <span className="font-semibold text-slate-900">Notificaciones</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                            Marcar todas leídas
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id)
                                router.push(`/post/${notif.post_id}`)
                                setShowDropdown(false)
                              }}
                              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-sky-50/50' : ''}`}
                            >
                              <p className="text-sm text-slate-900 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{formatDate(notif.created_at)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500 text-sm">Sin notificaciones</div>
                        )}
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setShowDropdown(false)}
                        className="block p-3 text-center text-sm font-medium text-sky-600 hover:bg-slate-50 border-t border-slate-100"
                      >
                        Ver todas
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                  aria-label="Salir"
                  title="Salir"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
