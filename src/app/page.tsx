'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, MapPin, Wrench, FileText, MessageCircle, AlertTriangle, Clock, Users, Car, Loader2, AlertCircle } from 'lucide-react'
import ServiceBooking from '@/components/ServiceBooking'

interface VehicleInfo {
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
  serviceHistory: Array<{
    id: string
    type: string
    description: string
    mileage: number
    cost: number
    performedBy: string
    notes: string
    serviceDate: string
  }>
  bookings: Array<{
    id: string
    serviceType: string
    description: string
    urgency: string
    status: string
    pickupAddress: string
    createdAt: string
    updatedAt: string
    garage?: {
      id: string
      name: string
      phone: string
      address: string
    }
  }>
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [qrInput, setQrInput] = useState('')

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Set default location (Delhi)
          setUserLocation({
            lat: 28.6139,
            lng: 77.2090
          })
        }
      )
    } else {
      // Set default location if geolocation is not available
      setUserLocation({
        lat: 28.6139,
        lng: 77.2090
      })
    }
  }, [])

  const handleQRScan = async () => {
    setIsScanning(true)
    setScanError(null)
    
    try {
      // Simulate QR code scanning (in real app, this would use camera API)
      // For demo, we'll use a predefined QR code
      const demoQRCode = 'QR-CAR-ABC1234-1705488000000-A1B2C3'
      
      // Call API to get vehicle by QR code
      const response = await fetch(`/api/vehicles/qr/${demoQRCode}`)
      const data = await response.json()
      
      if (data.success) {
        setVehicleInfo(data.vehicle)
        setActiveTab('dashboard')
      } else {
        setScanError(data.error || 'Vehicle not found')
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      setScanError('Failed to scan QR code. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualQRInput = async () => {
    if (!qrInput.trim()) {
      setScanError('Please enter a QR code')
      return
    }
    
    setIsScanning(true)
    setScanError(null)
    
    try {
      const response = await fetch(`/api/vehicles/qr/${qrInput.trim()}`)
      const data = await response.json()
      
      if (data.success) {
        setVehicleInfo(data.vehicle)
        setActiveTab('dashboard')
        setQrInput('')
      } else {
        setScanError(data.error || 'Vehicle not found')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      setScanError('Failed to fetch vehicle information. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleEmergencyCall = async (type: string) => {
    if (!vehicleInfo || !userLocation) {
      alert('Please scan QR code first and enable location services')
      return
    }

    try {
      const bookingData = {
        serviceType: type,
        description: `Emergency ${type} requested for vehicle ${vehicleInfo.licensePlate}`,
        urgency: 'emergency',
        vehicleId: vehicleInfo.id,
        userId: vehicleInfo.owner.id,
        pickupAddress: 'Current location',
        latitude: userLocation.lat,
        longitude: userLocation.lng
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Emergency ${type} requested successfully! ${data.booking.assignedPartner ? `Partner: ${data.booking.assignedPartner.garageName} will arrive in ${data.booking.assignedPartner.estimatedArrival}` : 'We will find the nearest available partner.'}`)
      } else {
        alert(`Failed to request emergency ${type}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error requesting emergency service:', error)
      alert(`Failed to request emergency ${type}. Please try again.`)
    }
  }

  if (!vehicleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Car Helpline QR</h1>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                24/7 Support
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Scan QR Code for Help
              </CardTitle>
              <p className="text-gray-600">
                Quick access to roadside assistance and vehicle services
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter QR Code
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter QR code (e.g., QR-CAR-ABC1234-...)"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualQRInput()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleManualQRInput}
                      disabled={isScanning}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm text-gray-500">
                    <span>OR</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleQRScan}
                  disabled={isScanning}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                >
                  {isScanning ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Scanning...</span>
                    </div>
                  ) : (
                    'Scan QR Code'
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {scanError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{scanError}</p>
                  </div>
                </div>
              )}

              {/* Demo QR Code */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Demo QR Code:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                  QR-CAR-ABC1234-1705488000000-A1B2C3
                </code>
                <p className="text-xs text-blue-600 mt-2">
                  Use this code to test the system
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Live Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="bg-white border-t py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
            <p>© 2024 Car Helpline QR. Emergency roadside assistance available 24/7</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vehicle Dashboard</h1>
                <p className="text-sm text-gray-500">{vehicleInfo.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
              {userLocation && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location Active
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="booking">Service Booking</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Car className="w-5 h-5" />
                      <span>Vehicle Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Make</p>
                        <p className="font-semibold">{vehicleInfo.make}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Model</p>
                        <p className="font-semibold">{vehicleInfo.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-semibold">{vehicleInfo.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Plate</p>
                        <p className="font-semibold">{vehicleInfo.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Owner</p>
                        <p className="font-semibold">{vehicleInfo.owner.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Insurance</p>
                        <p className="font-semibold">{vehicleInfo.insuranceCompany}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Emergency Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        onClick={() => handleEmergencyCall('towing')}
                        className="bg-red-600 hover:bg-red-700 text-white flex flex-col items-center space-y-2 py-4"
                      >
                        <Wrench className="w-6 h-6" />
                        <span>Towing</span>
                      </Button>
                      <Button 
                        onClick={() => handleEmergencyCall('mechanic')}
                        className="bg-red-600 hover:bg-red-700 text-white flex flex-col items-center space-y-2 py-4"
                      >
                        <Wrench className="w-6 h-6" />
                        <span>Mechanic</span>
                      </Button>
                      <Button 
                        onClick={() => handleEmergencyCall('fuel')}
                        className="bg-red-600 hover:bg-red-700 text-white flex flex-col items-center space-y-2 py-4"
                      >
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                        <span>Fuel</span>
                      </Button>
                      <Button 
                        onClick={() => handleEmergencyCall('accident')}
                        className="bg-red-600 hover:bg-red-700 text-white flex flex-col items-center space-y-2 py-4"
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <span>Accident</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Helpline
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Live Chat
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('booking')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Find Nearby Garage
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('booking')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Book Service
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Support Team</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">24/7 Support</p>
                          <p className="text-sm text-gray-500">Always available</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Expert Mechanics</p>
                          <p className="text-sm text-gray-500">Certified professionals</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="booking" className="mt-6">
            <ServiceBooking 
              vehicleInfo={vehicleInfo}
              userLocation={userLocation}
              userId={vehicleInfo.owner.id}
            />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Service History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicleInfo.serviceHistory && vehicleInfo.serviceHistory.length > 0 ? (
                    vehicleInfo.serviceHistory.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{service.type}</p>
                          <p className="text-sm text-gray-500">{service.serviceDate}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{service.mileage} km</p>
                          {service.cost && (
                            <p className="text-sm font-medium">₹{service.cost}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No service history available</p>
                      <p className="text-sm">Your service records will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="support" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">24/7 Helpline</p>
                    <p className="text-2xl font-bold text-red-600">1-800-CAR-HELP</p>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Call Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Live Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Chat with our support team for immediate assistance.</p>
                  <Button className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>© 2024 Car Helpline QR. Emergency roadside assistance available 24/7</p>
        </div>
      </footer>
    </div>
  )
}