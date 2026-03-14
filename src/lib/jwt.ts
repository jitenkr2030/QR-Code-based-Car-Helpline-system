// Browser-compatible JWT implementation
export class JWTManager {
  private static instance: JWTManager
  private secretKey: string

  private constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key'
  }

  public static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager()
    }
    return JWTManager.instance
  }

  // Generate JWT token (for demonstration only)
  public generateToken(payload: any): string {
    try {
      // In production, this would use a proper JWT library
      // For now, we'll create a simple base64-encoded token
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      }
      
      const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }
      
      const encodedHeader = btoa(JSON.stringify(header))
      const encodedPayload = btoa(JSON.stringify(tokenPayload))
      
      // In production, this would be a proper HMAC signature
      const signature = btoa(`${encodedHeader}.${encodedPayload}.${this.secretKey}`)
      
      return `${encodedHeader}.${encodedPayload}.${signature}`
    } catch (error) {
      console.error('Error generating token:', error)
      throw new Error('Failed to generate token')
    }
  }

  // Verify JWT token (for demonstration only)
  public verifyToken(token: string): any {
    try {
      // In production, this would use a proper JWT library
      const [header, payload, signature] = token.split('.')
      
      // Decode payload
      const decodedPayload = JSON.parse(atob(payload))
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }
      
      return decodedPayload
    } catch (error) {
      console.error('Error verifying token:', error)
      throw new Error('Invalid token')
    }
  }

  // Decode JWT token without verification
  public decodeToken(token: string): any {
    try {
      const [, payload] = token.split('.')
      return JSON.parse(atob(payload))
    } catch (error) {
      console.error('Error decoding token:', error)
      throw new Error('Invalid token format')
    }
  }

  // Refresh token
  public refreshToken(oldToken: string): string {
    try {
      const payload = this.verifyToken(oldToken)
      
      // Remove exp and iat from payload
      const { exp, iat, ...newPayload } = payload
      
      return this.generateToken(newPayload)
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh token')
    }
  }

  // Create session token
  public createSessionToken(user: any): string {
    return this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'session'
    })
  }

  // Create API key
  public createApiKey(user: any, permissions: string[]): string {
    return this.generateToken({
      userId: user.id,
      email: user.email,
      permissions,
      type: 'api_key',
      createdAt: new Date().toISOString()
    })
  }

  // Validate API key
  public validateApiKey(apiKey: string): any {
    try {
      const payload = this.verifyToken(apiKey)
      
      if (payload.type !== 'api_key') {
        throw new Error('Invalid API key')
      }
      
      return payload
    } catch (error) {
      console.error('Error validating API key:', error)
      throw new Error('Invalid API key')
    }
  }
}

