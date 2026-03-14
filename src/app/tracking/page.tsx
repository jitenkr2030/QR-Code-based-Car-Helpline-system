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
  CheckCircle, 
  AlertCircle, 
  Navigation, 
  MessageSquare, 
  User, 
  Building, 
  Calendar,
  RefreshCw,
  Eye,
  Share,
  Download,
  Filter,
  Search,
  Activity
} from 'lucide-react'
import { useWebSocket, useRealTimeTracking } from '@/hooks/useWebSocket'

interface ServiceBooking {
  id: string
  bookingNumber: string
  status: string
  serviceType: string
  urgency: string
  user: {
    id: string
    name: string
    phone: string
    email: string
  }
  partner: {
    id: string
    businessName: string
    phone: string
    email: string
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
  }
  pickupLocation: {
    address: string
    latitude: number
    longitude: number
  }
  dropoffLocation?: {
    address: string
    latitude: number
    longitude: number
  }
  estimatedTime: number
  estimatedCost: number
  createdAt: string
  updatedAt: string
  assignedAt?: string
  startedAt?: string
  completedAt?: string
  notes?: string
  tracking: {
    currentLocation?: {
      latitude: number
      longitude: number
      address: string
      updatedAt: string
    }
    estimatedArrival?: string
    progress: number
  }
}

interface RealTimeTrackingProps {
  bookingId?: string
  userId?: string
}

