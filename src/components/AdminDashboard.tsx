'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Car, 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  Loader2,
  Filter,
  Search
} from 'lucide-react'

interface ServiceRequest {
  id: string
  serviceType: string
  description: string
  urgency: string
  status: string
  pickupAddress: string
  latitude: number
  longitude: number
  preferredDate?: string
  preferredTime?: string
  estimatedArrival?: string
  createdAt: string
  updatedAt: string
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    owner: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  garage?: {
    id: string
    name: string
    phone: string
    address: string
  }
  assignedPartner?: {
    garageId: string
    garageName: string
    garagePhone: string
    garageAddress: string
    mechanicId: string
    mechanicName: string
    mechanicPhone: string
    distance: number
    estimatedArrival: string
  }
}

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  completedRequests: number
  emergencyRequests: number
  totalVehicles: number
  totalUsers: number
  totalGarages: number
  averageResponseTime: number
  completionRate: number
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    emergencyRequests: 0,
    totalVehicles: 0,
    totalUsers: 0,
    totalGarages: 0,
    averageResponseTime: 0,
    completionRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch requests
      const requestsResponse = await fetch('/api/bookings')
      const requestsData = await requestsResponse.json()
      
      if (requestsData.success) {
        setRequests(requestsData.bookings)
      }

      // Calculate stats
      const totalRequests = requestsData.bookings?.length || 0
      const pendingRequests = requestsData.bookings?.filter(r => r.status === 'pending').length || 0
      const inProgressRequests = requestsData.bookings?.filter(r => r.status === 'in_progress').length || 0
      const completedRequests = requestsData.bookings?.filter(r => r.status === 'completed').length || 0
      const emergencyRequests = requestsData.bookings?.filter(r => r.urgency === 'emergency').length || 0

      // Fetch vehicles count
      const vehiclesResponse = await fetch('/api/vehicles')
      const vehiclesData = await vehiclesResponse.json()
      const totalVehicles = vehiclesData.vehicles?.length || 0

      // Fetch users count
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      const totalUsers = usersData.users?.length || 0

      // Fetch garages count
      const garagesResponse = await fetch('/api/garages')
      const garagesData = await garagesResponse.json()
      const totalGarages = garagesData.garages?.length || 0

      setStats({
        totalRequests,
        pendingRequests,
        inProgressRequests,
        completedRequests,
        emergencyRequests,
        totalVehicles,
        totalUsers,
        totalGarages,
        averageResponseTime: 15, // Calculate from real data
        completionRate: totalRequests > 0 ? (completedRequests / totalRequests * 100) : 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus } : req
        ))
        
        // Refresh stats
        fetchDashboardData()
      } else {
        console.error('Error updating request status:', data.error)
      }
    } catch (error) {
      console.error('Error updating request status:', error)
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
        return <Users className="w-4 h-4" />
      case 'in_progress':
        return <Activity className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'towing':
        return <Car className="w-4 h-4 text-blue-600" />
      case 'mechanic':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'fuel':
        return <div className="w-4 h-4 bg-green-600 rounded-full" />
      case 'accident':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'lockout':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter
    const matchesSearch = searchTerm === '' || 
      request.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesUrgency && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgressRequests}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedRequests}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicles</p>
                <p className="text-lg font-bold">{stats.totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-lg font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Garages</p>
                <p className="text-lg font-bold">{stats.totalGarages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency</p>
                <p className="text-lg font-bold text-red-600">{stats.emergencyRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Service Requests</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Urgency</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Urgency</th>
                  <th className="text-left p-2">Vehicle</th>
                  <th className="text-left p-2">Owner</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <span className="text-sm font-mono">{request.id.substring(0, 8)}...</span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(request.serviceType)}
                        <span className="text-sm capitalize">{request.serviceType}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p className="font-medium">{request.vehicle.make} {request.vehicle.model}</p>
                        <p className="text-gray-500">{request.vehicle.licensePlate}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p className="font-medium">{request.vehicle.owner.name}</p>
                        <p className="text-gray-500">{request.vehicle.owner.phone}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p className="text-gray-600">{request.pickupAddress}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(request.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{request.status.replace('_', ' ')}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'assigned')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Assign
                          </Button>
                        )}
                        
                        {request.status === 'assigned' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Start
                          </Button>
                        )}
                        
                        {request.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Type</p>
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(selectedRequest.serviceType)}
                    <span className="capitalize">{selectedRequest.serviceType}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgency</p>
                  <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                    {selectedRequest.urgency}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(selectedRequest.status)}
                      <span>{selectedRequest.status.replace('_', ' ')}</span>
                    </span>
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                <p className="text-sm">{selectedRequest.description || 'No description provided'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Pickup Address</p>
                <p className="text-sm">{selectedRequest.pickupAddress}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vehicle</p>
                  <div className="text-sm">
                    <p className="font-medium">{selectedRequest.vehicle.make} {selectedRequest.vehicle.model}</p>
                    <p className="text-gray-500">{selectedRequest.vehicle.licensePlate}</p>
                    <p className="text-gray-500">{selectedRequest.vehicle.year}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Owner</p>
                  <div className="text-sm">
                    <p className="font-medium">{selectedRequest.vehicle.owner.name}</p>
                    <p className="text-gray-500">{selectedRequest.vehicle.owner.phone}</p>
                    <p className="text-gray-500">{selectedRequest.vehicle.owner.email}</p>
                  </div>
                </div>
              </div>
              
              {selectedRequest.assignedPartner && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Assigned Partner</p>
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    <p className="font-medium">{selectedRequest.assignedPartner.garageName}</p>
                    <p className="text-gray-500">{selectedRequest.assignedPartner.garageAddress}</p>
                    <p className="text-gray-500">{selectedRequest.assignedPartner.garagePhone}</p>
                    <p className="text-gray-500">Distance: {selectedRequest.assignedPartner.distance} km</p>
                    <p className="text-gray-500">ETA: {selectedRequest.assignedPartner.estimatedArrival}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}