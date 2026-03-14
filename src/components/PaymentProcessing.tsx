'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader2, CreditCard, Smartphone, Building, Truck, AlertTriangle, Lock, Phone, Mail } from 'lucide-react'

interface PaymentProcessingProps {
  orderId: string
  amount: number
  onPaymentComplete?: (paymentData: any) => void
  onPaymentCancel?: () => void
}

interface PaymentData {
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: string
  description: string
}

export default function PaymentProcessing({ orderId, amount, onPaymentComplete, onPaymentCancel }: PaymentProcessingProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'upi',
    description: ''
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentResponse, setPaymentResponse] = useState<any>(null)

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
      description: 'Pay using Google Pay, PhonePe, Paytm',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5 text-green-600" />,
      description: 'Pay using Visa, Mastercard, RuPay',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building className="w-5 h-5 text-purple-600" />,
      description: 'Pay using your bank account',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <Truck className="w-5 h-5 text-orange-600" />,
      description: 'Pay when service is delivered',
      color: 'bg-orange-50 border-orange-200'
    }
  ]

  const validateForm = (): boolean => {
    if (!paymentData.customerName.trim()) {
      setPaymentError('Customer name is required')
      return false
    }

    if (!paymentData.customerEmail.trim()) {
      setPaymentError('Customer email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(paymentData.customerEmail)) {
      setPaymentError('Invalid email format')
      return false
    }

    if (!paymentData.customerPhone.trim()) {
      setPaymentError('Customer phone is required')
      return false
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(paymentData.customerPhone.replace(/[^0-9]/g, ''))) {
      setPaymentError('Phone number must be 10 digits')
      return false
    }

    setPaymentError(null)
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (paymentError) {
      setPaymentError(null)
    }
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: value
    }))
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')
    setPaymentError(null)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'INR',
          paymentMethod: paymentData.paymentMethod,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          customerPhone: paymentData.customerPhone,
          description: paymentData.description || `Payment for order ${orderId}`
        })
      })

      const data = await response.json()

      if (data.success) {
        setPaymentResponse(data.payment)
        setPaymentStatus('completed')
        
        // Simulate payment completion
        setTimeout(() => {
          if (onPaymentComplete) {
            onPaymentComplete(data.payment)
          }
        }, 2000)
      } else {
        setPaymentError(data.error)
        setPaymentStatus('failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError('Payment failed. Please try again.')
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    const paymentMethod = paymentMethods.find(pm => pm.id === method)
    return paymentMethod?.icon || <CreditCard className="w-5 h-5" />
  }

  const getPaymentMethodInfo = (method: string) => {
    const paymentMethod = paymentMethods.find(pm => pm.id === method)
    return paymentMethod || paymentMethods[0]
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Payment Successful!
              </h3>
              <p className="text-green-600 mb-4">
                Your payment of ₹{amount} has been processed successfully.
              </p>
              {paymentResponse && (
                <div className="bg-white rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{paymentResponse.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{paymentResponse.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{paymentResponse.paymentMethod}</span>
                    </div>
                    {paymentResponse.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">{paymentResponse.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-blue-600">₹{amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                type="text"
                placeholder="Enter your full name"
                value={paymentData.customerName}
                onChange={handleInputChange}
                className={paymentError && !paymentData.customerName.trim() ? 'border-red-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="Enter your email address"
                value={paymentData.customerEmail}
                onChange={handleInputChange}
                className={paymentError && !paymentData.customerEmail.trim() ? 'border-red-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={paymentData.customerPhone}
                onChange={handleInputChange}
                className={paymentError && !paymentData.customerPhone.trim() ? 'border-red-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Add any additional notes"
                value={paymentData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentData.paymentMethod} onValueChange={handlePaymentMethodChange}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className={`p-3 rounded-lg border ${method.color}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {method.icon}
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Method Details */}
      {paymentData.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getPaymentMethodIcon(paymentData.paymentMethod)}
              <span>Payment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentData.paymentMethod === 'upi' && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Scan QR code or use UPI ID</p>
                  <div className="bg-white rounded p-2 border border-blue-200">
                    <p className="font-mono text-sm">carhelpline@ybl</p>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'card' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Enter your card details</p>
                  <div className="space-y-2">
                    <Input placeholder="Card Number" className="text-center" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="MM/YY" className="text-center" />
                      <Input placeholder="CVV" className="text-center" />
                    </div>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'netbanking' && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Select your bank</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sbi">State Bank of India</SelectItem>
                      <SelectItem value="hdfc">HDFC Bank</SelectItem>
                      <SelectItem value="icici">ICICI Bank</SelectItem>
                      <SelectItem value="axis">Axis Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {paymentData.paymentMethod === 'cash' && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Pay on delivery</p>
                  <p className="text-sm text-gray-500">
                    You can pay when the service is delivered to your location.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || paymentStatus === 'completed'}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              {getPaymentMethodIcon(paymentData.paymentMethod)}
              <span>Pay ₹{amount}</span>
            </div>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onPaymentCancel}
          disabled={isProcessing || paymentStatus === 'completed'}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Secure Payment</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}