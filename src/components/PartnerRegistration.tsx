'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Building, User, Lock, Mail, Phone, MapPin, Star, Clock, Wrench, Car } from 'lucide-react'
import Link from 'next/link'

interface PartnerRegistrationData {
  businessName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber: string
  panNumber: string
  website: string
  description: string
  services: string[]
  serviceArea: string
  pricing: {
    towing: number
    mechanic: number
    fuel: number
    accident: number
    lockout: number
  }
  hours: string
  latitude: number
  longitude: number
}

const SERVICE_OPTIONS = [
  { id: 'towing', label: 'Towing Services', icon: <Car className="w-4 h-4" /> },
  { id: 'mechanic', label: 'Mechanic Services', icon: <Wrench className="w-4 h-4" /> },
  { id: 'fuel', label: 'Fuel Delivery', icon: <Building className="w-4 h-4" /> },
  { id: 'accident', label: 'Accident Assistance', icon: <AlertCircle className="w-4 h-4" /> },
  { id: 'lockout', label: 'Lockout Services', icon: <Lock className="w-4 h-4" /> }
]

export default function PartnerRegistration() {
  const [formData, setFormData] = useState<PartnerRegistrationData>({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    website: '',
    description: '',
    services: [],
    serviceArea: '',
    pricing: {
      towing: 0,
      mechanic: 0,
      fuel: 0,
      accident: 0,
      lockout: 0
    },
    hours: '',
    latitude: 0,
    longitude: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<PartnerRegistrationData>>({})
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('register')

  const validateForm = (): boolean => {
    const newErrors: Partial<PartnerRegistrationData> = {}

    // Business Name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    // Pincode validation
    const pincodeRegex = /^[0-9]{6}$/
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }

    // Services validation
    if (formData.services.length === 0) {
      newErrors.services = 'Please select at least one service'
    }

    // Pricing validation
    const hasPricing = Object.values(formData.pricing).some(price => price > 0)
    if (!hasPricing) {
      newErrors.pricing = 'Please set pricing for at least one service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof PartnerRegistrationData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const handlePricingChange = (service: keyof typeof formData.pricing, value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [service]: numValue
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Reset form
        setFormData({
          businessName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          gstNumber: '',
          panNumber: '',
          website: '',
          description: '',
          services: [],
          serviceArea: '',
          pricing: {
            towing: 0,
            mechanic: 0,
            fuel: 0,
            accident: 0,
            lockout: 0
          },
          hours: '',
          latitude: 0,
          longitude: 0
        })
      } else {
        setErrors({ general: data.error })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Email and password are required' })
      return
    }

    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/partners/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Store partner in localStorage (in production, use secure storage)
        localStorage.setItem('partner', JSON.stringify(data.partner))
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/partner/dashboard'
        }, 1500)
      } else {
        setErrors({ general: data.error })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Partner Registration</h1>
            </div>
            <p className="text-gray-600">
              Register your service business and start receiving customer requests
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="register" className="mt-6">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-600 mb-2">
                      Registration Successful!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your partner account has been created successfully. 
                      Please wait for admin verification before you can start receiving requests.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('login')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Login to Your Account
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                      </div>
                    )}

                    {/* Business Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input
                            id="businessName"
                            name="businessName"
                            type="text"
                            placeholder="Enter your business name"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            className={errors.businessName ? 'border-red-500' : ''}
                          />
                          {errors.businessName && (
                            <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={errors.phone ? 'border-red-500' : ''}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="Enter your website URL"
                            value={formData.website}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Login Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Login Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className={errors.password ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                      
                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          name="address"
                          placeholder="Enter your complete address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={2}
                          className={errors.address ? 'border-red-500' : ''}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={errors.city ? 'border-red-500' : ''}
                          />
                          {errors.city && (
                            <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            name="state"
                            type="text"
                            placeholder="Enter your state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={errors.state ? 'border-red-500' : ''}
                          />
                          {errors.state && (
                            <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            type="text"
                            placeholder="Enter your pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className={errors.pincode ? 'border-red-500' : ''}
                          />
                          {errors.pincode && (
                            <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gstNumber">GST Number</Label>
                          <Input
                            id="gstNumber"
                            name="gstNumber"
                            type="text"
                            placeholder="Enter your GST number"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="panNumber">PAN Number</Label>
                          <Input
                            id="panNumber"
                            name="panNumber"
                            type="text"
                            placeholder="Enter your PAN number"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Business Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe your business and services"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Services Offered *</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SERVICE_OPTIONS.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={service.id}
                              checked={formData.services.includes(service.id)}
                              onCheckedChange={() => handleServiceToggle(service.id)}
                            />
                            <Label htmlFor={service.id} className="flex items-center space-x-2 cursor-pointer">
                              {service.icon}
                              <span>{service.label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.services && (
                        <p className="text-sm text-red-600 mt-1">{errors.services}</p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Service Pricing *</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(formData.pricing).map(([service, price]) => (
                          <div key={service}>
                            <Label htmlFor={service} className="capitalize">
                              {service} Pricing (₹)
                            </Label>
                            <Input
                              id={service}
                              type="number"
                              placeholder="0"
                              value={price}
                              onChange={(e) => handlePricingChange(service as keyof typeof formData.pricing, e.target.value)}
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                      {errors.pricing && (
                        <p className="text-sm text-red-600 mt-1">{errors.pricing}</p>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="serviceArea">Service Area</Label>
                          <Input
                            id="serviceArea"
                            name="serviceArea"
                            type="text"
                            placeholder="Areas you serve (e.g., Delhi NCR)"
                            value={formData.serviceArea}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="hours">Business Hours</Label>
                          <Input
                            id="hours"
                            name="hours"
                            type="text"
                            placeholder="e.g., 9:00 AM - 6:00 PM"
                            value={formData.hours}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Business Location</h3>
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          className="flex items-center space-x-2"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Get Current Location</span>
                        </Button>
                        <span className="text-sm text-gray-500">
                          {formData.latitude && formData.longitude 
                            ? `Location: ${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}` 
                            : 'Location not set'}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Registering...</span>
                        </div>
                      ) : (
                        'Register Partner Account'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="login" className="mt-6">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-600 mb-2">
                      Login Successful!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Redirecting to your dashboard...
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        'Login'
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('register')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Register here
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have a QR code?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Scan QR Code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}