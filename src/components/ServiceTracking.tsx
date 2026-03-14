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
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Star,
  MessageCircle
} from 'lucide-react'

interface ServiceTrackingProps {
  bookingId: string
  onComplete?: () => void
}

interface ServiceData {
  id: string
  serviceType: string
  description: string
  urgency: string
  status: string
  pickupAddress: string
  latitude: number
  longitude: number
  estimatedArrival: string
  createdAt: string
  vehicle: {
    make: string
    model: string
    year: number
    licensePlate: string
    owner: {
      name: string
      phone: string
    }
  }
  partner?: {
    id: string
    businessName: string
    phone: string
    address: string
    distance: number
    eta: number
    rating: number
    services: string[]
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

export default function ServiceTracking({ bookingId, onComplete }: ServiceTrackingProps) {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trackingProgress, setTrackingProgress] = useState(0)
  const [currentStatus, setCurrentStatus] = useState('pending')

  useEffect(() => {
    fetchServiceData()
    const interval = setInterval(fetchServiceData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [bookingId])

  const fetchServiceData = async () => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`)
      const data = await response.json()
      
      if (data.success) {
        setServiceData(data.booking)
        setCurrentStatus(data.booking.status)
        
        // Calculate progress based on status
        const statusProgress = {
          'pending': 10,
          'assigned': 25,
          'in_progress': 60,
          'completed': 100
        }
        
        setTrackingProgress(statusProgress[data.booking.status as keyof typeof statusProgress] || 0)
        
        // Call onComplete when service is completed
        if (data.booking.status === 'completed' && onComplete) {
          setTimeout(onComplete, 2000)
        }
      }
    } catch (error) {
      console.error('Error fetching service data:', error)
    } finally {
      setIsLoading(false)
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
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'towing':
        return <Car className="w-5 h-5 text-blue-600" />
      case 'mechanic':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'fuel':
        return <div className="w-5 h-5 bg-green-600 rounded-full" />
      case 'accident':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'lockout':
        return <AlertCircle className="w-5 h-5 text-gray-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading service tracking...</span>
      </div>
    )
  }

  if (!serviceData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Service tracking information not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              {getServiceIcon(serviceData.serviceType)}
              <span>Service Status</span>
            </span>
            <Badge className={getStatusColor(currentStatus)}>
              <span className="flex items-center space-x-1">
                {getStatusIcon(currentStatus)}
                <span>{currentStatus.replace('_', ' ')}</span>
              </span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Service Progress</span>
                <span className="text-sm text-gray-500">{trackingProgress}%</span>
              </div>
              <Progress value={trackingProgress} className="w-full" />
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Type</p>
                <p className="text-sm capitalize">{serviceData.serviceType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgency</p>
                <Badge className={getUrgencyColor(serviceData.urgency)}>
                  {serviceData.urgency}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pickup Address</p>
                <p className="text-sm">{serviceData.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Arrival</p>
                <p className="text-sm">{serviceData.estimatedArrival}</p>
              </div>
            </div>

            {serviceData.description && (
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm">{serviceData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <p className="text-sm">{serviceData.vehicle.make} {serviceData.vehicle.model}</p>
              <p className="text-sm text-gray-500">{serviceData.vehicle.year} • {serviceData.vehicle.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Owner</p>
              <p className="text-sm">{serviceData.vehicle.owner.name}</p>
              <p className="text-sm text-gray-500">{serviceData.vehicle.owner.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Assignment */}
      {serviceData.partner && (
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
                  <h3 className="font-semibold">{serviceData.partner.businessName}</h3>
                  <p className="text-sm text-gray-600">{serviceData.partner.address}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{serviceData.partner.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{serviceData.partner.distance} km away</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>ETA: {serviceData.partner.eta} min</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{serviceData.partner.rating}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Services Offered</p>
                <div className="flex flex-wrap gap-1">
                  {serviceData.partner.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Mechanic Information */}
              {serviceData.mechanic && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Assigned Mechanic</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{serviceData.mechanic.name}</p>
                      <p className="text-sm text-gray-500">{serviceData.mechanic.phone}</p>
                      <p className="text-sm text-gray-500">
                        Experience: {serviceData.mechanic.experience} years
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{serviceData.mechanic.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button className="flex-1" variant="outline">
          <Phone className="w-4 h-4 mr-2" />
          Call Provider
        </Button>
        <Button className="flex-1" variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Message
        </Button>
        <Button className="flex-1" variant="outline">
          <MapPin className="w-4 h-4 mr-2" />
          Track Location
        </Button>
      </div>

      {/* Completion Message */}
      {currentStatus === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Service Completed!</h3>
                <p className="text-sm text-green-600">
                  Your {serviceData.serviceType} service has been completed successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}