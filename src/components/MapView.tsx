'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { PostWithDetails } from '@/types'
import Link from 'next/link'
import { getPostTypeLabel } from '@/lib/utils'

const createIcon = (color: string) => L.icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const icons = {
  lost: createIcon('red'),
  found: createIcon('green'),
  sitter_needed: createIcon('blue'),
}

interface MapViewProps {
  posts: PostWithDetails[]
  center?: [number, number]
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  
  return null
}

export default function MapView({ posts, center }: MapViewProps) {
  const [mounted, setMounted] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(center || [51.505, -0.09])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (center) {
      setMapCenter(center)
    }
  }, [center])

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center border-4 border-black">
        <span className="font-bold">Loading map...</span>
      </div>
    )
  }

  const getIcon = (type: string) => {
    return icons[type as keyof typeof icons] || icons.lost
  }

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      className="h-full w-full"
      style={{ border: '3px solid #1A1A1A', boxShadow: '4px 4px 0 #1A1A1A' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={mapCenter} />
      {posts.map((post) => (
        <Marker 
          key={post.id} 
          position={[post.latitude, post.longitude]}
          icon={getIcon(post.type)}
        >
          <Popup>
            <div className="min-w-[200px]">
              <Link href={`/post/${post.id}`} className="hover:text-primary">
                <strong className="block text-lg font-bold">{post.title}</strong>
              </Link>
              <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded mt-2 ${
                post.type === 'lost' ? 'bg-red-500' : 
                post.type === 'found' ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {getPostTypeLabel(post.type)}
              </span>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {post.description}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
