import crypto from 'crypto'
import { db } from '@/lib/db'

// Encryption Configuration
const ENCRYPTION_CONFIG = {
  // Encryption algorithm
  algorithm: 'aes-256-gcm',
  
  // Key derivation
  keyDerivation: {
    algorithm: 'pbkdf2',
    iterations: 100000,
    keyLength: 32, // 256 bits
    saltLength: 16,
    hashFunction: 'sha256'
  },
  
  // Encryption settings
  encryption: {
    ivLength: 12, // 96 bits for GCM
    tagLength: 16, // 128 bits for GCM
    encoding: 'base64'
  },
  
  // Hashing
  hashing: {
    algorithm: 'sha-256',
    iterations: 10000,
    saltLength: 16,
    encoding: 'hex'
  }
}

// Encryption Keys Management
export class EncryptionKeys {
  private static instance: EncryptionKeys
  private masterKey: Buffer | null = null
  private dataKeys: Map<string, Buffer> = new Map()
  
  private constructor() {
    this.initializeMasterKey()
  }

  public static getInstance(): EncryptionKeys {
    if (!EncryptionKeys.instance) {
      EncryptionKeys.instance = new EncryptionKeys()
    }
    return EncryptionKeys.instance
  }

  // Initialize master key
  private async initializeMasterKey(): Promise<void> {
    try {
      // In production, this would load from secure storage (HSM, AWS KMS, etc.)
      // For now, we'll use environment variable with fallback
      const masterKeyHex = process.env.MASTER_ENCRYPTION_KEY
      
      if (masterKeyHex) {
        this.masterKey = Buffer.from(masterKeyHex, 'hex')
      } else {
        // Generate a new master key (in production, this should be stored securely)
        this.masterKey = crypto.randomBytes(32)
        console.warn('Generated new master key - in production, store this securely!')
      }
    } catch (error) {
      console.error('Error initializing master key:', error)
      throw new Error('Failed to initialize encryption keys')
    }
  }

  // Get master key
  public getMasterKey(): Buffer {
    if (!this.masterKey) {
      throw new Error('Master key not initialized')
    }
    return this.masterKey
  }

  // Derive encryption key for specific purpose
  public deriveKey(purpose: string, salt?: Buffer): Buffer {
    const keyMaterial = this.getMasterKey()
    const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.keyDerivation.saltLength)
    
    return crypto.pbkdf2Sync(
      keyMaterial,
      actualSalt,
      ENCRYPTION_CONFIG.keyDerivation.iterations,
      ENCRYPTION_CONFIG.keyDerivation.keyLength,
      ENCRYPTION_CONFIG.keyDerivation.hashFunction
    )
  }

  // Generate key pair for asymmetric encryption
  public generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    return {
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString()
    }
  }
}

// Data Encryption Manager
export class DataEncryption {
  private static instance: DataEncryption
  private encryptionKeys: EncryptionKeys

  private constructor() {
    this.encryptionKeys = EncryptionKeys.getInstance()
  }

  public static getInstance(): DataEncryption {
    if (!DataEncryption.instance) {
      DataEncryption.instance = new DataEncryption()
    }
    return DataEncryption.instance
  }

