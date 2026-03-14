import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'

interface FileUploadResponse {
  success: boolean
  file?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    type: string
    url: string
    path: string
    uploadedBy: string
    createdAt: string
  }
  error?: string
}

interface UploadResult {
  success: boolean
  files?: FileUploadResponse['file'][]
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const uploadedBy = formData.get('uploadedBy') as string
    const type = formData.get('type') as string || 'general'
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    const uploadResults: UploadResult = {
      success: true,
      files: []
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists, which is fine
    }

    // Process each file
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = file.name.split('.').pop()
        const uniqueFilename = `${timestamp}_${randomString}.${extension}`
        
        // Create type-specific directory
        const typeDir = join(uploadsDir, type)
        try {
          await mkdir(typeDir, { recursive: true })
        } catch (error) {
          // Directory already exists, which is fine
        }
        
        // Save file
        const filePath = join(typeDir, uniqueFilename)
        await writeFile(filePath, buffer)
        
        // Determine file type
        const fileType = getFileType(file.type, file.name)
        
        // Create file URL
        const fileUrl = `/uploads/${type}/${uniqueFilename}`
        
        // Save file information to database
        const mediaFile = await db.mediaFile.create({
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          type: fileType,
          url: fileUrl,
          path: filePath,
          alt: '',
          caption: '',
          uploadedBy: uploadedBy || 'anonymous'
        })
        
        uploadResults.files?.push({
          id: mediaFile.id,
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          type: fileType,
          url: fileUrl,
          path: filePath,
          uploadedBy: uploadedBy || 'anonymous',
          createdAt: mediaFile.createdAt.toISOString()
        })
        
      } catch (error) {
        console.error('Error uploading file:', error)
        uploadResults.success = false
        uploadResults.error = `Error uploading ${file.name}: ${error.message}`
      }
    }

    return NextResponse.json(uploadResults)
    
  } catch (error) {
    console.error('Error in file upload API:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause: any = {}

    if (type && type !== 'all') {
      whereClause.type = type
    }

    const files = await db.mediaFile.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            all: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: file.type,
        url: file.url,
        path: file.path,
        alt: file.alt,
        caption: file.caption,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString()
      }))
    })
    
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }

    // Get file information
    const file = await db.mediaFile.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      const fs = require('fs').promises
      await fs.unlink(file.path)
    } catch (error) {
      console.error('Error deleting file from filesystem:', error)
    }

    // Delete file from database
    await db.mediaFile.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { alt, caption } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 })
    }

    // Update file in database
    const file = await db.mediaFile.update({
      where: { id },
      data: {
        alt: alt || '',
        caption: caption || ''
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      file
    })
    
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function to determine file type
function getFileType(mimeType: string, filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  // Image types
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  
  // Video types
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  
  // Audio types
  if (mimeType.startsWith('audio/')) {
    return 'audio'
  }
  
  // Document types
  if (mimeType.includes('pdf') || 
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')) {
    return 'document'
  }
  
  // Image extensions
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
    return 'image'
  }
  
  // Video extensions
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
    return 'video'
  }
  
  // Audio extensions
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension || '')) {
    return 'audio'
  }
  
  // Document extensions
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension || '')) {
    return 'document'
  }
  
  return 'general'
}