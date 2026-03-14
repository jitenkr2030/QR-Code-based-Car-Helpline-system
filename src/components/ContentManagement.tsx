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
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Video, 
  File, 
  Music,
  BarChart3,
  Target,
  Send,
  Globe,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Upload,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ContentPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string
  status: string
  type: string
  tags: string[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
  category: {
    id: string
    name: string
    slug: string
    color: string
  }
  views: number
  likes: number
  shares: number
  comments: number
}

interface ContentCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
  postsCount: number
  createdAt: string
  updatedAt: string
}

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: string
  url: string
  path: string
  alt: string
  caption: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

interface LandingPage {
  id: string
  name: string
  slug: string
  title: string
  description: string
  content: any
  template: string
  status: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  views: number
  conversions: number
  bounceRate: number
}

interface MarketingCampaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  budget: number
  currency: string
  target: any
  content: any
  results: any
  createdBy: string
  createdAt: string
  updatedAt: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  cost: number
  revenue: number
}

interface ContentManagementProps {
  onContentCreated?: (content: any) => void
  onContentUpdated?: (content: any) => void
  onContentDeleted?: (content: any) => void
}

export default function ContentManagement({ 
  onContentCreated, 
  onContentUpdated, 
  onContentDeleted 
}: ContentManagementProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'media' | 'pages' | 'campaigns'>('posts')
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [formType, setFormType] = useState<'post' | 'category' | 'page' | 'campaign'>('post')

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts()
    } else if (activeTab === 'categories') {
      fetchCategories()
    } else if (activeTab === 'media') {
      fetchMediaFiles()
    } else if (activeTab === 'pages') {
      fetchLandingPages()
    } else if (activeTab === 'campaigns') {
      fetchCampaigns()
    }
  }, [activeTab])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content?type=posts')
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content?type=categories')
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

  const fetchMediaFiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content?type=media')
      const data = await response.json()
      
      if (data.success) {
        setMediaFiles(data.mediaFiles)
      }
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLandingPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content?type=pages')
      const data = await response.json()
      
      if (data.success) {
        setLandingPages(data.landingPages)
      }
    } catch (error) {
      console.error('Error fetching landing pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content?type=campaigns')
      const data = await response.json()
      
      if (data.success) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = (type: 'post' | 'category' | 'page' | 'campaign') => {
    setFormType(type)
    setSelectedItem(null)
    setShowCreateForm(true)
  }

  const handleEdit = (item: any, type: 'post' | 'category' | 'page' | 'campaign') => {
    setFormType(type)
    setSelectedItem(item)
    setShowEditForm(true)
  }

  const handleDelete = async (id: string, type: 'post' | 'category' | 'page' | 'campaign') => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/content?type=${type}&id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        if (type === 'posts') {
          fetchPosts()
        } else if (type === 'categories') {
          fetchCategories()
        } else if (type === 'pages') {
          fetchLandingPages()
        } else if (type === 'campaigns') {
          fetchCampaigns()
        }

        if (onContentDeleted) {
          onContentDeleted({ id, type })
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formType,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowCreateForm(false)
        setShowEditForm(false)
        setSelectedItem(null)

        // Refresh the list
        if (formType === 'posts') {
          fetchPosts()
        } else if (formType === 'categories') {
          fetchCategories()
        } else if (formType === 'page') {
          fetchLandingPages()
        } else if (formType === 'campaign') {
          fetchCampaigns()
        }

        if (onContentCreated) {
          onContentCreated(result)
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    }
  }

  const handleFormUpdate = async (data: any) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formType,
          id: selectedItem.id,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowEditForm(false)
        setSelectedItem(null)

        // Refresh the list
        if (formType === 'posts') {
          fetchPosts()
        } else if (formType === 'categories') {
          fetchCategories()
        } else if (formType === 'page') {
          fetchLandingPages()
        } else if (formType === 'campaign') {
          fetchCampaigns()
        }

        if (onContentUpdated) {
          onContentUpdated(result)
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'audio':
        return <Music className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(post => filterStatus === 'all' || post.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your website content, media, and marketing campaigns.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('posts')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Posts
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('categories')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeTab === 'media' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('media')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Media
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pages')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Pages
          </Button>
          <Button
            variant={activeTab === 'campaigns' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('campaigns')}
          >
            <Target className="w-4 h-4 mr-2" />
            Campaigns
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'posts' && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === 'posts') {
              fetchPosts()
            } else if (activeTab === 'categories') {
              fetchCategories()
            } else if (activeTab === 'media') {
              fetchMediaFiles()
            } else if (activeTab === 'pages') {
              fetchLandingPages()
            } else if (activeTab === 'campaigns') {
              fetchCampaigns()
            }
          }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={() => handleCreate(activeTab === 'posts' ? 'post' : activeTab === 'categories' ? 'category' : activeTab === 'pages' ? 'page' : 'campaign')}>
          <Plus className="w-4 h-4 mr-2" />
          Create {activeTab === 'posts' ? 'Post' : activeTab === 'categories' ? 'Category' : activeTab === 'media' ? 'Media' : activeTab === 'pages' ? 'Page' : 'Campaign'}
        </Button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading posts...</span>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post, 'post')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id, 'post')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {post.featuredImage && (
                        <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt || post.content}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                        <div className="flex items-center space-x-4">
                          <span>{post.views} views</span>
                          <span>{post.likes} likes</span>
                          <span>{post.shares} shares</span>
                        </div>
                        {post.category && (
                          <Badge variant="secondary" style={{ backgroundColor: post.category.color + '20' }}>
                            {post.category.name}
                          </Badge>
                        )}
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
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No posts found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first post to get started
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
                          <p className="text-sm text-gray-600">{category.postsCount} posts</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category, 'category')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, 'category')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No categories found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first category to organize your content
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading media files...</span>
            </div>
          ) : mediaFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mediaFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getMediaIcon(file.type)}
                        <div>
                          <h3 className="font-semibold truncate">{file.originalName}</h3>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id, 'media')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {file.type === 'image' && (
                      <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        {file.mimeType} • {formatDate(file.createdAt)}
                      </p>
                      {file.caption && (
                        <p className="text-sm text-gray-600 mt-1">{file.caption}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No media files found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload your first media file to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Landing Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading landing pages...</span>
            </div>
          ) : landingPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {landingPages.map((page) => (
                <Card key={page.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{page.name}</h3>
                          <p className="text-sm text-gray-600">{page.template}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(page, 'page')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page.id, 'page')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{page.title}</h4>
                        <p className="text-sm text-gray-600">{page.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{page.views}</p>
                          <p className="text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{page.conversions}</p>
                          <p className="text-gray-500">Conversions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{(page.bounceRate * 100).toFixed(1)}%</p>
                          <p className="text-gray-500">Bounce Rate</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>/{page.slug}</span>
                        <span>{formatDate(page.createdAt)}</span>
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
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No landing pages found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first landing page to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-4">Loading campaigns...</span>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(campaign, 'campaign')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(campaign.id, 'campaign')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Campaign Period</p>
                          <p className="text-sm">{formatDate(campaign.startDate)} - {campaign.endDate ? formatDate(campaign.endDate) : 'Ongoing'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-sm">{campaign.budget ? `${campaign.currency} ${campaign.budget}` : 'Not set'}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{campaign.sent}</p>
                            <p className="text-gray-500">Sent</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.opened}</p>
                            <p className="text-gray-500">Opened</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.clicked}</p>
                            <p className="text-gray-500">Clicked</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.converted}</p>
                            <p className="text-gray-500">Converted</p>
                          </div>
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
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No campaigns found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first campaign to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Forms */}
      {showCreateForm && (
        <ContentForm
          type={formType}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showEditForm && selectedItem && (
        <ContentForm
          type={formType}
          initialData={selectedItem}
          onSubmit={handleFormUpdate}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}

// Content Form Component
function ContentForm({ 
  type, 
  initialData, 
  onSubmit, 
  onCancel 
}: { 
  type: 'post' | 'category' | 'page' | 'campaign'
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Initialize with default values based on type
      if (type === 'post') {
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          featuredImage: '',
          type: 'blog',
          status: 'draft',
          tags: [],
          seoTitle: '',
          seoDescription: '',
          seoKeywords: ''
        })
      } else if (type === 'category') {
        setFormData({
          name: '',
          description: '',
          icon: '',
          color: '#3B82F6',
          sortOrder: 0
        })
      } else if (type === 'page') {
        setFormData({
          name: '',
          title: '',
          description: '',
          content: {},
          template: 'default',
          status: 'draft',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: ''
        })
      } else if (type === 'campaign') {
        setFormData({
          name: '',
          description: '',
          type: 'email',
          status: 'draft',
          startDate: '',
          endDate: '',
          budget: 0,
          currency: 'INR',
          target: {},
          content: {}
        })
      }
    }
  }, [type, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            Create {type === 'post' ? 'Post' : type === 'category' ? 'Category' : type === 'page' ? 'Landing Page' : 'Campaign'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'post' && (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter post content"
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter post excerpt"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="Enter featured image URL"
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
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {type === 'category' && (
              <>
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="Enter icon emoji"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                      placeholder="Enter sort order"
                    />
                  </div>
                </div>
              </>
            )}

            {type === 'page' && (
              <>
                <div>
                  <Label htmlFor="name">Page Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter page name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter page title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter page description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="landing">Landing</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {type === 'campaign' && (
              <>
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Campaign Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="display">Display</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                      placeholder="Enter budget"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Create'}
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