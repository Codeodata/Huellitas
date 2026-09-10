'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Service, ServiceKind } from '@/types'
import { formatDate, SERVICE_TYPES, getServiceTypeInfo, getInitials } from '@/lib/utils'

export default function ServicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [kindFilter, setKindFilter] = useState<'all' | ServiceKind>('all')
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router])

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`*, profiles:author_id(username, avatar_url)`)
        .order('created_at', { ascending: false })
      if (!error && data) setServices(data as any)
      setLoading(false)
    }
    fetchServices()
  }, [])

  const filtered = useMemo(() => {
    let out = services.slice()
    if (kindFilter !== 'all') out = out.filter((s) => s.kind === kindFilter)
    if (activeTypes.size > 0) out = out.filter((s) => activeTypes.has(s.service_type))
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.zone?.toLowerCase().includes(q)
      )
    }
    return out
  }, [services, kindFilter, activeTypes, search])

  const toggleType = (t: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const hasFilters = kindFilter !== 'all' || activeTypes.size > 0 || search.trim().length > 0

  const clearFilters = () => {
    setKindFilter('all')
    setActiveTypes(new Set())
    setSearch('')
  }

  const typeKeys = Object.keys(SERVICE_TYPES)
  const countByType = (t: string) => services.filter((s) => s.service_type === t).length
  const offeringCount = services.filter((s) => s.kind === 'offering').length
  const seekingCount = services.filter((s) => s.kind === 'seeking').length

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-hero border-b border-slate-200">
        {/* Blobs decorativos */}
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 backdrop-blur rounded-full border border-slate-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-slate-700">Directorio comunitario</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
                Servicios para <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">tu mascota</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl">
                Peluqueros, paseadores, cuidadores, veterinarios y más — todo en un solo lugar
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{services.length}</p>
                  <p className="text-xs text-slate-500">Publicaciones</p>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{offeringCount}</p>
                  <p className="text-xs text-slate-500">Ofrecen servicios</p>
                </div>
                <div className="h-8 w-px bg-slate-300" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{seekingCount}</p>
                  <p className="text-xs text-slate-500">Buscan servicios</p>
                </div>
              </div>
            </div>

            <Link href="/services/new" className="btn btn-primary shadow-md whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publicar servicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Categorías visuales (solo si no hay filtros aún) */}
        {!hasFilters && !loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Explorá por categoría
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {typeKeys.map((t) => {
                const info = SERVICE_TYPES[t]
                const count = countByType(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className="group card card-hover p-3 sm:p-4 text-center transition-all"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${info.badgeBg} flex items-center justify-center text-xl sm:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      {info.emoji}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{info.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {count === 0 ? '—' : count === 1 ? '1 servicio' : `${count} servicios`}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="card p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.15 5.15a7.5 7.5 0 0011.5 11.5z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, descripción o zona..."
                className="input pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Toggle Ofrecen / Buscan */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(
                [
                  { value: 'all', label: 'Todos', icon: '📋' },
                  { value: 'offering', label: 'Ofrecen', icon: '💼' },
                  { value: 'seeking', label: 'Buscan', icon: '🔎' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setKindFilter(opt.value as any)}
                  className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    kindFilter === opt.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chips de tipos activos (aparecen al filtrar) */}
          {(activeTypes.size > 0 || kindFilter !== 'all' || search) && (
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Filtros activos:
              </span>
              {search && (
                <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />
              )}
              {kindFilter !== 'all' && (
                <FilterChip
                  label={kindFilter === 'offering' ? 'Ofrecen' : 'Buscan'}
                  onRemove={() => setKindFilter('all')}
                />
              )}
              {Array.from(activeTypes).map((t) => (
                <FilterChip
                  key={t}
                  label={SERVICE_TYPES[t].label}
                  emoji={SERVICE_TYPES[t].emoji}
                  onRemove={() => toggleType(t)}
                />
              ))}
              <button onClick={clearFilters} className="ml-auto text-xs text-sky-600 hover:text-sky-700 font-medium">
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* Pills de filtro rápido por tipo (siempre visibles) */}
        <div className="flex items-center gap-1.5 flex-wrap mb-6">
          {typeKeys.map((t) => {
            const info = SERVICE_TYPES[t]
            const isActive = activeTypes.has(t)
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? `${info.badgeBg} ${info.badgeText} border-transparent shadow-sm`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </button>
            )
          })}
        </div>

        {/* Header de resultados */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'resultado' : 'resultados'}
              {hasFilters && (
                <span className="text-slate-400 ml-1">de {services.length} totales</span>
              )}
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasData={services.length > 0}
            onClear={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Chip de filtro activo con botón de quitar
function FilterChip({ label, emoji, onRemove }: { label: string; emoji?: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 text-white rounded-full text-xs font-medium">
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        aria-label="Quitar filtro"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="h-40 bg-slate-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse" />
          <div className="flex-1 h-3 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasData, onClear }: { hasData: boolean; onClear: () => void }) {
  return (
    <div className="card p-12 text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100" />
        <div className="relative w-full h-full flex items-center justify-center text-4xl">
          {hasData ? '🔍' : '🐾'}
        </div>
      </div>
      <p className="text-lg font-semibold text-slate-900 mb-2">
        {hasData ? 'Sin resultados con esos filtros' : 'Aún no hay servicios publicados'}
      </p>
      <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm">
        {hasData
          ? 'Probá quitar algún filtro o cambiar los términos de búsqueda.'
          : 'Sé el primero en publicar. Podés ofrecer un servicio o pedir ayuda para el cuidado de tu mascota.'}
      </p>
      {hasData ? (
        <button onClick={onClear} className="btn btn-secondary">
          Limpiar filtros
        </button>
      ) : (
        <Link href="/services/new" className="btn btn-primary">
          Publicar el primer servicio
        </Link>
      )}
    </div>
  )
}

function ServiceCard({ service, currentUserId }: { service: Service; currentUserId?: string }) {
  const info = getServiceTypeInfo(service.service_type)
  const isOwner = service.author_id === currentUserId
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('¿Eliminar este servicio?')) return
    setDeleting(true)
    const { error } = await supabase.from('services').delete().eq('id', service.id)
    if (!error) window.location.reload()
    else setDeleting(false)
  }

  const kindLabel = service.kind === 'offering' ? 'Ofrece' : 'Busca'
  const kindClass =
    service.kind === 'offering'
      ? 'bg-emerald-500 text-white'
      : 'bg-purple-500 text-white'
  const kindIcon = service.kind === 'offering' ? '💼' : '🔎'

  return (
    <article className="card card-hover overflow-hidden flex flex-col group relative">
      {/* Ribbon superior de tipo */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${info.badgeBg.replace('bg-', 'bg-').replace('100', '500')}`} style={{
        backgroundColor: info.badgeText.includes('pink') ? '#EC4899' :
                         info.badgeText.includes('sky') ? '#0EA5E9' :
                         info.badgeText.includes('amber') ? '#F59E0B' :
                         info.badgeText.includes('red') ? '#EF4444' :
                         info.badgeText.includes('emerald') ? '#10B981' :
                         info.badgeText.includes('purple') ? '#A855F7' : '#0EA5E9'
      }} />

      {/* Header con foto o icono */}
      <div className="relative">
        {service.photo_url ? (
          <div className="relative h-44 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.photo_url}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ) : (
          <div className={`h-44 ${info.badgeBg} flex items-center justify-center relative overflow-hidden`}>
            <span className="text-6xl opacity-70 group-hover:scale-110 transition-transform duration-500">
              {info.emoji}
            </span>
            {/* Patrón decorativo */}
            <div className="absolute top-4 left-4 text-3xl opacity-20">{info.emoji}</div>
            <div className="absolute bottom-6 right-6 text-4xl opacity-15">{info.emoji}</div>
          </div>
        )}

        {/* Badge de tipo (flotante abajo-izquierda) */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white/95 backdrop-blur shadow-sm ${info.badgeText}`}>
            <span>{info.emoji}</span>
            {info.label}
          </span>
        </div>

        {/* Badge de kind (flotante arriba-derecha) */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${kindClass} shadow-sm`}>
            <span>{kindIcon}</span>
            {kindLabel}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
          {service.name}
        </h3>
        {service.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-1.5 text-xs mb-3">
          {service.zone && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{service.zone}</span>
            </div>
          )}
          {service.price && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate font-semibold text-slate-800">{service.price}</span>
            </div>
          )}
        </div>

        {/* Autor + fecha */}
        <div className="flex items-center gap-2 pt-3 mt-auto border-t border-slate-100">
          <div className="avatar w-7 h-7 text-[11px] flex-shrink-0">
            {getInitials(service.profiles?.username || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              @{service.profiles?.username || 'usuario'}
            </p>
            <p className="text-[10px] text-slate-500">{formatDate(service.created_at)}</p>
          </div>
        </div>

        {/* Botones de contacto */}
        {(service.contact_email || service.contact_phone) && (
          <div className="flex gap-2 mt-3">
            {service.contact_phone && (
              <a
                href={`https://wa.me/${service.contact_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
            {service.contact_email && (
              <a
                href={`mailto:${service.contact_email}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
          </div>
        )}

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-2 text-[11px] text-red-600 hover:text-red-700 font-medium self-start"
          >
            {deleting ? 'Eliminando...' : 'Eliminar servicio'}
          </button>
        )}
      </div>
    </article>
  )
}
