'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  User, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Star,
  RefreshCw,
  MessageCircle,
  Eye,
  Route
} from 'lucide-react'

interface TrackingData {
  booking: {
    id: string
    serviceType: string
    description: string
    urgency: string
    status: string
    pickupAddress: string
    latitude: number
    longitude: number
    preferredDate: string
    preferredTime: string
    estimatedArrival: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string
      email: string
      phone: string
    }
    vehicle: {
      id: string
      make: string
      model: string
      year: number
      licensePlate: string
      color: string
    }
    partner?: {
      id: string
      businessName: string
      phone: string
      address: string
      rating: number
    }
    mechanic?: {
      id: string
      name: string
      phone: string
      specialties: string[]
      experience: number
      rating: number
    }
  }
  tracking: {
    bookingId: string
    status: string
    location: {
      latitude: number
      longitude: number
      address: string
    }
    estimatedArrival: string
    partnerInfo?: {
      id: string
      businessName: string
      phone: string
      rating: number
    }
    mechanicInfo?: {
      id: string
      name: string
      phone: string
      specialties: string[]
      rating: number
    }
    timestamp: string
  }
}

interface RealTimeTrackingProps {
  bookingId: string
  onComplete?: () => void
  onCancel?: () => void
}

export default function RealTimeTracking({ bookingId, onComplete, onCancel }: RealTimeTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchTrackingData()
    
    // Set up real-time updates every 3 seconds
    const interval = setInterval(fetchTrackingData, 3000)
    
    return () => clearInterval(interval)
  }, [bookingId])

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/tracking?bookingId=${bookingId}`)
      const data = await response.json()
      
      if (data.success) {
        setTrackingData(data)
        setLastUpdate(new Date().toISOString())
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchTrackingData()
    setIsRefreshing(false)
  }

  const handleContactPartner = () => {
    if (trackingData?.tracking.partnerInfo?.phone) {
      window.open(`tel:${trackingData.tracking.partnerInfo.phone}`)
    }
  }

  const handleMessagePartner = () => {
    if (trackingData?.tracking.partnerInfo?.phone) {
      window.open(`https://wa.me/91${trackingData.tracking.partnerInfo.phone.replace(/[^0-9]/g, '')}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'arrived':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'assigned':
        return <User className="w-4 h-4" />
      case 'in_progress':
        return <Navigation className="w-4 h-4" />
      case 'arrived':
        return <MapPin className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 10
      case 'assigned':
        return 25
      case 'in_progress':
        return 60
      case 'arrived':
        return 90
      case 'completed':
        return 100
      case 'cancelled':
        return 0
      default:
        return 0
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Loading tracking data...</span>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Tracking data not available</p>
      </div>
    )
  }

  const progressPercentage = getProgressPercentage(trackingData.tracking.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="w-5 h-5" />
              <span>Real-time Tracking</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status and Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Service Status</span>
                <Badge className={getStatusColor(trackingData.tracking.status)}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(trackingData.tracking.status)}
                    <span>{trackingData.tracking.status.replace('_', ' ')}</span>
                  </span>
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Type</p>
                <p className="text-sm capitalize">{trackingData.booking.serviceType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgency</p>
                <Badge className={getUrgencyColor(trackingData.booking.urgency)}>
                  {trackingData.booking.urgency}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pickup Address</p>
                <p className="text-sm">{trackingData.booking.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Arrival</p>
                <p className="text-sm">{trackingData.booking.estimatedArrival}</p>
              </div>
            </div>

            {trackingData.booking.description && (
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm">{trackingData.booking.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Map (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Interactive Map</p>
              <p className="text-sm text-gray-500">
                {trackingData.tracking.location.address}
              </p>
              <p className="text-xs text-gray-400">
                Coordinates: {trackingData.tracking.location.latitude.toFixed(6)}, {trackingData.tracking.location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Information */}
      {trackingData.tracking.partnerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Service Provider</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{trackingData.tracking.partnerInfo.businessName}</h3>
                  <p className="text-sm text-gray-600">{trackingData.booking.partner?.address}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{trackingData.tracking.partnerInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{trackingData.tracking.partnerInfo.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mechanic Information */}
              {trackingData.tracking.mechanicInfo && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Assigned Mechanic</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{trackingData.tracking.mechanicInfo.name}</p>
                      <p className="text-sm text-gray-500">{trackingData.tracking.mechanicInfo.phone}</p>
                      <p className="text-sm text-gray-500">
                        Experience: {trackingData.tracking.mechanicInfo.experience} years
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{trackingData.tracking.mechanicInfo.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Vehicle Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle</p>
              <p className="text-sm">{trackingData.booking.vehicle.make} {trackingData.booking.vehicle.model}</p>
              <p className="text-sm text-gray-500">{trackingData.booking.vehicle.year} • {trackingData.booking.vehicle.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Owner</p>
              <p className="text-sm">{trackingData.booking.user.name}</p>
              <p className="text-sm text-gray-500">{trackingData.booking.user.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleContactPartner}
          className="flex-1"
          variant="outline"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call Provider
        </Button>
        <Button
          onClick={handleMessagePartner}
          className="flex-1"
          variant="outline"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        {onComplete && trackingData.tracking.status === 'completed' && (
          <Button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </Button>
        )}
        {onCancel && (
          <Button
            onClick={onCancel}
            className="flex-1"
            variant="outline"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Completion Message */}
      {trackingData.tracking.status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Service Completed!</h3>
                <p className="text-sm text-green-600">
                  Your {trackingData.booking.serviceType} service has been completed successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export hook for use in other components
export function useRealTimeTracking(bookingId: string) {
  const [trackingData, setTrackingData] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock real-time tracking data
  useEffect(() => {
    if (bookingId) {
      // Simulate real-time tracking
      const mockTrackingData = {
        bookingId,
        tracking: {
          status: 'in_progress',
          partner: {
            id: 'partner-123',
            name: 'QuickFix Garage',
            phone: '+1-234-567-8900',
            photo: '/partner-avatar.jpg'
          },
          location: {
            lat: 40.7128,
            lng: -74.0060,
            address: '123 Main St, New York, NY'
          },
          estimatedArrival: '15-20 minutes',
          progress: 65,
          updatedAt: new Date().toISOString()
        }
      }

      setTrackingData(mockTrackingData)
      setIsTracking(true)

      // Simulate tracking updates
      const interval = setInterval(() => {
        setTrackingData(prev => {
          if (!prev) return null
          
          const progress = Math.min(prev.tracking.progress + 5, 100)
          return {
            ...prev,
            tracking: {
              ...prev.tracking,
              progress,
              updatedAt: new Date().toISOString()
            }
          }
        })
      }, 3000)

      return () => {
        clearInterval(interval)
        setIsTracking(false)
      }
    }
  }, [bookingId])

  const startTracking = () => {
    setIsTracking(true)
    setError(null)
  }

  const stopTracking = () => {
    setIsTracking(false)
  }

  const updateLocation = (location: any) => {
    setTrackingData(prev => {
      if (!prev) return null
      return {
        ...prev,
        tracking: {
          ...prev.tracking,
          location,
          updatedAt: new Date().toISOString()
        }
      }
    })
  }

  return {
    trackingData,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateLocation
  }
}