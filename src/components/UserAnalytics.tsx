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
  UserPlus, 
  UserX, 
  Calendar,
  Download,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface UserAnalyticsProps {
  dateRange?: string
}

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
  vehicles: number
  services: number
  subscription: {
    plan: string
    status: string
    endDate: string
  }
  location: {
    city: string
    state: string
    country: string
  }
  engagement: {
    loginCount: number
    lastActivity: string
    avgSessionDuration: number
  }
}

interface UserActivity {
  id: string
  userId: string
  action: string
  timestamp: string
  metadata: any
}

interface UserSegment {
  name: string
  count: number
  percentage: number
  color: string
  description: string
}

export default function UserAnalytics({ dateRange = '30d' }: UserAnalyticsProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [segments, setSegments] = useState<UserSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data
  const mockUsers: UserData[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-234-567-8900',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-15',
      status: 'active',
      vehicles: 2,
      services: 5,
      subscription: {
        plan: 'Professional',
        status: 'active',
        endDate: '2024-02-01'
      },
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      engagement: {
        loginCount: 25,
        lastActivity: '2024-01-15',
        avgSessionDuration: 15
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-234-567-8901',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-14',
      status: 'active',
      vehicles: 1,
      services: 3,
      subscription: {
        plan: 'Basic',
        status: 'active',
        endDate: '2024-02-05'
      },
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA'
      },
      engagement: {
        loginCount: 15,
        lastActivity: '2024-01-14',
        avgSessionDuration: 10
      }
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1-234-567-8902',
      joinDate: '2023-12-15',
      lastLogin: '2024-01-10',
      status: 'inactive',
      vehicles: 3,
      services: 8,
      subscription: {
        plan: 'Enterprise',
        status: 'cancelled',
        endDate: '2024-01-01'
      },
      location: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA'
      },
      engagement: {
        loginCount: 8,
        lastActivity: '2024-01-10',
        avgSessionDuration: 20
      }
    }
  ]

  const mockActivities: UserActivity[] = [
    {
      id: '1',
      userId: '1',
      action: 'login',
      timestamp: '2024-01-15',
      metadata: { ip: '192.168.1.1', device: 'mobile' }
    },
    {
      id: '2',
      userId: '1',
      action: 'service_booking',
      timestamp: '2024-01-15',
      metadata: { serviceType: 'towing', amount: 100 }
    },
    {
      id: '3',
      userId: '2',
      action: 'login',
      timestamp: '2024-01-14',
      metadata: { ip: '192.168.1.2', device: 'desktop' }
    }
  ]

  const mockSegments: UserSegment[] = [
    {
      name: 'Power Users',
      count: 150,
      percentage: 25,
      color: 'bg-blue-500',
      description: 'Users with 10+ services and high engagement'
    },
    {
      name: 'New Users',
      count: 200,
      percentage: 33,
      color: 'bg-green-500',
      description: 'Users who joined in the last 30 days'
    },
    {
      name: 'Inactive Users',
      count: 80,
      percentage: 13,
      color: 'bg-red-500',
      description: 'Users who haven\'t logged in in 30 days'
    },
    {
      name: 'Premium Users',
      count: 120,
      percentage: 20,
      color: 'bg-purple-500',
      description: 'Users with Professional or Enterprise plans'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers)
      setActivities(mockActivities)
      setSegments(mockSegments)
      setIsLoading(false)
    }, 1000)
  }, [dateRange])

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const inactiveUsers = users.filter(u => u.status === 'inactive').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  const totalVehicles = users.reduce((sum, user) => sum + user.vehicles, 0)
  const totalServices = users.reduce((sum, user) => sum + user.services, 0)
  const averageEngagement = users.length > 0 
    ? users.reduce((sum, user) => sum + user.engagement.loginCount, 0) / users.length 
    : 0

  const newUsers = users.filter(u => {
    const joinDate = new Date(u.joinDate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return joinDate > thirtyDaysAgo
  }).length

  const churnedUsers = users.filter(u => {
    const lastLogin = new Date(u.lastLogin)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastLogin < thirtyDaysAgo
  }).length

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{newUsers} new this month
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((activeUsers / totalUsers) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageEngagement.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Avg. logins per user
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{churnedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Users inactive for 30+ days
              </p>
            </CardContent>
          </Card>
      </div>

      {/* User Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-gray-500">{segment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{segment.count}</p>
                    <p className="text-sm text-gray-500">{segment.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.action === 'login' ? 'bg-green-500' :
                      activity.action === 'service_booking' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        User {activity.userId} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Vehicles</th>
                  <th className="text-left p-2">Services</th>
                  <th className="text-left p-2">Subscription</th>
                  <th className="text-left p-2">Engagement</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <p className="text-sm">{user.phone}</p>
                        <p className="text-sm text-gray-500">{user.location.city}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{user.vehicles}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{user.services}</div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{user.subscription.plan}</p>
                        <p className="text-sm text-gray-500">{user.subscription.status}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <p className="text-sm">{user.engagement.loginCount} logins</p>
                        <p className="text-sm text-gray-500">{user.engagement.avgSessionDuration}min avg</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
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