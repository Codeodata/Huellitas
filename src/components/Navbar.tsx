'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types'
import { formatDate } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
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

  const NavButton = ({ href, color, children, onClick }: { href?: string, color: string, children: React.ReactNode, onClick?: () => void }) => {
    const className = `neo-button ${color} text-white px-3 py-2 text-xs sm:text-sm whitespace-nowrap`
    
    if (href) {
      return (
        <Link href={href} className={className} onClick={() => setShowMobileMenu(false)}>
          {children}
        </Link>
      )
    }
    
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    )
  }

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight hover:text-primary transition-colors">
          🐾 <span className="text-primary">Fur</span>Map
        </Link>

        {/* Mobile menu button */}
        {user && (
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 border-2 border-black"
          >
            <span className="text-xl">{showMobileMenu ? '✕' : '☰'}</span>
          </button>
        )}

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-2">
          {loading ? (
            <span className="text-sm font-medium">Loading...</span>
          ) : user ? (
            <>
              <div className="relative mr-2" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="neo-button bg-yellow-400 px-3 py-2 text-sm"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 neo-card p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gray-50">
                      <span className="font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">
                          Mark all read
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
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                          >
                            <p className="text-sm font-medium line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No notifications yet</div>
                      )}
                    </div>
                    <Link
                      href="/notifications"
                      onClick={() => setShowDropdown(false)}
                      className="block p-3 text-center text-sm font-bold text-primary border-t-2 border-black hover:bg-gray-50"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              <NavButton href="/dashboard" color="bg-blue-500">Dashboard</NavButton>
              <NavButton href="/create-post" color="bg-green-500">Post</NavButton>
              <NavButton href="/my-pets" color="bg-purple-500">My Pets</NavButton>
              <button onClick={handleLogout} className="neo-button bg-gray-500 text-white px-3 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="neo-button bg-gray-500 text-white px-4 py-2 text-sm">
                Login
              </Link>
              <Link href="/register" className="neo-button px-4 py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile nav */}
        {user && showMobileMenu && (
          <div ref={mobileMenuRef} className="absolute top-full left-0 right-0 bg-white border-b-4 border-black p-4 flex flex-col gap-3 lg:hidden">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="neo-button bg-yellow-400 w-full justify-center"
              >
                🔔 Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 w-full neo-card p-0 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id)
                            router.push(`/post/${notif.post_id}`)
                            setShowDropdown(false)
                            setShowMobileMenu(false)
                          }}
                          className={`p-3 border-b border-gray-200 cursor-pointer text-sm ${!notif.read ? 'bg-blue-50' : ''}`}
                        >
                          <p className="line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavButton href="/dashboard" color="bg-blue-500">Dashboard</NavButton>
            <NavButton href="/create-post" color="bg-green-500">Post</NavButton>
            <NavButton href="/my-pets" color="bg-purple-500">My Pets</NavButton>
            <button onClick={handleLogout} className="neo-button bg-gray-500 text-white w-full justify-center">Logout</button>
          </div>
        )}

        {/* Mobile nav - not logged in */}
        {!user && showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b-4 border-black p-4 flex flex-col gap-3 lg:hidden">
            <Link href="/login" className="neo-button bg-gray-500 text-white w-full justify-center" onClick={() => setShowMobileMenu(false)}>
              Login
            </Link>
            <Link href="/register" className="neo-button w-full justify-center" onClick={() => setShowMobileMenu(false)}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
