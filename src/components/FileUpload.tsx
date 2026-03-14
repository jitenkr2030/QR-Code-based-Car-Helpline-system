'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  FolderOpen,
  Clock,
  Calendar
} from 'lucide-react'

interface UploadedFile {
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

interface FileUploadProps {
  userId?: string
  partnerId?: string
  maxFiles?: number
  allowedTypes?: string[]
  onUploadComplete?: (files: UploadedFile[]) => void
  onDelete?: (fileId: string) => void
}

export default function FileUpload({ 
  userId, 
  partnerId, 
  maxFiles = 10, 
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  onUploadComplete,
  onDelete
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      params.append('limit', '50')

      const response = await fetch(`/api/upload?${params}`)
      const data = await response.json()

      if (data.success) {
        setUploadedFiles(data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }, [filterType])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files)
    
    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter(file => {
      return !allowedTypes.some(type => {
        if (type.includes('*')) {
          const mimeType = type.replace('*', '')
          return file.type.includes(mimeType)
        }
        return file.type === type || file.name.toLowerCase().endsWith(type)
      })
    })

    if (invalidFiles.length > 0) {
      alert(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('uploadedBy', userId || partnerId || 'anonymous')
      formData.append('type', 'general')

      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        setUploadProgress(100)
        setIsUploading(false)
      })

      return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.success) {
                  setFiles([])
                  setUploadedFiles(data.files || [])
                  if (onUploadComplete) {
                    onUploadComplete(data.files || [])
                  }
                  resolve(data)
                } else {
                  reject(new Error(data.error || 'Upload failed'))
                }
              } catch (error) {
                reject(error)
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error('Upload failed'))
        }

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

    } catch (error) {
      console.error('Error uploading files:', error)
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
        if (onDelete) {
          onDelete(fileId)
        }
      } else {
        alert(data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreview = (file: UploadedFile) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const handleEdit = (file: UploadedFile) => {
    setEditingFile(file)
  }

  const handleUpdateFile = async (fileId: string, updates: any) => {
    try {
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (data.success) {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId ? { ...file, ...updates } : file
          )
        )
      } else {
        alert(data.error || 'Failed to update file')
      }
    } catch (error) {
      console.error('Error updating file:', error)
      alert('Failed to update file')
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />
      case 'audio':
        return <Music className="w-5 h-5 text-green-600" />
      case 'document':
        return <FileText className="w-5 h-5 text-orange-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredFiles = uploadedFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || file.type === filterType)
  )

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>File Upload</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {files.length} / {maxFiles}
              </Badge>
              {files.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFiles}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="mb-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-500 block">
                      {allowedTypes.join(', ')}
                    </span>
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept={allowedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Selected Files:</div>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.type)}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload {files.length} Files</span>
                  </div>
                )}
              </Button>
              
              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>File Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFiles}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(file)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {file.type === 'image' && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Type: {file.type}</span>
                        <span>Size: {formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Uploaded: {formatDate(file.createdAt)}</span>
                        <span>By: {file.uploadedBy}</span>
                      </div>
                      
                      {file.caption && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">{file.caption}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No files found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm || filterType !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Upload your first file to get started'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(previewFile.type)}
                  <span>{previewFile.originalName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previewFile.type === 'image' && (
                  <div className="w-full">
                    <img
                      src={previewFile.url}
                      alt={previewFile.alt || previewFile.originalName}
                      className="w-full h-auto max-h-[60vh] object-contain"
                    />
                  </div>
                )}
                
                {previewFile.type === 'video' && (
                  <div className="w-full">
                    <video
                      src={previewFile.url}
                      controls
                      className="w-full max-h-[60vh]"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                
                {previewFile.type === 'audio' && (
                  <div className="w-full">
                    <audio
                      src={previewFile.url}
                      controls
                      className="w-full"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {previewFile.type === 'document' && (
                  <div className="w-full">
                    <iframe
                      src={previewFile.url}
                      className="w-full h-[60vh]"
                      title={previewFile.originalName}
                    >
                      Your browser does not support the iframe element.
                    </iframe>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="alt">Alt Text</Label>
                    <Input
                      id="alt"
                      value={previewFile.alt || ''}
                      onChange={(e) => handleUpdateFile(previewFile.id, { alt: e.target.value })}
                      placeholder="Enter alt text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="caption">Caption</Label>
                    <Textarea
                      id="caption"
                      value={previewFile.caption || ''}
                      onChange={(e) => handleUpdateFile(previewFile.id, { caption: e.target.value })}
                      placeholder="Enter caption"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    {formatFileSize(previewFile.size)} • {previewFile.type}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(previewFile.url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}