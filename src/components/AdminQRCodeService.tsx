'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter
} from 'lucide-react'

interface VehicleRegistration {
  id: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string
  insuranceCompany: string
  insurancePolicy: string
  registrationDate: string
  mileage: number
  status: 'pending' | 'approved' | 'qr_generated' | 'delivered' | 'rejected'
  qrRequestDate?: string
  qrGeneratedDate?: string
  deliveryDate?: string
  notes?: string
}

interface QRCodeData {
  id: string
  vehicleId: string
  qrCode: string
  vehicleInfo: VehicleRegistration
  qrImage: string
  generatedAt: string
  status: 'generated' | 'printed' | 'delivered'
  deliveryMethod: 'pickup' | 'email' | 'postal'
  deliveryAddress?: string
  trackingNumber?: string
}

export default function AdminQRCodeService() {
  const [registrations, setRegistrations] = useState<VehicleRegistration[]>([])
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<VehicleRegistration | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showRegistrationDetails, setShowRegistrationDetails] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate loading existing registrations
    const mockRegistrations: VehicleRegistration[] = [
      {
        id: 'REG-001',
        ownerName: 'John Doe',
        ownerEmail: 'john.doe@email.com',
        ownerPhone: '+1-555-0101',
        vin: '1HGBH41JXMN109186',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC-1234',
        color: 'Silver',
        insuranceCompany: 'SafeAuto Insurance',
        insurancePolicy: 'POL-001234',
        registrationDate: '2024-01-15',
        mileage: 45000,
        status: 'qr_generated',
        qrRequestDate: '2024-01-16',
        qrGeneratedDate: '2024-01-17',
        notes: 'Customer requested QR code for emergency assistance'
      },
      {
        id: 'REG-002',
        ownerName: 'Jane Smith',
        ownerEmail: 'jane.smith@email.com',
        ownerPhone: '+1-555-0102',
        vin: '2FTRX18W1XCA12345',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        licensePlate: 'XYZ-789',
        color: 'Blue',
        insuranceCompany: 'Premium Insurance Co',
        insurancePolicy: 'POL-005678',
        registrationDate: '2024-01-18',
        mileage: 38000,
        status: 'pending',
        qrRequestDate: '2024-01-19',
        notes: 'New customer, requested QR code after registration'
      },
      {
        id: 'REG-003',
        ownerName: 'Bob Johnson',
        ownerEmail: 'bob.johnson@email.com',
        ownerPhone: '+1-555-0103',
        vin: '3N1AB6AP9LC123456',
        make: 'Nissan',
        model: 'Altima',
        year: 2020,
        licensePlate: 'DEF-456',
        color: 'Black',
        insuranceCompany: 'State Farm Insurance',
        insurancePolicy: 'POL-009101',
        registrationDate: '2024-01-10',
        mileage: 52000,
        status: 'delivered',
        qrRequestDate: '2024-01-12',
        qrGeneratedDate: '2024-01-13',
        deliveryDate: '2024-01-15',
        notes: 'QR code delivered via postal service'
      }
    ]
    setRegistrations(mockRegistrations)

    // Mock QR codes
    const mockQRCodes: QRCodeData[] = [
      {
        id: 'QR-001',
        vehicleId: 'REG-001',
        qrCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3',
        vehicleInfo: mockRegistrations[0],
        qrImage: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', // Mock image
        generatedAt: '2024-01-17T10:00:00Z',
        status: 'generated',
        deliveryMethod: 'pickup'
      },
      {
        id: 'QR-002',
        vehicleId: 'REG-003',
        qrCode: 'QR-CAR-DEF456-1705315200000-X9Y8Z7',
        vehicleInfo: mockRegistrations[2],
        qrImage: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', // Mock image
        generatedAt: '2024-01-13T14:30:00Z',
        status: 'delivered',
        deliveryMethod: 'postal',
        deliveryAddress: '123 Main St, City, State 12345',
        trackingNumber: 'USPS1234567890'
      }
    ]
    setQrCodes(mockQRCodes)
  }, [])

  // Generate QR code for approved registration
  const handleGenerateQR = async (registration: VehicleRegistration) => {
    setIsGenerating(true)
    setSelectedRegistration(registration)

    // Simulate API call
    setTimeout(() => {
      const qrCode = `QR-CAR-${registration.licensePlate.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const newQRCode: QRCodeData = {
        id: `QR-${Date.now()}`,
        vehicleId: registration.id,
        qrCode,
        vehicleInfo: registration,
        qrImage: `data:image/svg+xml;base64,${btoa('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="white"/><rect x="10" y="10" width="180" height="180" fill="black"/><rect x="20" y="20" width="160" height="160" fill="white"/><rect x="30" y="30" width="140" height="140" fill="black"/><text x="100" y="105" text-anchor="middle" fill="white" font-size="8" font-family="monospace">' + qrCode.substring(0, 20) + '</text></svg>')}`,
        generatedAt: new Date().toISOString(),
        status: 'generated',
        deliveryMethod: 'pickup'
      }

      setQrCodes([...qrCodes, newQRCode])
      
      // Update registration status
      setRegistrations(prev => prev.map(reg => 
        reg.id === registration.id 
          ? { ...reg, status: 'qr_generated', qrGeneratedDate: new Date().toISOString().split('T')[0] }
          : reg
      ))
      
      setIsGenerating(false)
    }, 2000)
  }

  // Approve registration
  const handleApproveRegistration = (registrationId: string) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === registrationId 
        ? { ...reg, status: 'approved' }
        : reg
    ))
  }

  // Reject registration
  const handleRejectRegistration = (registrationId: string, reason: string) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === registrationId 
        ? { ...reg, status: 'rejected', notes: reason }
        : reg
    ))
  }

  // Mark QR code as delivered
  const handleMarkDelivered = (qrCodeId: string, deliveryMethod: string, trackingNumber?: string) => {
    setQrCodes(prev => prev.map(qr => 
      qr.id === qrCodeId 
        ? { 
            ...qr, 
            status: 'delivered' as const, 
            deliveryMethod: deliveryMethod as any,
            trackingNumber,
            deliveredAt: new Date().toISOString()
          }
        : qr
    ))
    
    // Update registration status
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId)
    if (qrCode) {
      setRegistrations(prev => prev.map(reg => 
        reg.id === qrCode.vehicleId 
          ? { ...reg, status: 'delivered', deliveryDate: new Date().toISOString().split('T')[0] }
          : reg
      ))
    }
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

  // Print QR code
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
              .header { background: #f5f5f5; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Vehicle QR Code</h2>
              <img src="${qrData.qrImage}" alt="QR Code" style="width: 200px; height: 200px;" />
              <div class="vehicle-info">
                <h3>${qrData.vehicleInfo.make} ${qrData.vehicleInfo.model}</h3>
                <table>
                  <tr><td class="header">License Plate:</td><td>${qrData.vehicleInfo.licensePlate}</td></tr>
                  <tr><td class="header">VIN:</td><td>${qrData.vehicleInfo.vin}</td></tr>
                  <tr><td class="header">Owner:</td><td>${qrData.vehicleInfo.ownerName}</td></tr>
                  <tr><td class="header">QR Code:</td><td>${qrData.qrCode}</td></tr>
                  <tr><td class="header">Generated:</td><td>${new Date(qrData.generatedAt).toLocaleDateString()}</td></tr>
                </table>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.vin.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'qr_generated': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'qr_generated': return <QrCode className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Admin QR Code Service</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Service Workflow</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Car owners register their vehicles and request QR codes</li>
              <li>2. Admin reviews and approves vehicle registrations</li>
              <li>3. Admin generates unique QR codes for approved vehicles</li>
              <li>4. Admin prints and delivers QR codes to car owners</li>
              <li>5. Car owners place QR codes on their vehicles for emergency access</li>
            </ol>
          </div>

          <Tabs defaultValue="registrations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="registrations">Vehicle Registrations</TabsTrigger>
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="generated">Generated QR Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="registrations" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search by owner, plate, or VIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="qr_generated">QR Generated</option>
                    <option value="delivered">Delivered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistrations.map((registration) => (
                  <div key={registration.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">
                            {registration.make} {registration.model} ({registration.year})
                          </h4>
                          <Badge variant="outline">{registration.licensePlate}</Badge>
                          <Badge className={getStatusColor(registration.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(registration.status)}
                              <span>{registration.status.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{registration.ownerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{registration.ownerPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{registration.ownerEmail}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Reg: {registration.registrationDate}</span>
                          </div>
                        </div>

                        {registration.qrRequestDate && (
                          <div className="text-sm text-blue-600 mb-2">
                            QR Requested: {registration.qrRequestDate}
                          </div>
                        )}

                        {registration.notes && (
                          <div className="text-sm text-gray-500 italic">
                            Notes: {registration.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Vehicle Registration Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Owner Name</Label>
                                  <p className="font-medium">{registration.ownerName}</p>
                                </div>
                                <div>
                                  <Label>Contact</Label>
                                  <p className="text-sm">{registration.ownerPhone}</p>
                                  <p className="text-sm">{registration.ownerEmail}</p>
                                </div>
                                <div>
                                  <Label>Vehicle</Label>
                                  <p className="font-medium">{registration.make} {registration.model}</p>
                                  <p className="text-sm">{registration.year} • {registration.color}</p>
                                </div>
                                <div>
                                  <Label>Identification</Label>
                                  <p className="text-sm">Plate: {registration.licensePlate}</p>
                                  <p className="text-sm">VIN: {registration.vin}</p>
                                </div>
                                <div>
                                  <Label>Insurance</Label>
                                  <p className="font-medium">{registration.insuranceCompany}</p>
                                  <p className="text-sm">Policy: {registration.insurancePolicy}</p>
                                </div>
                                <div>
                                  <Label>Mileage</Label>
                                  <p className="font-medium">{registration.mileage.toLocaleString()} km</p>
                                </div>
                              </div>
                              
                              {registration.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <p className="text-sm text-gray-600">{registration.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {registration.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveRegistration(registration.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectRegistration(registration.id, 'Incomplete documentation')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        {registration.status === 'approved' && (
                          <Button 
                            size="sm"
                            onClick={() => handleGenerateQR(registration)}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {isGenerating && selectedRegistration?.id === registration.id ? (
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-3">
                {registrations
                  .filter(reg => reg.status === 'pending' && reg.qrRequestDate)
                  .map((registration) => (
                    <div key={registration.id} className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-yellow-800">
                            QR Code Request - {registration.make} {registration.model}
                          </h4>
                          <p className="text-sm text-yellow-600">
                            Owner: {registration.ownerName} • Requested: {registration.qrRequestDate}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handleApproveRegistration(registration.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve & Generate QR
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectRegistration(registration.id, 'Request denied')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="generated" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrCodes.map((qrData) => (
                  <div key={qrData.id} className="border rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div 
                        className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center border"
                        dangerouslySetInnerHTML={{ __html: qrData.qrImage }}
                      />
                    </div>
                    <h5 className="font-semibold text-sm text-center mb-2">
                      {qrData.vehicleInfo.make} {qrData.vehicleInfo.model}
                    </h5>
                    <p className="text-xs text-gray-600 text-center mb-1">
                      {qrData.vehicleInfo.licensePlate}
                    </p>
                    <p className="text-xs text-gray-500 text-center mb-3 font-mono">
                      {qrData.qrCode}
                    </p>
                    
                    <div className="text-center mb-3">
                      <Badge className={qrData.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {qrData.status === 'delivered' ? 'Delivered' : 'Generated'}
                      </Badge>
                    </div>

                    <div className="flex justify-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyQR(qrData.qrCode)}
                      >
                        {copiedCode === qrData.qrCode ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
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

                    {qrData.status !== 'delivered' && (
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleMarkDelivered(qrData.id, 'pickup')}
                        >
                          Mark as Delivered
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}