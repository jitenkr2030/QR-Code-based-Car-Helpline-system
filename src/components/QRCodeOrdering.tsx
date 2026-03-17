'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import PaymentProcessing from '@/components/PaymentProcessing'
import { 
  Car, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Info,
  Star,
  Shield,
  Zap
} from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
}

interface QRCodeType {
  type: string
  name: string
  price: number
  description: string
  features: string[]
  icon: React.ReactNode
}

interface OrderData {
  vehicleId: string
  qrType: string
  quantity: number
  deliveryMethod: string
  deliveryAddress: string
  paymentMethod: string
  specialInstructions: string
}

const QR_CODE_TYPES: QRCodeType[] = [
  {
    type: 'basic',
    name: 'Basic QR Code',
    price: 299,
    description: '2x2" vinyl sticker, 1-year durability',
    features: ['Vehicle information', 'Emergency contacts', 'Basic tracking'],
    icon: <Shield className="w-5 h-5 text-blue-600" />
  },
  {
    type: 'premium',
    name: 'Premium QR Code',
    price: 499,
    description: '3x3" weather-resistant sticker, 2-year durability',
    features: ['Vehicle information', 'Service history', 'Warranty tracking', 'Priority support'],
    icon: <Star className="w-5 h-5 text-purple-600" />
  },
  {
    type: 'fleet',
    name: 'Fleet QR Code',
    price: 799,
    description: '4x4" heavy-duty metal plate, 3-year durability',
    features: ['Fleet management', 'Maintenance tracking', 'Advanced analytics', 'Dedicated support'],
    icon: <Zap className="w-5 h-5 text-orange-600" />
  }
]

