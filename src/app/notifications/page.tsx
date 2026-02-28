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
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    router.push(`/post/${notification.post_id}`)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <span className="text-xl font-bold">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">🔔 Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="neo-button px-4 py-2 text-sm"
            >
              Mark All Read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`neo-card p-4 cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform ${
                  !notification.read ? 'border-l-8 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="neo-card p-8 text-center">
            <p className="text-xl font-bold text-gray-500 mb-4">No notifications yet</p>
            <p className="text-gray-500 mb-6">When someone comments on your posts, you'll see it here.</p>
            <Link href="/dashboard" className="neo-button px-6 py-3">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
