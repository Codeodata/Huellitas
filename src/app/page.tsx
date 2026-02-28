'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <span className="text-xl font-bold">Loading...</span>
      </div>
    )
  }

  const features = [
    {
      icon: '🗺️',
      title: 'Interactive Map',
      description: 'See all posts on a map with color-coded pins. Find lost pets, found animals, and pet sitters near you.'
    },
    {
      icon: '🔔',
      title: 'Real-time Notifications',
      description: 'Get instant notifications when someone comments on your posts. Never miss an update!'
    },
    {
      icon: '💬',
      title: 'Community Comments',
      description: 'Discuss and help each other. Comment on posts to coordinate searches and share information.'
    },
    {
      icon: '📞',
      title: 'Direct Contact',
      description: 'Post owners can share contact info. Connect directly via email or WhatsApp.'
    },
    {
      icon: '🐾',
      title: 'My Pets',
      description: 'Create profiles for your furry friends. Link them to your posts for better visibility.'
    },
    {
      icon: '📍',
      title: 'GPS Location',
      description: 'One-click location detection. Click on the map or use GPS to set your exact position.'
    }
  ]

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">
            🐾 <span className="text-primary">Fur</span>Map
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto">
            Your neighborhood&apos;s pet community platform
          </p>
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            Connect with pet owners, find lost pets, help found animals, and discover trusted pet sitters in your area.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="neo-card p-6 text-center hover:translate-x-1 hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/register" 
            className="neo-button bg-primary text-white inline-block px-8 py-4 text-lg text-center"
          >
            Join the Community 🐾
          </Link>
          <Link 
            href="/login" 
            className="neo-button inline-block px-8 py-4 text-lg text-center"
          >
            Login
          </Link>
        </div>

        <div className="mt-8 sm:mt-16 neo-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="neo-tag bg-accent inline-block mb-3">1</div>
              <h3 className="font-bold mb-2">Create Account</h3>
              <p className="text-gray-600 text-sm">Sign up and set up your profile</p>
            </div>
            <div className="text-center">
              <div className="neo-tag bg-accent inline-block mb-3">2</div>
              <h3 className="font-bold mb-2">Add Your Pets</h3>
              <p className="text-gray-600 text-sm">Create profiles for your furry friends</p>
            </div>
            <div className="text-center">
              <div className="neo-tag bg-accent inline-block mb-3">3</div>
              <h3 className="font-bold mb-2">Post & Connect</h3>
              <p className="text-gray-600 text-sm">Create lost/found posts or find pet sitters</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="https://github.com/depapp/furmap" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neo-button inline-flex items-center gap-2 px-6 py-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Licensed under MIT License • Free to use • Built with ❤️ for pets everywhere
        </p>
      </div>
    </div>
  )
}