export default function QRCodeOrdering() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedQRType, setSelectedQRType] = useState<string>('basic')
  const [quantity, setQuantity] = useState(1)
  const [orderData, setOrderData] = useState<OrderData>({
    vehicleId: '',
    qrType: 'basic',
    quantity: 1,
    deliveryMethod: 'pickup',
    deliveryAddress: '',
    paymentMethod: 'upi',
    specialInstructions: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  // Get user from localStorage
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    // Fetch user's vehicles
    if (user) {
      fetchUserVehicles()
    }
  }, [user])

  const fetchUserVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const selectedQRTypeData = QR_CODE_TYPES.find(type => type.type === selectedQRType)
  const totalPrice = selectedQRTypeData ? selectedQRTypeData.price * quantity : 0

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setOrderData(prev => ({
      ...prev,
      vehicleId: vehicle.id
    }))
    setActiveStep(2)
  }

  const handleQRTypeSelect = (type: string) => {
    setSelectedQRType(type)
    setOrderData(prev => ({
      ...prev,
      qrType: type
    }))
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + change))
    setQuantity(newQuantity)
    setOrderData(prev => ({
      ...prev,
      quantity: newQuantity
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedVehicle) {
      setOrderError('Please select a vehicle')
      return
    }

    setIsSubmitting(true)
    setOrderError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          userId: user.id,
          vehicleId: selectedVehicle.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setCreatedOrder(data.order)
        setShowPayment(true)
      } else {
        setOrderError(data.error)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setOrderError('Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentComplete = (paymentData: any) => {
    setShowPayment(false)
    setOrderSuccess(true)
    setOrderData(createdOrder)
    
    // Reset form
    setSelectedVehicle(null)
    setSelectedQRType('basic')
    setQuantity(1)
    setOrderData({
      vehicleId: '',
      qrType: 'basic',
      quantity: 1,
      deliveryMethod: 'pickup',
      deliveryAddress: '',
      paymentMethod: 'upi',
      specialInstructions: ''
    })
    setActiveStep(1)
    setCreatedOrder(null)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    // User can continue with the order or cancel
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Please Login
              </h2>
              <p className="text-gray-600 mb-6">
                You need to login to order QR codes for your vehicles.
              </p>
              <Button 
                onClick={() => window.location.href = '/register'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login or Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order Placed Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your QR code order has been placed successfully. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setOrderSuccess(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Place Another Order
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  View My Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order QR Code</h1>
          <p className="text-gray-600 mt-2">
            Get a QR code for your vehicle to access emergency assistance anytime, anywhere.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <Car className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${
                activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Select Vehicle
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${
                activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Configure Order
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${
                activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Complete Order
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Select Vehicle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-5 h-5" />
                    <span>Select Vehicle</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No vehicles found</p>
                      <Button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedVehicle?.id === vehicle.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                              <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.licensePlate}</p>
                              <p className="text-sm text-gray-500">{vehicle.color}</p>
                            </div>
                            {selectedVehicle?.id === vehicle.id && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Configure Order */}
              {selectedVehicle && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Configure Order</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* QR Code Type Selection */}
                    <div>
                      <Label className="text-base font-medium mb-3">Select QR Code Type</Label>
                      <RadioGroup value={selectedQRType} onValueChange={handleQRTypeSelect}>
                        {QR_CODE_TYPES.map((qrType) => (
                          <div key={qrType.type} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value={qrType.type} id={qrType.type} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {qrType.icon}
                                <Label htmlFor={qrType.type} className="font-medium cursor-pointer">
                                  {qrType.name}
                                </Label>
                                <Badge variant="secondary">₹{qrType.price}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{qrType.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {qrType.features.map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Quantity */}
                    <div>
                      <Label className="text-base font-medium mb-3">Quantity</Label>
                      <div className="flex items-center space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="w-16 text-center">
                          <span className="text-lg font-medium">{quantity}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Maximum 10 QR codes per order</p>
                    </div>

                    {/* Delivery Method */}
                    <div>
                      <Label className="text-base font-medium mb-3">Delivery Method</Label>
                      <Select value={orderData.deliveryMethod} onValueChange={(value) => setOrderData(prev => ({ ...prev, deliveryMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Store Pickup</SelectItem>
                          <SelectItem value="home">Home Delivery</SelectItem>
                          <SelectItem value="office">Office Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <Label className="text-base font-medium mb-3">Delivery Address</Label>
                      <Textarea
                        placeholder="Enter your complete delivery address"
                        value={orderData.deliveryAddress}
                        onChange={(e) => setOrderData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label className="text-base font-medium mb-3">Payment Method</Label>
                      <Select value={orderData.paymentMethod} onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upi">UPI (Google Pay, PhonePe, Paytm)</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="netbanking">Net Banking</SelectItem>
                          <SelectItem value="cash">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <Label className="text-base font-medium mb-3">Special Instructions (Optional)</Label>
                      <Textarea
                        placeholder="Any special instructions for delivery or QR code"
                        value={orderData.specialInstructions}
                        onChange={(e) => setOrderData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedVehicle ? (
                  <>
                    <div className="border-b pb-4">
                      <h3 className="font-medium mb-2">Selected Vehicle</h3>
                      <p className="text-sm text-gray-600">{selectedVehicle.make} {selectedVehicle.model}</p>
                      <p className="text-sm text-gray-600">{selectedVehicle.year} • {selectedVehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600">{selectedVehicle.color}</p>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-medium mb-2">QR Code Details</h3>
                      {selectedQRTypeData && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm font-medium">{selectedQRTypeData.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price:</span>
                            <span className="text-sm font-medium">₹{selectedQRTypeData.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="text-sm font-medium">{quantity}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Total Price</h3>
                        <span className="text-xl font-bold text-blue-600">₹{totalPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                    </div>

                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Placing Order...</span>
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </Button>

                    {orderError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-600">{orderError}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Select a vehicle to configure your order</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {showPayment && createdOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentProcessing
              orderId={createdOrder.orderId}
              amount={createdOrder.totalPrice}
              onPaymentComplete={handlePaymentComplete}
              onPaymentCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  )
}