  // Encrypt data
  public encrypt(data: string, keyId?: string): {
    encryptedData: string
    iv: string
    tag: string
    keyId: string
  } {
    try {
      // Derive encryption key
      const key = keyId 
        ? this.encryptionKeys.deriveKey(keyId)
        : this.encryptionKeys.getMasterKey()
      
      // Generate random IV
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.encryption.ivLength)
      
      // Create cipher
      const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key)
      cipher.setAAD(Buffer.from(keyId || 'default'))
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8')
      encrypted = Buffer.concat([encrypted, cipher.final()])
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      return {
        encryptedData: encrypted.toString(ENCRYPTION_CONFIG.encryption.encoding),
        iv: iv.toString(ENCRYPTION_CONFIG.encryption.encoding),
        tag: tag.toString(ENCRYPTION_CONFIG.encryption.encoding),
        keyId: keyId || 'default'
      }
    } catch (error) {
      console.error('Error encrypting data:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  // Decrypt data
  public decrypt(encryptedData: {
    encryptedData: string
    iv: string
    tag: string
    keyId: string
  }): string {
    try {
      // Derive decryption key
      const key = this.encryptionKeys.deriveKey(encryptedData.keyId)
      
      // Parse encrypted components
      const encrypted = Buffer.from(encryptedData.encryptedData, ENCRYPTION_CONFIG.encryption.encoding)
      const iv = Buffer.from(encryptedData.iv, ENCRYPTION_CONFIG.encryption.encoding)
      const tag = Buffer.from(encryptedData.tag, ENCRYPTION_CONFIG.encryption.encoding)
      
      // Create decipher
      const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, key)
      decipher.setAAD(Buffer.from(encryptedData.keyId))
      decipher.setAuthTag(tag)
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, null, 'utf8')
      decrypted = Buffer.concat([decrypted, decipher.final()])
      
      return decrypted.toString('utf8')
    } catch (error) {
      console.error('Error decrypting data:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  // Encrypt file
  public encryptFile(buffer: Buffer, keyId?: string): {
    encryptedData: Buffer
    iv: string
    tag: string
    keyId: string
  } {
    try {
      // Derive encryption key
      const key = keyId 
        ? this.encryptionKeys.deriveKey(keyId)
        : this.encryptionKeys.getMasterKey()
      
      // Generate random IV
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.encryption.ivLength)
      
      // Create cipher
      const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key)
      cipher.setAAD(Buffer.from(keyId || 'default'))
      
      // Encrypt data
      let encrypted = cipher.update(buffer)
      encrypted = Buffer.concat([encrypted, cipher.final()])
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      return {
        encryptedData: encrypted,
        iv: iv.toString(ENCRYPTION_CONFIG.encryption.encoding),
        tag: tag.toString(ENCRYPTION_CONFIG.encryption.encoding),
        keyId: keyId || 'default'
      }
    } catch (error) {
      console.error('Error encrypting file:', error)
      throw new Error('Failed to encrypt file')
    }
  }

  // Decrypt file
  public decryptFile(encryptedData: {
    encryptedData: Buffer
    iv: string
    tag: string
    keyId: string
  }): Buffer {
    try {
      // Derive decryption key
      const key = this.encryptionKeys.deriveKey(encryptedData.keyId)
      
      // Parse encrypted components
      const iv = Buffer.from(encryptedData.iv, ENCRYPTION_CONFIG.encryption.encoding)
      const tag = Buffer.from(encryptedData.tag, ENCRYPTION_CONFIG.encryption.encoding)
      
      // Create decipher
      const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, key)
      decipher.setAAD(Buffer.from(encryptedData.keyId))
      decipher.setAuthTag(tag)
      
      // Decrypt data
      let decrypted = decipher.update(encryptedData.encryptedData)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      
      return decrypted
    } catch (error) {
      console.error('Error decrypting file:', error)
      throw new Error('Failed to decrypt file')
    }
  }

  // Encrypt database field
  public async encryptField(model: string, field: string, value: any, recordId?: string): Promise<string> {
    try {
      const keyId = `${model}_${field}_${recordId || 'global'}`
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      const encrypted = this.encrypt(stringValue, keyId)
      
      // Store encryption metadata in database
      await db.encryptionMetadata.create({
        data: {
          model,
          field,
          recordId: recordId || null,
          keyId,
          iv: encrypted.iv,
          tag: encrypted.tag,
          encryptedAt: new Date()
        }
      })
      
      return encrypted.encryptedData
    } catch (error) {
      console.error('Error encrypting field:', error)
      throw new Error('Failed to encrypt field')
    }
  }

  // Decrypt database field
  public async decryptField(model: string, field: string, encryptedValue: string, recordId?: string): Promise<any> {
    try {
      const keyId = `${model}_${field}_${recordId || 'global'}`
      
      // Get encryption metadata from database
      const metadata = await db.encryptionMetadata.findFirst({
        where: {
          model,
          field,
          recordId: recordId || null,
          keyId
        }
      })
      
      if (!metadata) {
        throw new Error('Encryption metadata not found')
      }
      
      const decrypted = this.decrypt({
        encryptedData: encryptedValue,
        iv: metadata.iv,
        tag: metadata.tag,
        keyId
      })
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decrypted)
      } catch {
        return decrypted
      }
    } catch (error) {
      console.error('Error decrypting field:', error)
      throw new Error('Failed to decrypt field')
    }
  }

  // Hash password
  public hashPassword(password: string, salt?: string): {
    hash: string
    salt: string
  } {
    try {
      const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.hashing.saltLength).toString(ENCRYPTION_CONFIG.hashing.encoding)
      
      const hash = crypto.pbkdf2Sync(
        password,
        actualSalt,
        ENCRYPTION_CONFIG.hashing.iterations,
        ENCRYPTION_CONFIG.keyDerivation.keyLength,
        ENCRYPTION_CONFIG.hashing.hashFunction
      ).toString(ENCRYPTION_CONFIG.hashing.encoding)
      
      return {
        hash,
        salt: actualSalt
      }
    } catch (error) {
      console.error('Error hashing password:', error)
      throw new Error('Failed to hash password')
    }
  }

  // Verify password
  public verifyPassword(password: string, hash: string, salt: string): boolean {
    try {
      const computedHash = crypto.pbkdf2Sync(
        password,
        salt,
        ENCRYPTION_CONFIG.hashing.iterations,
        ENCRYPTION_CONFIG.keyDerivation.keyLength,
        ENCRYPTION_CONFIG.hashing.hashFunction
      ).toString(ENCRYPTION_CONFIG.hashing.encoding)
      
      return computedHash === hash
    } catch (error) {
      console.error('Error verifying password:', error)
      return false
    }
  }

  // Generate secure random token
  public generateSecureToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString(ENCRYPTION_CONFIG.hashing.encoding)
    } catch (error) {
      console.error('Error generating secure token:', error)
      throw new Error('Failed to generate secure token')
    }
  }

  // Generate HMAC
  public generateHMAC(data: string, key: string): string {
    try {
      const hmac = crypto.createHmac('sha256', key)
      hmac.update(data)
      return hmac.digest(ENCRYPTION_CONFIG.hashing.encoding)
    } catch (error) {
      console.error('Error generating HMAC:', error)
      throw new Error('Failed to generate HMAC')
    }
  }

  // Verify HMAC
  public verifyHMAC(data: string, key: string, hmac: string): boolean {
    try {
      const computedHMAC = this.generateHMAC(data, key)
      return crypto.timingSafeEqual(
        Buffer.from(hmac, ENCRYPTION_CONFIG.hashing.encoding),
        Buffer.from(computedHMAC, ENCRYPTION_CONFIG.hashing.encoding)
      )
    } catch (error) {
      console.error('Error verifying HMAC:', error)
      return false
    }
  }
}

