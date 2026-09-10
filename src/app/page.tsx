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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const features = [
    {
      icon: '🗺️',
      title: 'Mapa interactivo',
      description: 'Visualiza mascotas perdidas, encontradas y cuidadores en tu zona con pines de colores.',
    },
    {
      icon: '🔔',
      title: 'Notificaciones',
      description: 'Recibí avisos al instante cuando alguien comenta en tus posts.',
    },
    {
      icon: '💬',
      title: 'Comentarios',
      description: 'Coordina búsquedas y comparte pistas con la comunidad.',
    },
    {
      icon: '📸',
      title: 'Fotos',
      description: 'Sumá fotos a tus posts para que sea más fácil identificar a las mascotas.',
    },
    {
      icon: '🐾',
      title: 'Mis mascotas',
      description: 'Creá perfiles de tus mascotas y vinculalos a tus publicaciones.',
    },
    {
      icon: '📍',
      title: 'Ubicación GPS',
      description: 'Detección automática o selección manual en el mapa.',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-hero">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur rounded-full border border-slate-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Comunidad activa en Córdoba</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Encontrá y ayudá <br className="hidden sm:block" />
            a mascotas <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">cerca tuyo</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Una plataforma comunitaria para reportar mascotas perdidas, publicar mascotas encontradas y conectar con cuidadores en tu barrio.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
              Unirme a la comunidad
            </Link>
            <Link href="/login" className="btn btn-secondary px-6 py-3 text-base">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Todo lo que necesitás
          </h2>
          <p className="text-slate-600 text-lg">
            Herramientas simples para que la comunidad se ayude entre sí.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div key={index} className="card card-hover p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="card p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">Cómo funciona</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Creá tu cuenta', description: 'Registrate en segundos con tu email.' },
              { step: '2', title: 'Publicá un post', description: 'Reportá una mascota perdida o encontrada.' },
              { step: '3', title: 'Conectá', description: 'Chateá con la comunidad y ayudá.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Hecho con ❤️ para la comunidad de mascotas de Córdoba
        </p>
      </section>
    </div>
  )
}
