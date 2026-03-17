'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  QrCode, 
  Download, 
  Plus, 
  Car, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Copy,
  Check,
  AlertCircle,
  Printer
} from 'lucide-react'

interface VehicleInfo {
  id: string
  qrCode: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  insuranceCompany: string
  insurancePolicy: string
  registrationDate: string
  mileage: number
}

interface QRCodeData {
  vehicleId: string
  qrCode: string
  vehicleInfo: VehicleInfo
  qrImage: string
  generatedAt: string
}

export default function QRCodeGenerator() {
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInfo | null>(null)
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    insuranceCompany: '',
    insurancePolicy: '',
    mileage: 0
  })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Generate unique QR code
  const generateQRCode = (vehicle: VehicleInfo): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `QR-CAR-${vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '')}-${timestamp}-${random}`.toUpperCase()
  }

  // Add new vehicle
  const handleAddVehicle = () => {
    if (!newVehicle.vin || !newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      alert('Please fill in all required fields')
      return
    }

    const vehicle: VehicleInfo = {
      id: `VEH-${Date.now()}`,
      qrCode: generateQRCode(newVehicle as any),
      vin: newVehicle.vin,
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year,
      licensePlate: newVehicle.licensePlate,
      color: newVehicle.color,
      ownerName: newVehicle.ownerName,
      ownerEmail: newVehicle.ownerEmail,
      ownerPhone: newVehicle.ownerPhone,
      insuranceCompany: newVehicle.insuranceCompany,
      insurancePolicy: newVehicle.insurancePolicy,
      registrationDate: new Date().toISOString().split('T')[0],
      mileage: newVehicle.mileage
    }

    setVehicles([...vehicles, vehicle])
    setNewVehicle({
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      color: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      insuranceCompany: '',
      insurancePolicy: '',
      mileage: 0
    })
    setShowAddVehicle(false)
  }

  // Generate QR code for vehicle
  const handleGenerateQR = async (vehicle: VehicleInfo) => {
    setIsGenerating(true)
    setSelectedVehicle(vehicle)

    // Simulate QR code generation
    setTimeout(() => {
      const qrData: QRCodeData = {
        vehicleId: vehicle.id,
        qrCode: vehicle.qrCode,
        vehicleInfo: vehicle,
        qrImage: `data:image/svg+xml;base64,${btoa(generateQRSVG(vehicle.qrCode))}`,
        generatedAt: new Date().toISOString()
      }

      setQrCodes([...qrCodes, qrData])
      setIsGenerating(false)
    }, 2000)
  }

  // Generate QR code SVG (simplified)
  const generateQRSVG = (code: string): string => {
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="black"/>
        <rect x="20" y="20" width="160" height="160" fill="white"/>
        <rect x="30" y="30" width="140" height="140" fill="black"/>
        <text x="100" y="105" text-anchor="middle" fill="white" font-size="8" font-family="monospace">
          ${code.substring(0, 20)}
        </text>
      </svg>
    `
  }

  // Download QR code
  const handleDownloadQR = (qrData: QRCodeData) => {
    const link = document.createElement('a')
    link.download = `QR-${qrData.vehicleInfo.licensePlate}.png`
    link.href = qrData.qrImage
    link.click()
  }

  // Copy QR code
  const handleCopyQR = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode)
    setCopiedCode(qrCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Print QR codes
  const handlePrintQR = (qrData: QRCodeData) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${qrData.vehicleInfo.licensePlate}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .qr-container { text-align: center; margin: 20px; }
              .vehicle-info { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              td { padding: 8px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Vehicle QR Code</h2>
              <img src="${qrData.qrImage}" alt="QR Code" />
              <div class="vehicle-info">
                <h3>${qrData.vehicleInfo.make} ${qrData.vehicleInfo.model}</h3>
                <p><strong>License Plate:</strong> ${qrData.vehicleInfo.licensePlate}</p>
                <p><strong>VIN:</strong> ${qrData.vehicleInfo.vin}</p>
                <p><strong>QR Code:</strong> ${qrData.qrCode}</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>QR Code Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Vehicle QR Codes</h3>
              <p className="text-sm text-gray-600">
                Generate and manage QR codes for vehicles in your fleet
              </p>
            </div>
            <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vin">VIN *</Label>
                    <Input
                      id="vin"
                      value={newVehicle.vin}
                      onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                      placeholder="Vehicle Identification Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate *</Label>
                    <Input
                      id="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      placeholder="Camry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                      placeholder="Silver"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={newVehicle.ownerName}
                      onChange={(e) => setNewVehicle({...newVehicle, ownerName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={newVehicle.ownerEmail}
                      onChange={(e) => setNewVehicle({...newVehicle, ownerEmail: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                    <Input
                      id="ownerPhone"
                      value={newVehicle.ownerPhone}
                      onChange={(e) => setNewVehicle({...newVehicle, ownerPhone: e.target.value})}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceCompany">Insurance Company</Label>
                    <Input
                      id="insuranceCompany"
                      value={newVehicle.insuranceCompany}
                      onChange={(e) => setNewVehicle({...newVehicle, insuranceCompany: e.target.value})}
                      placeholder="SafeAuto Insurance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurancePolicy">Policy Number</Label>
                    <Input
                      id="insurancePolicy"
                      value={newVehicle.insurancePolicy}
                      onChange={(e) => setNewVehicle({...newVehicle, insurancePolicy: e.target.value})}
                      placeholder="POL-001234"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="mileage">Current Mileage</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={newVehicle.mileage}
                      onChange={(e) => setNewVehicle({...newVehicle, mileage: parseInt(e.target.value)})}
                      placeholder="45000"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVehicle}>
                    Add Vehicle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Vehicles List */}
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No vehicles added yet</p>
                <p className="text-sm">Add your first vehicle to generate QR codes</p>
              </div>
            ) : (
              vehicles.map((vehicle) => {
                const existingQR = qrCodes.find(qr => qr.vehicleId === vehicle.id)
                return (
                  <div key={vehicle.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </h4>
                          <Badge variant="outline">{vehicle.licensePlate}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{vehicle.ownerName || 'No owner'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{vehicle.ownerPhone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{vehicle.ownerEmail || 'No email'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{vehicle.registrationDate}</span>
                          </div>
                        </div>
                        {existingQR && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-800">
                              QR Generated
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {existingQR.qrCode}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {existingQR ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyQR(existingQR.qrCode)}
                            >
                              {copiedCode === existingQR.qrCode ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadQR(existingQR)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintQR(existingQR)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleGenerateQR(vehicle)}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isGenerating && selectedVehicle?.id === vehicle.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <QrCode className="w-4 h-4" />
                            )}
                            <span className="ml-2">Generate QR</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated QR Codes */}
      {qrCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Generated QR Codes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qrCodes.map((qrData) => (
                <div key={qrData.vehicleId} className="border rounded-lg p-4 text-center">
                  <div 
                    className="w-32 h-32 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center border"
                    dangerouslySetInnerHTML={{ __html: qrData.qrImage }}
                  />
                  <h5 className="font-semibold text-sm">
                    {qrData.vehicleInfo.make} {qrData.vehicleInfo.model}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {qrData.vehicleInfo.licensePlate}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mb-3">
                    {qrData.qrCode}
                  </p>
                  <div className="flex justify-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyQR(qrData.qrCode)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadQR(qrData)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrintQR(qrData)}
                    >
                      <Printer className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}