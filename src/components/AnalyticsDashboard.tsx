'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  Car, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
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
  growth: {
    userGrowth: number
    partnerGrowth: number
    orderGrowth: number
    bookingGrowth: number
  }
  revenue: {
    totalRevenue: number
    revenueByPeriod: Array<{ date: string; revenue: number }>
    revenueByMethod: Array<{ method: string; revenue: number }>
    revenueByService: Array<{ serviceType: string; count: number; avgRevenue: number }>
    avgOrderValue: number
    topRevenueSources: Array<{ orderId: string; revenue: number }>
  }
  users: {
    totalUsers: number
    userRegistrations: Array<{ date: string; count: number }>
    activeUsers: number
    avgVehiclesPerUser: number
    avgOrdersPerUser: number
    avgBookingsPerUser: number
    userActivity: {
      totalVehicles: number
      totalOrders: number
      totalBookings: number
    }
  }
  partners: {
    totalPartners: number
    partnerRegistrations: Array<{ date: string; count: number }>
    activePartners: number
    avgRating: number
    avgMechanicsPerPartner: number
    avgBookingsPerPartner: number
    topPerformers: Array<{
      id: string
      businessName: string
      rating: number
      totalBookings: number
      totalEarnings: number
    }>
    partnerStats: {
      totalMechanics: number
      totalBookings: number
      totalEarnings: number
    }
  }
  services: {
    totalBookings: number
    serviceBookings: Array<{ date: string; count: number }>
    serviceTypeDistribution: Array<{ serviceType: string; count: number }>
    statusDistribution: Array<{ status: string; count: number }>
    urgencyDistribution: Array<{ urgency: string; count: number }>
    performance: {
      avgResponseTime: number
      avgServiceTime: number
      completionRate: number
    }
  }
}

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?type=${selectedType}&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalyticsData()
    setIsRefreshing(false)
  }

  const handleExportData = () => {
    if (analyticsData) {
      const dataStr = JSON.stringify(analyticsData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
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

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4">Loading analytics...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-600" />
        <span className="ml-4">Failed to load analytics data</span>
      </div>
    )
  }

  const { overview, growth, revenue, users, partners, services } = analyticsData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(overview.totalUsers)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getGrowthIcon(growth.userGrowth)}
                  <span className={`text-sm ${getGrowthColor(growth.userGrowth)}`}>
                    {growth.userGrowth > 0 ? '+' : ''}{growth.userGrowth.toFixed(1)}%
                  </span>
                </div>
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
                <div className="flex items-center space-x-2 mt-1">
                  {getGrowthIcon(growth.partnerGrowth)}
                  <span className={`text-sm ${getGrowthColor(growth.partnerGrowth)}`}>
                    {growth.partnerGrowth > 0 ? '+' : ''}{growth.partnerGrowth.toFixed(1)}%
                  </span>
                </div>
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
                <div className="flex items-center space-x-2 mt-1">
                  {getGrowthIcon(growth.orderGrowth)}
                  <span className={`text-sm ${getGrowthColor(growth.orderGrowth)}`}>
                    {growth.orderGrowth > 0 ? '+' : ''}{growth.orderGrowth.toFixed(1)}%
                  </span>
                </div>
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
                <div className="flex items-center space-x-2 mt-1">
                  {getGrowthIcon(growth.bookingGrowth)}
                  <span className={`text-sm ${getGrowthColor(growth.bookingGrowth)}`}>
                    {growth.bookingGrowth > 0 ? '+' : ''}{growth.bookingGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Revenue Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-lg font-bold">{formatCurrency(revenue.totalRevenue)}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Revenue by Payment Method</p>
                {revenue.revenueByMethod.map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{method.method}</span>
                    <span className="text-sm font-medium">{formatCurrency(method.revenue)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Revenue by Service Type</p>
                {revenue.revenueByService.slice(0, 3).map((service) => (
                  <div key={service.serviceType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{service.serviceType}</span>
                    <span className="text-sm font-medium">{formatCurrency(service.avgRevenue)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Average Order Value</p>
                <span className="text-lg font-bold">{formatCurrency(revenue.avgOrderValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Service Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Bookings</span>
                <span className="text-lg font-bold">{formatNumber(services.totalBookings)}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Service Type Distribution</p>
                {services.serviceTypeDistribution.map((service) => (
                  <div key={service.serviceType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{service.serviceType}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(service.count / services.totalBookings) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{service.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Performance Metrics</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium">{services.performance.avgResponseTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Service Time</span>
                    <span className="text-sm font-medium">{services.performance.avgServiceTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium">{services.performance.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User and Partner Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-lg font-bold">{formatNumber(users.totalUsers)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-lg font-bold">{formatNumber(users.activeUsers)}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">User Activity</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Vehicles/User</span>
                    <span className="text-sm font-medium">{users.avgVehiclesPerUser.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Orders/User</span>
                    <span className="text-sm font-medium">{users.avgOrdersPerUser.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Bookings/User</span>
                    <span className="text-sm font-medium">{users.avgBookingsPerUser.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Partner Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Partners</span>
                <span className="text-lg font-bold">{formatNumber(partners.totalPartners)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Partners</span>
                <span className="text-lg font-bold">{formatNumber(partners.activePartners)}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Partner Statistics</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <span className="text-sm font-medium">{partners.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Mechanics/Partner</span>
                    <span className="text-sm font-medium">{partners.avgMechanicsPerPartner.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Bookings/Partner</span>
                    <span className="text-sm font-medium">{partners.avgBookingsPerPartner.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Top Performers</p>
                <div className="space-y-2">
                  {partners.topPerformers.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{partner.businessName}</span>
                      <span className="text-sm font-medium">{formatCurrency(partner.totalEarnings)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}