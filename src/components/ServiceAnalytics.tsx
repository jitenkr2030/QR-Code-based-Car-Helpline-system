'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wrench, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  MapPin,
  Filter,
  Download
} from 'lucide-react'

interface ServiceAnalyticsProps {
  dateRange?: string
}

interface ServiceData {
  id: string
  type: string
  status: string
  priority: string
  partnerId: string
  partnerName: string
  userId: string
  userName: string
  location: string
  createdAt: string
  completedAt?: string
  revenue: number
  duration?: number
  rating?: number
}

interface ServiceTypeData {
  type: string
  count: number
  revenue: number
  averageRating: number
  completionTime: number
  status: string
}

export default function ServiceAnalytics({ dateRange = '30d' }: ServiceAnalyticsProps) {
  const [services, setServices] = useState<ServiceData[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  const mockServices: ServiceData[] = [
    {
      id: '1',
      type: 'towing',
      status: 'completed',
      priority: 'high',
      partnerId: '1',
      partnerName: 'QuickFix Garage',
      userId: 'user1',
      userName: 'John Doe',
      location: 'New York, NY',
      createdAt: '2024-01-15',
      completedAt: '2024-01-15',
      revenue: 100,
      duration: 45,
      rating: 4.5
    },
    {
      id: '2',
      type: 'mechanic',
      status: 'in_progress',
      priority: 'medium',
      partnerId: '2',
      partnerName: 'AutoCare Plus',
      userId: 'user2',
      userName: 'Jane Smith',
      location: 'Los Angeles, CA',
      createdAt: '2024-01-16',
      revenue: 150,
      rating: null
    },
    {
      id: '3',
      type: 'fuel',
      status: 'pending',
      priority: 'low',
      partnerId: '1',
      partnerName: 'QuickFix Garage',
      userId: 'user3',
      userName: 'Bob Johnson',
      location: 'Chicago, IL',
      createdAt: '2024-01-17',
      revenue: 50,
      rating: null
    }
  ]

  const mockServiceTypes: ServiceTypeData[] = [
    {
      type: 'towing',
      count: 150,
      revenue: 15000,
      averageRating: 4.2,
      completionTime: 45,
      status: 'completed'
    },
    {
      type: 'mechanic',
      count: 200,
      revenue: 30000,
      averageRating: 4.5,
      completionTime: 60,
      status: 'completed'
    },
    {
      type: 'fuel',
      count: 80,
      revenue: 4000,
      averageRating: 4.0,
      completionTime: 30,
      status: 'completed'
    },
    {
      type: 'accident',
      count: 30,
      revenue: 9000,
      averageRating: 4.8,
      completionTime: 120,
      status: 'completed'
    },
    {
      type: 'lockout',
      count: 40,
      revenue: 2000,
      averageRating: 3.8,
      completionTime: 25,
      status: 'completed'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setServices(mockServices)
      setServiceTypes(mockServiceTypes)
      setIsLoading(false)
    }, 1000)
  }, [dateRange])

  const totalServices = services.length
  const completedServices = services.filter(s => s.status === 'completed').length
  const pendingServices = services.filter(s => s.status === 'pending').length
  const inProgressServices = services.filter(s => s.status === 'in_progress').length
  const cancelledServices = services.filter(s => s.status === 'cancelled').length

  const totalRevenue = services.reduce((sum, service) => sum + service.revenue, 0)
  const averageRating = services
    .filter(s => s.rating !== null)
    .reduce((sum, service) => sum + (service.rating || 0), 0) / 
    services.filter(s => s.rating !== null).length || 0

  const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 0

  const servicesByType = services.reduce((acc, service) => {
    acc[service.type] = (acc[service.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const servicesByStatus = services.reduce((acc, service) => {
    acc[service.status] = (acc[service.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const servicesByPriority = services.reduce((acc, service) => {
    acc[service.priority] = (acc[service.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">
                All time services
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {completedServices} completed
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all services
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Service Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Services by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium capitalize">{type.type}</p>
                      <p className="text-sm text-gray-500">{type.count} services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${type.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{type.averageRating.toFixed(1)} avg rating</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(servicesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium capitalize">{status}</p>
                      <p className="text-sm text-gray-500">{count} services</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Service Details</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Partner</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium capitalize">{service.type}</p>
                        <p className="text-sm text-gray-500">{service.location}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{service.userName}</p>
                        <p className="text-sm text-gray-500">{service.userId}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{service.partnerName}</p>
                        <p className="text-sm text-gray-500">{service.partnerId}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={
                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                        service.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {service.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={
                        service.priority === 'high' ? 'bg-red-100 text-red-800' :
                        service.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {service.priority}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">${service.revenue}</div>
                    </td>
                    <td className="p-2">
                      {service.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{service.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      {service.duration ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{service.duration} min</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}