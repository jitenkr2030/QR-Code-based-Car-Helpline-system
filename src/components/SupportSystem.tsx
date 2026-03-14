'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Building, 
  Calendar, 
  Paperclip, 
  Send, 
  Reply,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Settings,
  Tag,
  Flag,
  Archive
} from 'lucide-react'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  type: string
  tags: string[]
  attachments: string[]
  createdAt: string
  updatedAt: string
  resolvedAt: string
  closedAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  partner: {
    id: string
    businessName: string
    email: string
    phone: string
  }
  assignedUser: {
    id: string
    name: string
    email: string
    role: string
  }
  category: {
    id: string
    name: string
    color: string
    icon: string
  }
  responsesCount: number
  lastResponse: any
}

interface SupportCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
  ticketsCount: number
  createdAt: string
  updatedAt: string
}

interface SupportResponse {
  id: string
  content: string
  isInternal: boolean
  attachments: string[]
  createdAt: string
  updatedAt: string
  responder: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface SupportKB {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  isPublished: boolean
  viewCount: number
  helpfulCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface SupportSystemProps {
  userId?: string
  partnerId?: string
  onTicketCreated?: (ticket: any) => void
  onTicketUpdated?: (ticket: any) => void
  onTicketResolved?: (ticket: any) => void
}

export default function SupportSystem({ 
  userId, 
  partnerId, 
  onTicketCreated, 
  onTicketUpdated, 
  onTicketResolved 
}: SupportSystemProps) {
  const [activeTab, setActiveTab] = useState<'tickets' | 'categories' | 'kb' | 'responses'>('tickets')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [categories, setCategories] = useState<SupportCategory[]>([])
  const [kbArticles, setKBArticles] = useState<SupportKB[]>([])
  const [responses, setResponses] = useState<SupportResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [selectedKB, setSelectedKB] = useState<SupportKB | null>(null)

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets()
    } else if (activeTab === 'categories') {
      fetchCategories()
    } else if (activeTab === 'kb') {
      fetchKBArticles()
    } else if (activeTab === 'responses') {
      fetchResponses()
    }
  }, [activeTab])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (partnerId) params.append('partnerId', partnerId)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterPriority !== 'all') params.append('priority', filterPriority)
      if (filterCategory !== 'all') params.append('categoryId', filterCategory)

      const response = await fetch(`/api/support?type=tickets&${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/support?type=categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKBArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/support?type=kb')
      const data = await response.json()
      
      if (data.success) {
        setKBArticles(data.articles)
      }
    } catch (error) {
      console.error('Error fetching KB articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchResponses = async () => {
    if (!selectedTicket) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/support?type=responses&id=${selectedTicket.id}`)
      const data = await response.json()
      
      if (data.success) {
        setResponses(data.responses)
      }
    } catch (error) {
      console.error('Error fetching responses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTicket = async (data: any) => {
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ticket',
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowCreateForm(false)
        fetchTickets()
        if (onTicketCreated) {
          onTicketCreated(result.ticket)
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket')
    }
  }

  const handleCreateResponse = async (data: any) => {
    if (!selectedTicket) return

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'response',
          ticketId: selectedTicket.id,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowResponseForm(false)
        fetchTickets()
        fetchResponses()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error creating response:', error)
      alert('Failed to create response')
    }
  }

  const handleUpdateTicket = async (id: string, data: any) => {
    try {
      const response = await fetch('/api/support', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ticket',
          id,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        fetchTickets()
        if (onTicketUpdated) {
          onTicketUpdated(result.ticket)
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      alert('Failed to update ticket')
    }
  }

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setShowResponseForm(false)
    fetchResponses()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <HelpCircle className="w-4 h-4 text-gray-600" />
      case 'technical':
        return <Settings className="w-4 h-4 text-blue-600" />
      case 'billing':
        return <Flag className="w-4 h-4 text-green-600" />
      case 'feature_request':
        return <Plus className="w-4 h-4 text-purple-600" />
      case 'bug_report':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'complaint':
        return <MessageSquare className="w-4 h-4 text-orange-600" />
      default:
        return <HelpCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(ticket => filterStatus === 'all' || ticket.status === filterStatus)
    .filter(ticket => filterPriority === 'all' || ticket.priority === filterPriority)
    .filter(ticket => filterCategory === 'all' || ticket.category?.id === filterCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support System</h1>
          <p className="text-gray-600 mt-2">
            Manage support tickets, knowledge base, and customer service.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === 'tickets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tickets')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Tickets
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('categories')}
          >
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeTab === 'kb' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('kb')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Knowledge Base
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'tickets' && (
          <div className="flex space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === 'tickets') {
              fetchTickets()
            } else if (activeTab === 'categories') {
              fetchCategories()
            } else if (activeTab === 'kb') {
              fetchKBArticles()
            }
          }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Button */}
      {activeTab === 'tickets' && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading tickets...</span>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(ticket.type)}
                        <div>
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600">#{ticket.ticketNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{ticket.user ? ticket.user.name : ticket.partner?.businessName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>

                      {ticket.assignedUser && (
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Assigned to: {ticket.assignedUser.name}</span>
                        </div>
                      )}

                      {ticket.category && (
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4" style={{ color: ticket.category.color }} />
                          <span className="text-sm">{ticket.category.name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{ticket.responsesCount} responses</span>
                          {ticket.lastResponse && (
                            <span>Last: {formatDate(ticket.lastResponse.createdAt)}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTicket(ticket)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket)
                              setShowResponseForm(true)
                            }}
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No support tickets found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first ticket to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading categories...</span>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                            <span className="text-sm">{category.icon}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.ticketsCount} tickets</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No categories found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first category to organize tickets
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading knowledge base...</span>
            </div>
          ) : kbArticles.length > 0 ? (
            <div className="space-y-4">
              {kbArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-gray-600">{article.excerpt}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{article.viewCount} views</span>
                        <span className="text-sm text-gray-500">{article.helpfulCount} helpful</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKB(article)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No knowledge base articles found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first article to build the knowledge base
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Forms */}
      {showCreateForm && (
        <TicketForm
          categories={categories}
          onSubmit={handleCreateTicket}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showResponseForm && selectedTicket && (
        <ResponseForm
          ticket={selectedTicket}
          onSubmit={handleCreateResponse}
          onCancel={() => setShowResponseForm(false)}
        />
      )}
    </div>
  )
}

// Ticket Form Component
function TicketForm({ 
  categories, 
  onSubmit, 
  onCancel 
}: { 
  categories: SupportCategory[]
  onSubmit: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'general',
    priority: 'normal',
    categoryId: '',
    tags: [],
    attachments: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter ticket subject"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your issue in detail"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Ticket
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Response Form Component
function ResponseForm({ 
  ticket, 
  onSubmit, 
  onCancel 
}: { 
  ticket: SupportTicket
  onSubmit: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    content: '',
    isInternal: false,
    attachments: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Reply className="w-5 h-5" />
            <span>Response to #{ticket.ticketNumber}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{ticket.subject}</h4>
              <p className="text-sm text-gray-600">{ticket.description}</p>
            </div>

            <div>
              <Label htmlFor="content">Response</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your response"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isInternal"
                checked={formData.isInternal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isInternal: checked }))}
              />
              <Label htmlFor="isInternal">Internal Note (not visible to customer)</Label>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                Send Response
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}