// React hook for JWT
export function useJWT() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('jwt_token')
    if (storedToken) {
      try {
        const jwt = JWTManager.getInstance()
        const payload = jwt.verifyToken(storedToken)
        setToken(storedToken)
        setUser(payload)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('jwt_token')
      }
    }
  }, [])

  const login = (credentials: { email: string; password: string }) => {
    // In production, this would call your authentication API
    return new Promise((resolve, reject) => {
      // Mock authentication
      setTimeout(() => {
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          const jwt = JWTManager.getInstance()
          const token = jwt.createSessionToken({
            id: '1',
            email: credentials.email,
            role: 'admin',
            name: 'Admin User'
          })
          
          setToken(token)
          setUser(jwt.verifyToken(token))
          setIsAuthenticated(true)
          
          localStorage.setItem('jwt_token', token)
          resolve({ token, user: jwt.verifyToken(token) })
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('jwt_token')
  }

  const refreshToken = async () => {
    if (!token) return
    
    try {
      const jwt = JWTManager.getInstance()
      const newToken = jwt.refreshToken(token)
      
      setToken(newToken)
      setUser(jwt.verifyToken(newToken))
      
      localStorage.setItem('jwt_token', newToken)
      return newToken
    } catch (error) {
      console.error('Error refreshing token:', error)
      logout()
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    refreshToken
  }
}

// Server-side JWT utilities (for API routes)
export class ServerJWTManager {
  private static instance: ServerJWTManager
  private secretKey: string

  private constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key'
  }

  public static getInstance(): ServerJWTManager {
    if (!ServerJWTManager.instance) {
      ServerJWTManager.instance = new ServerJWTManager()
    }
    return ServerJWTManager.instance
  }

  // Generate JWT token for server-side use
  public generateToken(payload: any): string {
    try {
      // In production, this would use the jsonwebtoken library
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      }
      
      const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }
      
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
      const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
      
      // In production, this would use crypto.createHmac
      const signature = Buffer.from(`${encodedHeader}.${encodedPayload}`).toString('base64')
      
      return `${encodedHeader}.${encodedPayload}.${signature}`
    } catch (error) {
      console.error('Error generating token:', error)
      throw new Error('Failed to generate token')
    }
  }

  // Verify JWT token for server-side use
  public verifyToken(token: string): any {
    try {
      const [header, payload, signature] = token.split('.')
      
      // Decode payload
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }
      
      return decodedPayload
    } catch (error) {
      console.error('Error verifying token:', error)
      throw new Error('Invalid token')
    }
  }

  // Create middleware for JWT verification
  public createMiddleware(options: {
    required?: boolean
    roles?: string[]
    permissions?: string[]
  } = {}) {
    return (req: any, res: any, next: any) => {
      try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null

        if (!token) {
          if (options.required) {
            return res.status(401).json({ error: 'No token provided' })
          }
          return next()
        }

        const payload = this.verifyToken(token)
        
        // Check roles if specified
        if (options.roles && options.roles.length > 0) {
          if (!payload.role || !options.roles.includes(payload.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' })
          }
        }

        // Attach user info to request
        req.user = payload
        req.token = token
        
        next()
      } catch (error) {
        console.error('JWT middleware error:', error)
        return res.status(401).json({ error: 'Invalid token' })
      }
    }
  }
}

// Export singleton instances
export const jwtManagerInstance = JWTManager.getInstance()
export const serverJwtManagerInstance = ServerJWTManager.getInstance()

// Export helper functions
export const generateToken = (payload: any) => jwtManagerInstance.generateToken(payload)
export const verifyToken = (token: string) => jwtManagerInstance.verifyToken(token)
export const decodeToken = (token: string) => jwtManagerInstance.decodeToken(token)
export const refreshToken = (token: string) => jwtManagerInstance.refreshToken(token)
export const createSessionToken = (user: any) => jwtManagerInstance.createSessionToken(user)
export const createApiKey = (user: any, permissions: string[]) => jwtManagerInstance.createApiKey(user, permissions)
export const validateApiKey = (apiKey: string) => jwtManagerInstance.validateApiKey(apiKey)

// Additional JWT functions for API routes
export const generateAccessToken = (payload: any) => {
  return generateToken({
    ...payload,
    type: 'access_token',
    expiresIn: '15m'
  })
}

export const generateRefreshToken = (payload: any) => {
  return generateToken({
    ...payload,
    type: 'refresh_token',
    expiresIn: '7d'
  })
}

export const generateTokenPair = (payload: any) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  }
}

export const verifyAccessToken = (token: string) => {
  try {
    const payload = verifyToken(token)
    
    if (payload.type !== 'access_token') {
      throw new Error('Invalid access token')
    }
    
    return payload
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const payload = verifyToken(token)
    
    if (payload.type !== 'refresh_token') {
      throw new Error('Invalid refresh token')
    }
    
    return payload
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

export const blacklistToken = (token: string) => {
  // In production, this would add the token to a blacklist in Redis or database
  // For now, we'll just return true
  console.log('Token blacklisted:', token)
  return true
}

export const isTokenExpired = (token: string) => {
  try {
    const payload = verifyToken(token)
    return payload.exp && payload.exp < Math.floor(Date.now() / 1000)
  } catch (error) {
    return true // Consider invalid tokens as expired
  }
}

// Export singleton instances
export const jwtManager = JWTManager.getInstance()
export const serverJwtManager = ServerJWTManager.getInstance()

// Server-side helper functions
export const generateServerToken = (payload: any) => serverJwtManager.generateToken(payload)
export const verifyServerToken = (token: string) => serverJwtManager.verifyToken(token)
export const createJWTMiddleware = (options?: any) => serverJwtManager.createMiddleware(options)