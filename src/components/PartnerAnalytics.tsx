'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Calendar,
  Filter,
  Download,
  Eye,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

interface PartnerAnalyticsProps {
  partnerId?: string
}

interface PartnerData {
  id: string
  businessName: string
  email: string
  phone: string
  rating: number
  totalServices: number
  completedServices: number
  revenue: number
  location: {
    address: string
    city: string
    state: string
  }
  joinDate: string
  status: 'active' | 'inactive' | 'suspended'
}

interface ServiceData {
  id: string
  partnerId: string
  partnerName: string
  type: string
  status: string
  revenue: number
  date: string
  location: string
}

export default function PartnerAnalytics({ partnerId }: PartnerAnalyticsProps) {
  const [partners, setPartners] = useState<PartnerData[]>([])
  const [services, setServices] = useState<ServiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock data
  const mockPartners: PartnerData[] = [
    {
      id: '1',
      businessName: 'QuickFix Garage',
      email: 'info@quickfix.com',
      phone: '+1-234-567-8900',
      rating: 4.5,
      totalServices: 150,
      completedServices: 145,
      revenue: 15000,
      location: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY'
      },
      joinDate: '2024-01-01',
      status: 'active'
    },
    {
      id: '2',
      businessName: 'AutoCare Plus',
      email: 'info@autocare.com',
      phone: '+1-234-567-8901',
      rating: 4.2,
      totalServices: 200,
      completedServices: 190,
      revenue: 20000,
      location: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA'
      },
      joinDate: '2024-02-01',
      status: 'active'
    }
  ]

  const mockServices: ServiceData[] = [
    {
      id: '1',
      partnerId: '1',
      partnerName: 'QuickFix Garage',
      type: 'towing',
      status: 'completed',
      revenue: 100,
      date: '2024-01-15',
      location: 'New York, NY'
    },
    {
      id: '2',
      partnerId: '1',
      partnerName: 'QuickFix Garage',
      type: 'mechanic',
      status: 'completed',
      revenue: 150,
      date: '2024-01-16',
      location: 'Brooklyn, NY'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPartners(mockPartners)
      setServices(mockServices)
      setIsLoading(false)
    }, 1000)
  }, [partnerId])

  const totalRevenue = partners.reduce((sum, partner) => sum + partner.revenue, 0)
  const totalServices = partners.reduce((sum, partner) => sum + partner.totalServices, 0)
  const averageRating = partners.length > 0 
    ? partners.reduce((sum, partner) => sum + partner.rating, 0) / partners.length 
    : 0

  const topPartners = partners
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const servicesByType = services.reduce((acc, service) => {
    acc[service.type] = (acc[service.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const revenueByMonth = services.reduce((acc, service) => {
    const month = new Date(service.date).toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + service.revenue
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
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">
                Active partners
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">
                Completed services
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
                Average partner rating
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Partners */}
        <Card>
          <CardHeader>
            <CardTitle>Top Partners by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPartners.map((partner, index) => (
                <div key={partner.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{partner.businessName}</p>
                        <p className="text-sm text-gray-500">{partner.location.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${partner.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{partner.totalServices} services</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(servicesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Partners</span>
            <div className="flex items-center space-x-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
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
                  <th className="text-left p-2">Partner</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Services</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{partner.businessName}</p>
                        <p className="text-sm text-gray-500">{partner.location.city}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <p className="text-sm">{partner.email}</p>
                        <p className="text-sm">{partner.phone}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{partner.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        {partner.completedServices}/{partner.totalServices}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">${partner.revenue.toLocaleString()}</div>
                    </td>
                    <td className="p-2">
                      <Badge className={
                        partner.status === 'active' ? 'bg-green-100 text-green-800' :
                        partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {partner.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
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