import { NextRequest, NextResponse } from 'next/server'
import { validateInput, validateInputAsync, ValidationError } from '@/lib/validation'
import { db } from '@/lib/db'
import { handleValidationError } from '@/lib/middleware/validation'

// Validate any input data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schema, data, options = {} } = body

    if (!schema || !data) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Schema and data are required' 
        },
        { status: 400 }
      )
    }

    // Parse schema from string
    let parsedSchema
    try {
      parsedSchema = JSON.parse(schema)
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Invalid schema format' 
        },
        { status: 400 }
      )
    }

    // Validate input
    const validationResult = validateInput(parsedSchema, data)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: validationResult.error,
        validatedData: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Input validated successfully',
      validatedData: validationResult.data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return handleValidationError(error)
  }
}

// Validate file upload
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const { schema, options = {} } = Object.fromEntries(formData)

    if (!file) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'File is required' 
        },
        { status: 400 }
      )
    }

    // Parse schema from string
    let parsedSchema
    try {
      parsedSchema = JSON.parse(schema as string)
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Invalid schema format' 
        },
        { status: 400 }
      )
    }

    // Create file validation schema
    const fileSchema = {
      name: typeof parsedSchema.name === 'string' ? { min: 1, max: 255 } : undefined,
      size: typeof parsedSchema.size === 'number' ? { max: parsedSchema.size } : undefined,
      type: typeof parsedSchema.type === 'string' ? { regex: new RegExp(parsedSchema.type) } : undefined,
      lastModified: typeof parsedSchema.lastModified === 'number' ? {} : undefined
    }

    // Validate file
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }

    const validationResult = validateInput(fileSchema, fileData)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: validationResult.error,
        validatedData: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'File validated successfully',
      validatedData: validationResult.data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return handleValidationError(error)
  }
}

// Validate email
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Email is required' 
        },
        { status: 400 }
      )
    }

    // Validate email
    const validationResult = validateInput(commonSchemas.email, email)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: validationResult.error,
        validatedData: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email validated successfully',
      validatedData: validationResult.data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return handleValidationError(error)
  }
}

// Validate phone number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Phone number is required' 
        },
        { status: 400 }
      )
    }

    // Validate phone
    const validationResult = validateInput(commonSchemas.phone, phone)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: validationResult.error,
        validatedData: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number validated successfully',
      validatedData: validationResult.data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return handleValidationError(error)
  }
}

// Validate URL
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'URL is required' 
        },
        { status: 400 }
      )
    }

    // Validate URL
    const validationResult = validateInput(commonSchemas.url, url)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation Error',
        message: validationResult.error,
        validatedData: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'URL validated successfully',
      validatedData: validationResult.data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return handleValidationError(error)
  }
}

// Get validation statistics
export async function OPTIONS(request: NextRequest) {
  try {
    // Get validation statistics from database
    const stats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      commonErrors: {},
      validationTypes: {
        user: 0,
        partner: 0,
        vehicle: 0,
        service: 0,
        payment: 0,
        file: 0,
        content: 0,
        support: 0
      }
    }

    // Get validation logs (if implemented)
    try {
      const logs = await db.validationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      })

      stats.totalValidations = logs.length
      stats.successfulValidations = logs.filter(log => log.success).length
      stats.failedValidations = logs.filter(log => !log.success).length

      // Count common errors
      logs.forEach(log => {
        if (!log.success && log.error) {
          const errorMessage = log.error.substring(0, 100) // First 100 chars
          stats.commonErrors[errorMessage] = (stats.commonErrors[errorMessage] || 0) + 1
        }
      })

      // Count validation types
      logs.forEach(log => {
        if (stats.validationTypes[log.type as keyof typeof stats.validationTypes] !== undefined) {
          stats.validationTypes[log.type as keyof typeof stats.validationTypes]++
        }
      })
    } catch (error) {
      console.error('Error getting validation statistics:', error)
    }

    return NextResponse.json({
      success: true,
      stats,
      message: 'Validation statistics retrieved successfully'
    })
    
  } catch (error) {
    console.error('Error in validation API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}