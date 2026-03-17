'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Building, 
  Car, 
  ShoppingCart, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Star, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Bell,
  LogOut
} from 'lucide-react'

interface DashboardData {
  overview: {
    totalUsers: number
    totalPartners: number
    totalVehicles: number
    totalOrders: number
    totalBookings: number
    totalPayments: number
    activeUsers: number
    activePartners: number
    completedBookings: number
    completedPayments: number
    totalRevenue: number
  }
  recentActivities: {
    recentUsers: Array<{
      id: string
      name: string
      email: string
      phone: string
      vehiclesCount: number
      createdAt: string
    }>
    recentPartners: Array<{
      id: string
      businessName: string
      email: string
      phone: string
      isVerified: boolean
      isActive: boolean
      rating: number
      mechanicsCount: number
      serviceBookingsCount: number
      createdAt: string
    }>
    recentOrders: Array<{
      id: string
      orderId: string
      totalPrice: number
      status: string
      user: {
        id: string
        name: string
        email: string
      }
      vehicle: {
        id: string
        make: string
        model: string
        licensePlate: string
      }
      paymentStatus: string
      createdAt: string
    }>
    recentBookings: Array<{
      id: string
      serviceType: string
      urgency: string
      status: string
      user: {
        id: string
        name: string
        email: string
      }
      vehicle: {
        id: string
        make: string
        model: string
        licensePlate: string
      }
      partner: {
        id: string
        businessName: string
        phone: string
        rating: number
      }
      createdAt: string
    }>
  }
  analytics: {
    monthlyRevenue: Record<string, number>
    serviceTypeDistribution: Array<{
      serviceType: string
      count: number
    }>
    partnerMetrics: Array<{
      id: string
      businessName: string
      rating: number
      totalBookings: number
      completedBookings: number
      averageRating: number
      isActive: boolean
    }>
    userGrowth: Record<string, number>
  }
}

export default function AdvancedAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.dashboard)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4">Loading dashboard...</span>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-600" />
        <span className="ml-4">Failed to load dashboard data</span>
      </div>
    )
  }

  const { overview, recentActivities, analytics } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(overview.totalUsers)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(overview.activeUsers)} active</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold">{formatNumber(overview.totalPartners)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(overview.activePartners)} active</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(overview.completedPayments)} payments</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{formatNumber(overview.totalBookings)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(overview.completedBookings)} completed</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Monthly Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.monthlyRevenue).map(([month, revenue]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="text-sm font-medium">{formatCurrency(revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Service Type Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.serviceTypeDistribution.map((service) => (
                  <div key={service.serviceType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{service.serviceType}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(service.count / overview.totalBookings) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{service.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Recent Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {recentActivities.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{user.vehiclesCount} vehicles</p>
                        <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Bookings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {recentActivities.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-3 p-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{booking.serviceType}</p>
                        <p className="text-xs text-gray-500">{booking.user.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getUrgencyColor(booking.urgency)}>
                            {booking.urgency}
                          </Badge>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{booking.vehicle.make}</p>
                        <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Top Partners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Top Performing Partners</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Partner</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Rating</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Total Bookings</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Completed</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.partnerMetrics.map((partner) => (
                    <tr key={partner.id} className="border-b">
                      <td className="py-2 px-4">
                        <div>
                          <p className="text-sm font-medium">{partner.businessName}</p>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{partner.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-sm">{partner.totalBookings}</td>
                      <td className="py-2 px-4 text-sm">{partner.completedBookings}</td>
                      <td className="py-2 px-4">
                        <Badge className={partner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {partner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}