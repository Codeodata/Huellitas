'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapPickerProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

export default function MapPicker({ center, onLocationSelect }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number]>(center)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setPosition(center)
  }, [center])

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center border-4 border-black">
        <span className="font-bold">Loading map...</span>
      </div>
    )
  }

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      className="h-full w-full"
      style={{ border: '3px solid #1A1A1A', boxShadow: '4px 4px 0 #1A1A1A' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={position} />
      <MapEvents onClick={handleMapClick} />
      <Marker position={position} icon={icon} />
    </MapContainer>
  )
}
