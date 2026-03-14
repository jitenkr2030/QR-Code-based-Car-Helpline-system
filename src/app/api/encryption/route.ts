import { NextRequest, NextResponse } from 'next/server'
import { 
  dataEncryption, 
  encryptData, 
  decryptData, 
  encryptFile, 
  decryptFile,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateHMAC,
  verifyHMAC
} from '@/lib/encryption'
import { db } from '@/lib/db'

// Encrypt data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, keyId, options = {} } = body

    switch (action) {
      case 'encrypt':
        if (!data) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Data is required' },
            { status: 400 }
          )
        }
        
        const encrypted = encryptData(data, keyId)
        return NextResponse.json({
          success: true,
          encrypted,
          keyId: keyId || 'default',
          message: 'Data encrypted successfully'
        })
        
      case 'encrypt-file':
        const fileBuffer = Buffer.from(options.fileData || '', 'base64')
        const encryptedFile = encryptFile(fileBuffer, keyId)
        
        return NextResponse.json({
          success: true,
          encryptedFile: {
            encryptedData: encryptedFile.encryptedData.toString('base64'),
            iv: encryptedFile.iv,
            tag: encryptedFile.tag,
            keyId: encryptedFile.keyId
          },
          keyId: keyId || 'default',
          message: 'File encrypted successfully'
        })
        
      case 'hash-password':
        if (!data.password) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Password is required' },
            { status: 400 }
          )
        }
        
        const hashed = hashPassword(data.password, data.salt)
        return NextResponse.json({
          success: true,
          hash: hashed.hash,
          salt: hashed.salt,
          message: 'Password hashed successfully'
        })
        
      case 'generate-token':
        const length = options.length || 32
        const token = generateSecureToken(length)
        
        return NextResponse.json({
          success: true,
          token,
          length,
          message: 'Secure token generated successfully'
        })
        
      case 'generate-hmac':
        if (!data.message || !data.key) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Message and key are required' },
            { status: 400 }
          )
        }
        
        const hmac = generateHMAC(data.message, data.key)
        return NextResponse.json({
          success: true,
          hmac,
          message: 'HMAC generated successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in encryption API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Decrypt data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, data, keyId, options = {} } = Object.fromEntries(searchParams)

    switch (action) {
      case 'decrypt':
        if (!data) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Encrypted data is required' },
            { status: 400 }
          )
        }
        
        const decrypted = decryptData({
          encryptedData: data.encryptedData,
          iv: data.iv,
          tag: data.tag,
          keyId: keyId || 'default'
        })
        
        return NextResponse.json({
          success: true,
          decrypted,
          message: 'Data decrypted successfully'
        })
        
      case 'decrypt-file':
        if (!data || !data.encryptedData) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Encrypted file data is required' },
            { status: 400 }
          )
        }
        
        const encryptedFileData = {
          encryptedData: Buffer.from(data.encryptedData, 'base64'),
          iv: data.iv,
          tag: data.tag,
          keyId: keyId || 'default'
        }
        
        const decryptedFile = decryptFile(encryptedFileData)
        
        return NextResponse.json({
          success: true,
          decryptedFile: {
            data: decryptedFile.toString('base64'),
            size: decryptedFile.length
          },
          message: 'File decrypted successfully'
        })
        
      case 'verify-password':
        if (!data.password || !data.hash || !data.salt) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Password, hash, and salt are required' },
            { status: 400 }
          )
        }
        
        const isValid = verifyPassword(data.password, data.hash, data.salt)
        
        return NextResponse.json({
          success: true,
          isValid,
          message: isValid ? 'Password is valid' : 'Password is invalid'
        })
        
      case 'verify-hmac':
        if (!data.message || !data.key || !data.hmac) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Message, key, and HMAC are required' },
            { status: 400 }
          )
        }
        
        const isValidHMAC = verifyHMAC(data.message, data.key, data.hmac)
        
        return NextResponse.json({
          success: true,
          isValid: isValidHMAC,
          message: isValidHMAC ? 'HMAC is valid' : 'HMAC is invalid'
        })
        
      case 'check-strength':
        if (!data.password) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Password is required' },
            { status: 400 }
          )
        }
        
        const strength = checkPasswordStrength(data.password)
        
        return NextResponse.json({
          success: true,
          strength,
          message: 'Password strength checked successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in encryption API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Update encrypted data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, model, recordId, field, value, keyId } = body

    switch (action) {
      case 'encrypt-field':
        if (!model || !field || value === undefined) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Model, field, and value are required' },
            { status: 400 }
          )
        }
        
        const encryptedValue = await dataEncryption.encryptField(model, field, value, recordId)
        
        return NextResponse.json({
          success: true,
          encryptedValue,
          model,
          field,
          recordId,
          keyId: keyId || 'default',
          message: 'Field encrypted successfully'
        })
        
      case 'decrypt-field':
        if (!model || !field || !value) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Model, field, and encrypted value are required' },
            { status: 400 }
          )
        }
        
        const decryptedValue = await dataEncryption.decryptField(model, field, value, recordId)
        
        return NextResponse.json({
          success: true,
          decryptedValue,
          model,
          field,
          recordId,
          message: 'Field decrypted successfully'
        })
        
      case 'rotate-key':
        if (!keyId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Key ID is required' },
            { status: 400 }
          )
        }
        
        // In production, this would rotate the actual encryption key
        // For now, we'll simulate key rotation
        const rotationResult = {
          keyId,
          newKeyId: `${keyId}_rotated_${Date.now()}`,
          rotationDate: new Date().toISOString(),
          status: 'completed'
        }
        
        return NextResponse.json({
          success: true,
          rotationResult,
          message: 'Key rotated successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in encryption API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Delete encryption metadata
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, model, field, recordId, keyId } = Object.fromEntries(searchParams)

    switch (action) {
      case 'delete-metadata':
        if (!model || !field) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Model and field are required' },
            { status: 400 }
          )
        }
        
        // Delete encryption metadata
        const deletedMetadata = await db.encryptionMetadata.deleteMany({
          where: {
            model,
            field,
            recordId: recordId || null
          }
        })
        
        return NextResponse.json({
          success: true,
          deletedCount: deletedMetadata.count,
          message: 'Encryption metadata deleted successfully'
        })
        
      case 'cleanup-metadata':
        // Clean up old encryption metadata
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const deletedOldMetadata = await db.encryptionMetadata.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          deletedCount: deletedOldMetadata.count,
          message: 'Old encryption metadata cleaned up successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in encryption API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Check password strength
