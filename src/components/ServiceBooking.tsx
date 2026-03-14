'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Building, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Phone, 
  Navigation,
  Clock,
  Star,
  Users
} from 'lucide-react'
import RealTimeTracking from '@/components/RealTimeTracking'
import { useWebSocket } from '@/lib/websocket'
import { useRealTimeTracking } from '@/components/RealTimeTracking'

interface ServiceBookingProps {
  vehicleInfo: {
    id: string
    qrCode: string
    vin: string
    make: string
    model: string
    year: number
    licensePlate: string
    color: string
    mileage: number
    insuranceCompany: string
    insurancePolicy: string
    insuranceExpiry: string
    owner: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
  userLocation: {
    lat: number
    lng: number
    address: string
  }
  userId: string
}

interface Garage {
  id: string
  businessName: string
  phone: string
  email: string
  rating: number
  services: string[]
  location: {
    lat: number
    lng: number
    address: string
  }
  distance: number
  estimatedArrival: string
}

export default function ServiceBooking({ vehicleInfo, userLocation, userId }: ServiceBookingProps) {
  const [garages, setGarages] = useState<Garage[]>([])
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState<any>(null)
  const [searchRadius, setSearchRadius] = useState('10')
  const [serviceFilter, setServiceFilter] = useState('all')

  // WebSocket integration
  const { socket, isConnected } = useWebSocket({
    token: userId,
    type: 'user',
    id: userId
  })

  const { trackingData, isTracking } = useRealTimeTracking(bookingData?.id)

  const [serviceRequest, setServiceRequest] = useState({
    serviceType: '',
    urgency: 'medium',
    description: '',
    pickupAddress: userLocation.address,
    coordinates: {
      lat: userLocation.lat,
      lng: userLocation.lng
    }
  })

  // Search for nearby garages
  const searchGarages = async () => {
    setIsLoading(true)
    try {
      // Mock garage search - in production, this would call your API
      const mockGarages: Garage[] = [
        {
          id: '1',
          businessName: 'QuickFix Garage',
          phone: '+1-234-567-8900',
          email: 'info@quickfix.com',
          rating: 4.5,
          services: ['towing', 'mechanic', 'fuel'],
          location: {
            lat: userLocation.lat + 0.01,
            lng: userLocation.lng + 0.01,
            address: '123 Main St, City, State'
          },
          distance: 1.2,
          estimatedArrival: '15-20 minutes'
        },
        {
          id: '2',
          businessName: 'AutoCare Plus',
          phone: '+1-234-567-8901',
          email: 'info@autocare.com',
          rating: 4.2,
          services: ['towing', 'mechanic', 'accident'],
          location: {
            lat: userLocation.lat - 0.01,
            lng: userLocation.lng + 0.02,
            address: '456 Oak Ave, City, State'
          },
          distance: 2.1,
          estimatedArrival: '20-25 minutes'
        }
      ]
      
      setGarages(mockGarages)
    } catch (error) {
      console.error('Error searching garages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Book service
  const bookService = async () => {
    if (!selectedGarage) {
      setBookingError('Please select a garage first')
      return
    }

    setIsBooking(true)
    try {
      // Mock booking - in production, this would call your API
      const mockBooking = {
        id: 'booking-' + Date.now(),
        serviceType: serviceRequest.serviceType,
        urgency: serviceRequest.urgency,
        description: serviceRequest.description,
        pickupAddress: serviceRequest.pickupAddress,
        coordinates: serviceRequest.coordinates,
        status: 'confirmed',
        garageId: selectedGarage.id,
        userId: userId,
        vehicleId: vehicleInfo.id,
        createdAt: new Date().toISOString()
      }
      
      setBookingData(mockBooking)
      setBookingSuccess(true)
      
      // Mock assignment - in production, this would be handled by your backend
      const mockAssignment = {
        partner: selectedGarage,
        estimatedArrival: selectedGarage.estimatedArrival,
        status: 'assigned'
      }
      
      setAssignmentData(mockAssignment)
      
      // Send real-time update via WebSocket
      if (socket && isConnected) {
        socket.emit('service_booked', {
          bookingId: mockBooking.id,
          partnerId: selectedGarage.id,
          userId: userId
        })
      }
    } catch (error) {
      console.error('Error booking service:', error)
      setBookingError('Failed to book service. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get urgency icon
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'urgent': return <AlertCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Service Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={serviceRequest.serviceType} onValueChange={(value) => setServiceRequest(prev => ({ ...prev, serviceType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="towing">Towing</SelectItem>
                  <SelectItem value="mechanic">Mechanic</SelectItem>
                  <SelectItem value="fuel">Fuel Delivery</SelectItem>
                  <SelectItem value="accident">Accident Assistance</SelectItem>
                  <SelectItem value="lockout">Lockout Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={serviceRequest.urgency} onValueChange={(value) => setServiceRequest(prev => ({ ...prev, urgency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your issue..."
              value={serviceRequest.description}
              onChange={(e) => setServiceRequest(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label>Current Location</Label>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{userLocation.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Garages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Available Garages</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {garages.length} garages found
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={searchGarages}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Finding available garages...</span>
            </div>
          ) : garages.length > 0 ? (
            <div className="space-y-4">
              {garages.map((garage) => (
                <div key={garage.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{garage.businessName}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Distance:</span> {garage.distance.toFixed(1)} km
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Rating:</span> {garage.rating}/5
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Services:</span> {garage.services.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGarage(garage)}
                      className={selectedGarage?.id === garage.id ? 'ring-2 ring-blue-500' : ''}
                    >
                      {selectedGarage?.id === garage.id ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${garage.location.lat},${garage.location.lng}`
                        window.open(url, '_blank')
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No garages found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search radius or location
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Button */}
      {selectedGarage && !bookingSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Book Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{selectedGarage.businessName}</span>
              </div>
              <Button
                onClick={bookService}
                disabled={isBooking}
                className="w-full"
              >
                {isBooking ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking...</span>
                  </div>
                ) : (
                  'Book Service'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Confirmation */}
      {bookingData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Service Booked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800">Booking Confirmed!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Booking ID: {bookingData.id}
                </p>
                <p className="text-sm text-green-700">
                  Status: {bookingData.status}
                </p>
                {assignmentData && (
                  <p className="text-sm text-green-700">
                    Assigned Partner: {assignmentData.partner.businessName}
                  </p>
                )}
              </div>
              
              {assignmentData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800">Partner Details</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Partner: {assignmentData.partner.businessName}
                  </p>
                  <p className="text-sm text-blue-700">
                    Phone: {assignmentData.partner.phone}
                  </p>
                  <p className="text-sm text-blue-700">
                    Estimated Arrival: {assignmentData.estimatedArrival}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setBookingData(null)
                    setAssignmentData(null)
                    setBookingSuccess(false)
                    setBookingError(null)
                  }}
                  variant="outline"
                >
                  Book Another Service
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Tracking */}
      {bookingData && assignmentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Service Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeTracking
              bookingId={bookingData.id}
              partnerId={assignmentData.partner.id}
              initialLocation={assignmentData.partner.location}
              userId={userId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}