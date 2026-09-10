'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { PostWithDetails } from '@/types'
import { getPostTypeInfo } from '@/lib/utils'

// Coordenadas de Córdoba, Argentina
const CORDOBA_CENTER: [number, number] = [-31.4201, -64.1888]
// Zoom 10 muestra Córdoba capital + Villa Carlos Paz, Alta Gracia, Río Ceballos, etc.
const DEFAULT_ZOOM = 10

interface MapViewProps {
  posts: PostWithDetails[]
  center?: [number, number]
  zoom?: number
}

// Marker moderno usando divIcon
function buildIcon(L: any, type: string) {
  const info = getPostTypeInfo(type)

  const html = `
    <div style="position:relative;width:36px;height:44px;transform:translate(-50%,-100%)">
      <div style="
        position:absolute;left:50%;top:0;transform:translateX(-50%);
        width:36px;height:36px;border-radius:9999px;background:${info.markerBg};
        border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.18),0 0 0 4px ${info.markerRing};
        display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;
      ">${info.emoji}</div>
      <div style="
        position:absolute;left:50%;bottom:0;transform:translateX(-50%);
        width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
        border-top:10px solid ${info.markerBg};
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  })
}

export default function MapView({ posts, center, zoom = DEFAULT_ZOOM }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const LRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  // Inicializar el mapa una única vez
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (!containerRef.current || mapRef.current) return

      const L = (await import('leaflet')).default
      if (cancelled) return

      const initialCenter = center || CORDOBA_CENTER

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
      })

      // Tile layer: OpenStreetMap (100% gratis, sin API key)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      LRef.current = L
      setMapReady(true)
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = []
        LRef.current = null
      }
      setMapReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar el centro cuando cambia
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.setView(center, mapRef.current.getZoom())
  }, [center])

  // Actualizar markers cuando cambian los posts o cuando el mapa está listo
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return

    const L = LRef.current
    const map = mapRef.current

    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    posts.forEach((post) => {
      if (typeof post.latitude !== 'number' || typeof post.longitude !== 'number') return

      const info = getPostTypeInfo(post.type)
      // Colores del badge en hex para inline styles del popup
      const badgeStyles: Record<string, string> = {
        lost: 'background:#FFE4E6;color:#BE123C',
        found: 'background:#D1FAE5;color:#047857',
        sitter_needed: 'background:#E0F2FE;color:#0369A1',
        adoption: 'background:#F3E8FF;color:#7E22CE',
        foster: 'background:#FEF3C7;color:#B45309',
        emergency: 'background:#FEE2E2;color:#B91C1C',
      }
      const badgeColor = badgeStyles[post.type] || badgeStyles.lost

      const html = `
        <div style="min-width:220px;font-family:Inter,sans-serif">
          <a href="/post/${post.id}" style="text-decoration:none;color:#0f172a">
            <strong style="display:block;font-size:14px;font-weight:600;margin-bottom:6px">${escapeHtml(post.title)}</strong>
          </a>
          <span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:600;border-radius:9999px;${badgeColor}">
            ${info.label}
          </span>
          <p style="margin:8px 0 0;font-size:12px;color:#475569;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            ${escapeHtml(post.description || '')}
          </p>
          <a href="/post/${post.id}" style="margin-top:8px;display:inline-block;font-size:12px;font-weight:500;color:#0EA5E9;text-decoration:none">
            Ver detalles →
          </a>
        </div>
      `

      const marker = L.marker([post.latitude, post.longitude], {
        icon: buildIcon(L, post.type),
      })
        .addTo(map)
        .bindPopup(html)

      markersRef.current.push(marker)
    })
  }, [posts, mapReady])

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-2xl overflow-hidden"
      style={{ minHeight: '300px', zIndex: 0 }}
    />
  )
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
