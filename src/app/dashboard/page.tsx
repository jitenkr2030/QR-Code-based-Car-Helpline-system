'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Car, 
  Plus, 
  ShoppingCart, 
  Package, 
  User, 
  LogOut, 
  QrCode, 
  History,
  Settings,
  Phone,
  Mail,
  MapPin,
  Eye,
  Loader2
} from 'lucide-react'
import QRCodeOrdering from '@/components/QRCodeOrdering'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  mileage: number
  qrCode: string
  createdAt: string
}

interface Order {
  id: string
  orderId: string
  qrType: string
  quantity: number
  totalPrice: number
  status: string
  orderDate: string
  deliveryMethod: string
  vehicle: {
    make: string
    model: string
    year: number
    licensePlate: string
  }
  qrCodes: {
    id: string
    qrCode: string
    status: string
  }[]
}

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      // Redirect to login if no user found
      window.location.href = '/register'
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserVehicles()
      fetchUserOrders()
    }
  }, [user])

  const fetchUserVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/register'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Car Helpline</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">
            Manage your vehicles and QR code orders from here.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                      <p className="text-2xl font-bold">{vehicles.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active QR Codes</p>
                      <p className="text-2xl font-bold">{vehicles.filter(v => v.qrCode).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ₹{orders.reduce((sum, order) => sum + order.totalPrice, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('vehicles')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/order'}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order QR Code
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Test QR Code
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No orders yet</p>
                      <Button 
                        onClick={() => window.location.href = '/order'}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Order QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{order.orderId}</p>
                            <p className="text-xs text-gray-500">{order.vehicle.make} {order.vehicle.model}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <Button 
                          onClick={() => setActiveTab('orders')}
                          variant="outline"
                          className="w-full"
                        >
                          View All Orders
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="vehicles" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
              <Button 
                onClick={() => window.location.href = '/order'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
            
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
                <p className="text-gray-600 mb-6">Add your first vehicle to get started with QR code ordering.</p>
                <Button 
                  onClick={() => window.location.href = '/order'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Vehicle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                        {vehicle.qrCode && (
                          <Badge variant="secondary" className="text-xs">
                            <QrCode className="w-3 h-3 mr-1" />
                            QR Code
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Year:</span> {vehicle.year}</p>
                        <p><span className="font-medium">License:</span> {vehicle.licensePlate}</p>
                        <p><span className="font-medium">Color:</span> {vehicle.color}</p>
                        <p><span className="font-medium">Mileage:</span> {vehicle.mileage} km</p>
                        {vehicle.qrCode && (
                          <p><span className="font-medium">QR Code:</span> {vehicle.qrCode}</p>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        {!vehicle.qrCode && (
                          <Button 
                            onClick={() => window.location.href = '/order'}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            Order QR
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
              <Button 
                onClick={() => window.location.href = '/order'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Place your first QR code order to get started.</p>
                <Button 
                  onClick={() => window.location.href = '/order'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Place Order
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{order.orderId}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Vehicle:</p>
                              <p className="text-gray-600">{order.vehicle.make} {order.vehicle.model}</p>
                              <p className="text-gray-600">{order.vehicle.year} • {order.vehicle.licensePlate}</p>
                            </div>
                            <div>
                              <p className="font-medium">Order Details:</p>
                              <p className="text-gray-600">Type: {order.qrType}</p>
                              <p className="text-gray-600">Quantity: {order.quantity}</p>
                              <p className="text-gray-600">Total: ₹{order.totalPrice}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="font-medium text-sm">Delivery:</p>
                            <p className="text-gray-600 text-sm">{order.deliveryMethod}</p>
                            <p className="text-gray-600 text-sm">{order.deliveryAddress}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">₹{order.totalPrice}</p>
                          <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {order.qrCodes.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="font-medium text-sm mb-2">QR Codes ({order.qrCodes.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {order.qrCodes.map((qrCode) => (
                              <Badge key={qrCode.id} variant="outline" className="text-xs">
                                {qrCode.qrCode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Name</Label>
                    <p className="text-sm text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    <p className="text-sm text-gray-900">{user?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <p className="text-sm text-gray-900">{user?.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}