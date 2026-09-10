'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types'
import { formatDate } from '@/lib/utils'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchNotifications(user.id)
    }

    checkUser()
  }, [router])

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        from_profile:from_user_id(username),
        post:post_id(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setNotifications(data as any)
    setLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) await markAsRead(notification.id)
    router.push(`/post/${notification.post_id}`)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Estás al día'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary text-sm">
              Marcar todas como leídas
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.read ? 'bg-sky-50/40 border-sky-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.read ? 'bg-sky-100' : 'bg-slate-100'
                  }`}>
                    <span className="text-lg">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(notification.created_at)}</p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🔔
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">Sin notificaciones</p>
            <p className="text-slate-600 mb-6">Cuando alguien comente en tus posts, aparecerá aquí.</p>
            <Link href="/dashboard" className="btn btn-primary">
              Ir al dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