export default function RealTimeTrackingPage({ bookingId, userId }: RealTimeTrackingProps) {
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // WebSocket integration
  const { socket, isConnected } = useWebSocket({
    token: userId, // In production, use actual JWT token
    type: 'user',
    id: userId
  })

  const { trackingData, isTracking } = useRealTimeTracking(selectedBooking?.id)

  useEffect(() => {
    fetchBookings()
    
    if (autoRefresh) {
      const interval = setInterval(fetchBookings, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, bookingId, userId])

  // Handle real-time updates via WebSocket
  useEffect(() => {
    if (socket && isConnected) {
      // Listen for booking updates
      socket.on('booking_update', (data) => {
        if (data.bookingId === selectedBooking?.id) {
          setSelectedBooking(prev => ({
            ...prev,
            ...data.update
          }))
        }
        
        // Update bookings list
        setBookings(prev => 
          prev.map(booking => 
            booking.id === data.bookingId 
              ? { ...booking, ...data.update }
              : booking
          )
        )
      })

      // Listen for tracking updates
      socket.on('tracking_update', (data) => {
        if (data.bookingId === selectedBooking?.id) {
          setSelectedBooking(prev => ({
            ...prev,
            tracking: {
              ...prev.tracking,
              ...data.update
            }
          }))
        }
      })

      return () => {
        socket.off('booking_update')
        socket.off('tracking_update')
      }
    }
  }, [socket, isConnected, selectedBooking])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (bookingId) params.append('bookingId', bookingId)
      if (userId) params.append('userId', userId)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/service-booking/tracking?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.bookings)
        if (bookingId && data.bookings.length > 0) {
          setSelectedBooking(data.bookings[0])
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectBooking = (booking: ServiceBooking) => {
    setSelectedBooking(booking)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredBookings = bookings.filter(booking => 
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.partner.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(booking => filterStatus === 'all' || booking.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-time Tracking</h1>
              <p className="text-gray-600 mt-2">
                Track service bookings in real-time with live updates.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isTracking && (
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Tracking</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-4">Loading bookings...</span>
              </div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedBooking?.id === booking.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectBooking(booking)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge className={getUrgencyColor(booking.urgency)}>
                          {booking.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle share
                          }}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle download
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{booking.bookingNumber}</p>
                          <p className="text-sm text-gray-600">{booking.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{booking.estimatedCost}</p>
                          <p className="text-sm text-gray-600">Est. Cost</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Customer</p>
                          <p className="text-sm">{booking.user.name}</p>
                          <p className="text-sm text-gray-500">{booking.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Partner</p>
                          <p className="text-sm">{booking.partner.businessName}</p>
                          <p className="text-sm text-gray-500">{booking.partner.phone}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600">Vehicle</p>
                        <p className="text-sm">{booking.vehicle.make} {booking.vehicle.model}</p>
                        <p className="text-sm text-gray-500">{booking.vehicle.licensePlate}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pickup</p>
                          <p className="text-sm">{booking.pickupLocation.address}</p>
                        </div>
                        {booking.dropoffLocation && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Dropoff</p>
                            <p className="text-sm">{booking.dropoffLocation.address}</p>
                          </div>
                        )}
                      </div>

                      {booking.tracking && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600">Tracking</p>
                            <p className="text-sm text-gray-500">
                              {booking.tracking.currentLocation ? 
                                `Updated: ${formatDate(booking.tracking.currentLocation.updatedAt)}` : 
                                'Not started'
                              }
                            </p>
                          </div>
                          
                          {booking.tracking.currentLocation && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <p className="text-sm">{booking.tracking.currentLocation.address}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Progress</span>
                                <span className="text-sm font-medium">{booking.tracking.progress}%</span>
                              </div>
                              <Progress value={booking.tracking.progress} className="w-full" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {booking.estimatedTime ? `Est. ${formatTime(booking.estimatedTime)}` : 'Calculating...'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {searchTerm || filterStatus !== 'all' ? 
                        'Try adjusting your search or filters' : 
                        'No bookings match your criteria'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Booking Details */}
          <div className="space-y-4">
            {selectedBooking ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Navigation className="w-5 h-5" />
                      <span>Tracking Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Booking</span>
                        <Badge className={getStatusColor(selectedBooking.status)}>
                          {selectedBooking.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Customer</p>
                            <p className="text-sm">{selectedBooking.user.name}</p>
                            <p className="text-sm text-gray-500">{selectedBooking.user.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Partner</p>
                            <p className="text-sm">{selectedBooking.partner.businessName}</p>
                            <p className="text-sm text-gray-500">{selectedBooking.partner.phone}</p>
                          </div>
                        </div>
                      </div>

                      {selectedBooking.tracking?.currentLocation && (
                        <div className="border-t pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Current Location</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm">{selectedBooking.tracking.currentLocation.address}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last updated: {formatDate(selectedBooking.tracking.currentLocation.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{selectedBooking.tracking?.progress || 0}%</span>
                        </div>
                        <Progress value={selectedBooking.tracking?.progress || 0} className="w-full" />
                        {isTracking && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600">Real-time tracking active</span>
                          </div>
                        )}
                        {trackingData && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Last update: {formatDate(trackingData.timestamp)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // Handle contact customer
                            window.open(`tel:${selectedBooking.user.phone}`)
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // Handle contact partner
                            window.open(`tel:${selectedBooking.partner.phone}`)
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Live Map</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Interactive Map</p>
                        <p className="text-sm text-gray-500 mb-4">
                          In production, this would be an interactive map with:
                        </p>
                        <ul className="text-xs text-gray-400 text-left space-y-1">
                          <li>• Real-time partner location</li>
                          <li>• Live tracking updates</li>
                          <li>• Route visualization</li>
                          <li>• ETA calculations</li>
                          <li>• Traffic information</li>
                        </ul>
                        <div className="mt-4 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Open in Google Maps
                              if (selectedBooking.tracking?.currentLocation) {
                                const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedBooking.pickupLocation.latitude},${selectedBooking.pickupLocation.longitude}&destination=${selectedBooking.tracking.currentLocation.latitude},${selectedBooking.tracking.currentLocation.longitude}`
                                window.open(url, '_blank')
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Open in Maps
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Get directions
                              if (selectedBooking.tracking?.currentLocation) {
                                const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedBooking.pickupLocation.latitude},${selectedBooking.pickupLocation.longitude}&destination=${selectedBooking.tracking.currentLocation.latitude},${selectedBooking.tracking.currentLocation.longitude}`
                                window.open(url, '_blank')
                              }
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Select a booking to view details</p>
                    <p className="text-sm text-gray-500">
                      Click on any booking from the list to see detailed tracking information
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}