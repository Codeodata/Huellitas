'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Coordenadas de Córdoba, Argentina
const CORDOBA_CENTER: [number, number] = [-31.4201, -64.1888]

interface MapPickerProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapPicker({ center, onLocationSelect }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  // Guardamos el callback en un ref para no reinicializar el mapa cuando cambia
  const onLocationSelectRef = useRef(onLocationSelect)

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect
  }, [onLocationSelect])

  // Inicializar el mapa una única vez
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (!containerRef.current || mapRef.current) return

      const L = (await import('leaflet')).default
      if (cancelled) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const initialCenter: [number, number] =
        center[0] !== 0 && center[1] !== 0 ? center : CORDOBA_CENTER

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 13,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Marker moderno con huellita
      const html = `
        <div style="position:relative;width:36px;height:44px;transform:translate(-50%,-100%)">
          <div style="
            position:absolute;left:50%;top:0;transform:translateX(-50%);
            width:36px;height:36px;border-radius:9999px;background:#0EA5E9;
            border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.18),0 0 0 4px #BAE6FD;
            display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;
          ">🐾</div>
          <div style="
            position:absolute;left:50%;bottom:0;transform:translateX(-50%);
            width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
            border-top:10px solid #0EA5E9;
          "></div>
        </div>
      `
      const customIcon = L.divIcon({
        html,
        className: '',
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      })

      const marker = L.marker(initialCenter, { draggable: true, icon: customIcon }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onLocationSelectRef.current(pos.lat, pos.lng)
      })

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        onLocationSelectRef.current(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      markerRef.current = marker
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar la posición del marker cuando el center cambia externamente
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    markerRef.current.setLatLng(center)
    mapRef.current.setView(center, mapRef.current.getZoom())
  }, [center])

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-2xl overflow-hidden"
      style={{ minHeight: '300px', zIndex: 0 }}
    />
  )
}
