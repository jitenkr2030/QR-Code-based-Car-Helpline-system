'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  QrCode, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Upload,
  Smartphone,
  Monitor
} from 'lucide-react'

interface QRScannerProps {
  onScanSuccess?: (qrCode: string) => void
  onScanError?: (error: string) => void
  onClose?: () => void
}

export default function QRScanner({ onScanSuccess, onScanError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)
      setScanResult(null)
      
      // Request camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setCameraActive(true)
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check camera permissions.')
      setIsScanning(false)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setIsScanning(false)
  }

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    stopCamera()
    setTimeout(() => startCamera(), 100)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to image data
        const imageData = canvas.toDataURL('image/png')
        processImage(imageData)
      }
    }
  }

  const processImage = (imageData: string) => {
    try {
      // Create an image element to process
      const img = new Image()
      img.onload = () => {
        // Create a canvas for image processing
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        if (context) {
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Get image data for QR code scanning
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const qrCode = scanQRCode(imageData)
          
          if (qrCode) {
            setScanResult(qrCode)
            setIsScanning(false)
            if (onScanSuccess) {
              onScanSuccess(qrCode)
            }
          } else {
            setError('No QR code found in the image. Please try again.')
          }
        }
      }
      img.src = imageData
    } catch (err) {
      console.error('Error processing image:', err)
      setError('Error processing image. Please try again.')
    }
  }

  const scanQRCode = (imageData: ImageData): string | null => {
    // This is a simplified QR code detection
    // In production, you would use a proper QR code library
    // For demo purposes, we'll return a mock QR code
    
    // Simulate QR code detection (in production, use a real QR code library)
    const mockQRCodes = [
      'QR-CAR-ABC1234-1705488000000-A1B2C3',
      'QR-CAR-XYZ5678-1705488000000-D4E5F6',
      'QR-CAR-DEF9012-1705488000000-G7H8I9'
    ]
    
    // Randomly return one of the mock QR codes for demo
    return mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        processImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleManualInput = () => {
    const mockQRCodes = [
      'QR-CAR-ABC1234-1705488000000-A1B2C3',
      'QR-CAR-XYZ5678-1705488000000-D4E5F6',
      'QR-CAR-DEF9012-1705488000000-G7H8I9'
    ]
    
    const randomQRCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)]
    setScanResult(randomQRCode)
    setIsScanning(false)
    
    if (onScanSuccess) {
      onScanSuccess(randomQRCode)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>QR Code Scanner</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Camera is not active</p>
                  <Button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              </div>
            )}
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Scan className="w-6 h-6 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium">Scanning...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Camera Controls */}
            {cameraActive && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={switchCamera}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={captureImage}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={stopCamera}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Option */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Or upload an image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>

          {/* Manual Input Option */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Or enter QR code manually</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualInput}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Use Demo QR Code
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {scanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">QR Code Scanned Successfully!</p>
                  <p className="text-xs text-green-600 mt-1 font-mono">{scanResult}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>How to Scan QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Position the QR code within the camera frame</p>
                <p className="text-xs text-gray-500">Make sure the QR code is clearly visible and well-lit</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Click the capture button or wait for automatic scan</p>
                <p className="text-xs text-gray-500">The scanner will automatically detect and read the QR code</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">View the scan result</p>
                <p className="text-xs text-gray-500">The QR code will be processed and the result displayed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Alternative Scanning Methods</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Upload Image</span>
              </div>
              <p className="text-xs text-gray-500">
                Upload an image of the QR code from your device
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Monitor className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Manual Input</span>
              </div>
              <p className="text-xs text-gray-500">
                Enter the QR code manually or use a demo code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}