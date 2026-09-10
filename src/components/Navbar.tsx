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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      if (user) fetchNotifications(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchNotifications(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        from_profile:from_user_id(username)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data as any)
      setUnreadCount(data.filter((n: any) => !n.read).length)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(href)
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  )

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-lg shadow-sm group-hover:shadow-md transition-shadow">
              🐾
            </div>
            <span className="text-lg font-bold text-slate-900">FurMap</span>
          </Link>

          {/* Mobile menu button */}
          {user && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {loading ? (
              <div className="w-24 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/create-post">Nuevo Post</NavLink>
                <NavLink href="/my-pets">Mis Mascotas</NavLink>

                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Notificaciones"
                  >
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <span className="font-semibold text-slate-900">Notificaciones</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                            Marcar todas como leídas
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
                  className="ml-2 btn btn-ghost"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {user && showMobileMenu && (
          <div ref={mobileMenuRef} className="lg:hidden py-3 border-t border-slate-100 space-y-1 animate-fade-in">
            <NavLink href="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</NavLink>
            <NavLink href="/create-post" onClick={() => setShowMobileMenu(false)}>Nuevo Post</NavLink>
            <NavLink href="/my-pets" onClick={() => setShowMobileMenu(false)}>Mis Mascotas</NavLink>
            <NavLink href="/notifications" onClick={() => setShowMobileMenu(false)}>
              Notificaciones {unreadCount > 0 && <span className="ml-1 badge badge-red">{unreadCount}</span>}
            </NavLink>
            <button
              onClick={() => {
                setShowMobileMenu(false)
                handleLogout()
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        )}

        {!user && showMobileMenu && (
          <div className="lg:hidden py-3 border-t border-slate-100 flex flex-col gap-2 animate-fade-in">
            <Link href="/login" className="btn btn-secondary w-full" onClick={() => setShowMobileMenu(false)}>
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn btn-primary w-full" onClick={() => setShowMobileMenu(false)}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
