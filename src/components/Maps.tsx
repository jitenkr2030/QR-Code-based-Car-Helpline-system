'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Star, 
  Car, 
  Building, 
  Route, 
  RefreshCw, 
  ExternalLink,
  Search,
  Map,
  Compass
} from 'lucide-react'

interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface Partner {
  id: string
  businessName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  rating: number
  distance: number
  services: string[]
  pricing: any
  hours: string
  mechanicsCount: number
  isActive: boolean
  isVerified: boolean
}

interface RouteData {
  distance: number
  duration: number
  origin: {
    latitude: number
    longitude: number
    address: Location
  }
  destination: {
    latitude: number
    longitude: number
    address: Location
  }
  polyline: string
  steps: Array<{
    instruction: string
    distance: number
    duration: number
    start_location: { lat: number; lng: number }
    end_location: { lat: number; lng: number }
  }>
}

interface MapsProps {
  initialLocation?: Location
  onLocationSelect?: (location: Location) => void
  onPartnerSelect?: (partner: Partner) => void
}

export default function Maps({ initialLocation, onLocationSelect, onPartnerSelect }: MapsProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(initialLocation || null)
  const [nearbyPartners, setNearbyPartners] = useState<Partner[]>([])
  const [searchLocation, setSearchLocation] = useState('')
  const [searchRadius, setSearchRadius] = useState('10')
  const [selectedService, setSelectedService] = useState('all')
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'nearby' | 'route'>('search')
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.latitude || 28.6139,
    lng: initialLocation?.longitude || 77.2090
  })

  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation)
      setMapCenter({
        lat: initialLocation.latitude,
        lng: initialLocation.longitude
      })
    } else {
      // Get user's current location
      getCurrentLocation()
    }
  }, [initialLocation])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setCurrentLocation(location)
          setMapCenter({
            lat: location.latitude,
            lng: location.longitude
          })
          fetchNearbyPartners(location.latitude, location.longitude)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const fetchNearbyPartners = async (lat: number, lng: number, radius: number = 10, serviceType: string = 'all') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/maps?type=nearby&lat=${lat}&lng=${lng}&radius=${radius}&service=${serviceType}`)
      const data = await response.json()
      
      if (data.success) {
        setNearbyPartners(data.partners)
      }
    } catch (error) {
      console.error('Error fetching nearby partners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchLocation) {
      // In production, you would use a geocoding service to convert address to coordinates
      // For demo purposes, we'll use mock coordinates
      const mockCoordinates = {
        'Delhi': { lat: 28.6139, lng: 77.2090 },
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 }
      }
      
      const location = mockCoordinates[searchLocation as keyof typeof mockCoordinates]
      if (location) {
        setCurrentLocation({
          latitude: location.lat,
          longitude: location.lng,
          address: searchLocation
        })
        setMapCenter(location)
        fetchNearbyPartners(location.lat, location.lng, parseFloat(searchRadius), selectedService)
      }
    }
  }

  const handleGetRoute = async (destination: Location) => {
    if (!currentLocation) {
      alert('Please allow location access first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/maps?type=route&originLat=${currentLocation.latitude}&originLng=${currentLocation.longitude}&destLat=${destination.latitude}&destLng=${destination.longitude}`)
      const data = await response.json()
      
      if (data.success) {
        setRoute(data.route)
        setActiveTab('route')
      }
    } catch (error) {
      console.error('Error getting route:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePartnerClick = (partner: Partner) => {
    if (onPartnerSelect) {
      onPartnerSelect(partner)
    }
  }

  const handleLocationClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const formatDistance = (distance: number) => {
    return `${distance} km`
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} min`
    } else {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${hours}h ${minutes}m`
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'towing':
        return <Car className="w-4 h-4 text-blue-600" />
      case 'mechanic':
        return <Building className="w-4 h-4 text-orange-600" />
      case 'fuel':
        return <Navigation className="w-4 h-4 text-green-600" />
      case 'accident':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'lockout':
        return <Lock className="w-4 h-4 text-gray-600" />
      default:
        return <MapPin className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span>Maps & Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Location */}
          {currentLocation && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-xs text-gray-600">
                    {currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('search')}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant={activeTab === 'nearby' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('nearby')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Nearby
            </Button>
            <Button
              variant={activeTab === 'route' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('route')}
            >
              <Route className="w-4 h-4 mr-2" />
              Route
            </Button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search Location</Label>
                  <Input
                    id="search"
                    placeholder="Enter city name (e.g., Delhi, Mumbai)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="radius">Search Radius (km)</Label>
                  <Select value={searchRadius} onValueChange={setSearchRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSearch} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Location
              </Button>
            </div>
          )}

          {/* Nearby Tab */}
          {activeTab === 'nearby' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Nearby Service Partners</h3>
                <div className="flex items-center space-x-2">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="towing">Towing</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="fuel">Fuel</SelectItem>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="lockout">Lockout</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentLocation && fetchNearbyPartners(currentLocation.latitude, currentLocation.longitude, parseFloat(searchRadius), selectedService)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-4">Finding nearby partners...</span>
                </div>
              ) : nearbyPartners.length > 0 ? (
                <div className="space-y-3">
                  {nearbyPartners.map((partner) => (
                    <div key={partner.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handlePartnerClick(partner)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{partner.businessName}</h4>
                            <Badge className={partner.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {partner.isVerified ? 'Verified' : 'Not Verified'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{partner.address}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{partner.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{partner.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{formatDistance(partner.distance)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {partner.services.slice(0, 3).map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {getServiceIcon(service)}
                                <span className="ml-1">{service}</span>
                              </Badge>
                            ))}
                            {partner.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{partner.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGetRoute({
                                latitude: partner.latitude,
                                longitude: partner.longitude,
                                address: partner.address
                              })
                            }}
                          >
                            <Route className="w-4 h-4 mr-2" />
                            Get Route
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`tel:${partner.phone}`)
                            }}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No nearby partners found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try increasing the search radius or changing the service type
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Route Tab */}
          {activeTab === 'route' && (
            <div className="space-y-4">
              {route ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Origin</Label>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">{route.origin.address.address}</p>
                        <p className="text-xs text-gray-500">
                          {route.origin.latitude.toFixed(6)}, {route.origin.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Destination</Label>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">{route.destination.address.address}</p>
                        <p className="text-xs text-gray-500">
                          {route.destination.latitude.toFixed(6)}, {route.destination.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800">Distance</p>
                      <p className="text-2xl font-bold text-blue-600">{formatDistance(route.distance)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">Duration</p>
                      <p className="text-2xl font-bold text-green-600">{formatDuration(route.duration)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Directions</h4>
                    {route.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{step.instruction}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{formatDistance(step.distance)}</span>
                            <span>{formatDuration(step.duration)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Open in Google Maps
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${route.origin.latitude},${route.origin.longitude}&destination=${route.destination.latitude},${route.destination.longitude}`
                      window.open(url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No route available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Search for a location or select a partner to get directions
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Compass className="w-5 h-5" />
            <span>Interactive Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Interactive Map</p>
              <p className="text-sm text-gray-500 mb-4">
                Center: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-400">
                In production, this would be an interactive map with markers,
                real-time tracking, and navigation features.
              </p>
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Map className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}