function checkPasswordStrength(password: string): {
  score: number
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    common: boolean
  }
} {
  const feedback: string[] = []
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    common: !isCommonPassword(password)
  }
  
  let score = 0
  
  // Length
  if (requirements.length) {
    score += 20
  } else {
    feedback.push('Password should be at least 8 characters long')
  }
  
  // Uppercase
  if (requirements.uppercase) {
    score += 20
  } else {
    feedback.push('Password should contain at least one uppercase letter')
  }
  
  // Lowercase
  if (requirements.lowercase) {
    score += 20
  } else {
    feedback.push('Password should contain at least one lowercase letter')
  }
  
  // Numbers
  if (requirements.numbers) {
    score += 20
  } else {
    feedback.push('Password should contain at least one number')
  }
  
  // Symbols
  if (requirements.symbols) {
    score += 20
  } else {
    feedback.push('Password should contain at least one special character')
  }
  
  // Common password
  if (requirements.common) {
    score += 20
  } else {
    feedback.push('Password should not be a common password')
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  
  if (score >= 80) {
    strength = 'very-strong'
  } else if (score >= 60) {
    strength = 'strong'
  } else if (score >= 40) {
    strength = 'medium'
  } else {
    strength = 'weak'
  }
  
  return {
    score,
    strength,
    feedback,
    requirements
  }
}

// Check if password is common
function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'god',
    'iloveyou', 'football', 'baseball', 'shadow', 'superman', 'batman',
    'azerty', 'qwertyuiop', '123123', 'password1', 'admin123'
  ]
  
  return commonPasswords.includes(password.toLowerCase())
}