'use client'

import QRScanner from '@/components/QRScanner'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const router = useRouter()

  const handleScanSuccess = (qrCode: string) => {
    console.log('QR Code scanned:', qrCode)
    // Here you would typically:
    // 1. Validate the QR code
    // 2. Fetch vehicle/service information
    // 3. Redirect to the appropriate page
    router.push(`/vehicle/${qrCode}`)
  }

  const handleScanError = (error: string) => {
    console.error('Scan error:', error)
    // Handle scan error (show notification, etc.)
  }

  const handleClose = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
          <p className="text-gray-600 mt-2">
            Scan QR codes to access vehicle information and request services.
          </p>
        </div>
        
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}