// Encryption Middleware
export function createEncryptionMiddleware(options: {
  encryptResponse?: boolean
  decryptRequest?: boolean
  fields?: string[]
} = {}) {
  const { encryptResponse = false, decryptRequest = false, fields = [] } = options
  
  return function encryptionMiddleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Add encryption headers
    response.headers.set('X-Encryption-Enabled', 'true')
    response.headers.set('X-Encryption-Algorithm', ENCRYPTION_CONFIG.algorithm)
    
    if (encryptResponse) {
      response.headers.set('X-Response-Encrypted', 'true')
    }
    
    if (decryptRequest) {
      response.headers.set('X-Request-Decrypted', 'true')
    }
    
    return response
  }
}

// Specific encryption middleware functions
export const requireEncryption = createEncryptionMiddleware({ encryptResponse: true })
export const requireDecryption = createEncryptionMiddleware({ decryptRequest: true })
export const requireCompleteEncryption = createEncryptionMiddleware({ 
  encryptResponse: true, 
  decryptRequest: true 
})

// Export encryption manager instance
export const dataEncryption = DataEncryption.getInstance()

// Export helper functions
export const encryptData = (data: string, keyId?: string) => 
  dataEncryption.encrypt(data, keyId)

export const decryptData = (encryptedData: any) => 
  dataEncryption.decrypt(encryptedData)

export const encryptFile = (buffer: Buffer, keyId?: string) => 
  dataEncryption.encryptFile(buffer, keyId)

export const decryptFile = (encryptedData: any) => 
  dataEncryption.decryptFile(encryptedData)

export const hashPassword = (password: string, salt?: string) => 
  dataEncryption.hashPassword(password, salt)

export const verifyPassword = (password: string, hash: string, salt: string) => 
  dataEncryption.verifyPassword(password, hash, salt)

export const generateSecureToken = (length?: number) => 
  dataEncryption.generateSecureToken(length)

export const generateHMAC = (data: string, key: string) => 
  dataEncryption.generateHMAC(data, key)

export const verifyHMAC = (data: string, key: string, hmac: string) => 
  dataEncryption.verifyHMAC(data, key, hmac)

// Encryption utilities
export const encryptionUtils = {
  // Generate random bytes
  randomBytes: (size: number): Buffer => {
    return crypto.randomBytes(size)
  },

  // Generate random string
  randomString: (length: number, encoding: 'hex' | 'base64' | 'latin1' = 'hex'): string => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString(encoding).substring(0, length)
  },

  // Generate UUID
  generateUUID: (): string => {
    return crypto.randomUUID()
  },

  // Create hash
  createHash: (data: string, algorithm: string = 'sha256'): string => {
    return crypto.createHash(algorithm).update(data).digest('hex')
  },

  // Create HMAC
  createHMAC: (data: string, key: string, algorithm: string = 'sha256'): string => {
    return crypto.createHmac(algorithm, key).update(data).digest('hex')
  },

  // Constant-time comparison
  constantTimeCompare: (a: string, b: string): boolean => {
    if (a.length !== b.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    
    return result === 0
  },

  // Secure compare
  secureCompare: (a: string, b: string): boolean => {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  },

  // Derive key
  deriveKey: (password: string, salt: Buffer, iterations: number = 100000, keyLength: number = 32): Buffer => {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256')
  },

  // Generate key pair
  generateKeyPair: () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    return {
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString()
    }
  },

  // Sign data
  sign: (data: string, privateKey: string): string => {
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(data)
    return sign.sign(privateKey, 'hex')
  },

  // Verify signature
  verify: (data: string, signature: string, publicKey: string): boolean => {
    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(data)
      return verify.verify(publicKey, signature, 'hex')
    } catch (error) {
      return false
    }
  }
}