'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Car, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Upload, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Building
} from 'lucide-react'

interface InsuranceProvider {
  id: string
  name: string
  displayName: string
  type: string
  description: string
  logo: string
  website: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  isActive: boolean
  isVerified: boolean
}

interface InsurancePolicy {
  id: string
  policyNumber: string
  type: string
  coverage: any
  premium: number
  currency: string
  startDate: string
  endDate: string
  status: string
  sumInsured: number
  deductible: number
  terms: string
  provider: InsuranceProvider
  user: {
    id: string
    name: string
    email: string
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
  }
  claimsCount: number
  createdAt: string
}

interface InsuranceClaim {
  id: string
  claimNumber: string
  type: string
  description: string
  incidentDate: string
  incidentLocation: string
  severity: string
  status: string
  amount: number
  currency: string
  approvedAmount: number
  settledAmount: number
  deductible: number
  documents: string[]
  notes: string
  reviewedBy: string
  reviewedAt: string
  approvedBy: string
  approvedAt: string
  settledBy: string
  settledAt: string
  policy: {
    id: string
    policyNumber: string
    type: string
    provider: InsuranceProvider
    user: {
      id: string
      name: string
      email: string
    }
    vehicle: {
      id: string
      make: string
      model: string
      year: number
      licensePlate: string
    }
  }
  createdAt: string
}

interface InsuranceIntegrationProps {
  userId?: string
  vehicleId?: string
  onPolicyCreated?: (policy: InsurancePolicy) => void
  onClaimCreated?: (claim: InsuranceClaim) => void
}

export default function InsuranceIntegration({ 
  userId, 
  vehicleId, 
  onPolicyCreated, 
  onClaimCreated 
}: InsuranceIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'providers'>('policies')
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPolicyForm, setShowPolicyForm] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null)

  useEffect(() => {
    fetchProviders()
    if (userId) {
      fetchPolicies()
      fetchClaims()
    }
  }, [userId])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/insurance?type=providers')
      const data = await response.json()
      
      if (data.success) {
        setProviders(data.providers)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const fetchPolicies = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/insurance?type=policies&userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setPolicies(data.policies)
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
    }
  }

  const fetchClaims = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/insurance?type=claims&userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setClaims(data.claims)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    }
  }

  const handleCreatePolicy = async (policyData: any) => {
    if (!userId || !vehicleId) {
      alert('User ID and Vehicle ID are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'policy',
          userId,
          vehicleId,
          providerId: policyData.providerId,
          policyData
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowPolicyForm(false)
        fetchPolicies()
        if (onPolicyCreated) {
          onPolicyCreated(data.policy)
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error creating policy:', error)
      alert('Failed to create policy. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateClaim = async (claimData: any) => {
    if (!selectedPolicy) {
      alert('Please select a policy to create a claim')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'claim',
          policyId: selectedPolicy.id,
          claimData
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowClaimForm(false)
        fetchClaims()
        if (onClaimCreated) {
          onClaimCreated(data.claim)
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error creating claim:', error)
      alert('Failed to create claim. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'settled':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-green-100 text-green-800'
      case 'major':
        return 'bg-yellow-100 text-yellow-800'
      case 'severe':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Integration</h1>
          <p className="text-gray-600 mt-2">
            Manage your insurance policies and claims in one place.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'policies' ? 'default' : 'outline'}
            onClick={() => setActiveTab('policies')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Policies
          </Button>
          <Button
            variant={activeTab === 'claims' ? 'default' : 'outline'}
            onClick={() => setActiveTab('claims')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Claims
          </Button>
          <Button
            variant={activeTab === 'providers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('providers')}
          >
            <Building className="w-4 h-4 mr-2" />
            Providers
          </Button>
        </div>
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Insurance Policies</h2>
            <Button onClick={() => setShowPolicyForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
          </div>

          {policies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">{policy.policyNumber}</span>
                      </div>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-sm capitalize">{policy.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Premium</p>
                        <p className="text-sm font-semibold">{formatCurrency(policy.premium)}/month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Coverage</p>
                        <p className="text-sm">{policy.sumInsured > 0 ? formatCurrency(policy.sumInsured) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deductible</p>
                        <p className="text-sm">{policy.deductible > 0 ? formatCurrency(policy.deductible) : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Start Date</p>
                        <p className="text-sm">{formatDate(policy.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">End Date</p>
                        <p className="text-sm">{formatDate(policy.endDate)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{policy.provider.displayName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Vehicle</p>
                          <p className="text-sm">{policy.vehicle.make} {policy.vehicle.model}</p>
                          <p className="text-xs text-gray-500">{policy.vehicle.year} • {policy.vehicle.licensePlate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Claims</p>
                          <p className="text-sm">{policy.claimsCount} filed</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowClaimForm(true)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        File Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No insurance policies found</p>
                  <Button onClick={() => setShowPolicyForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Insurance Claims</h2>
            <Button onClick={() => setShowClaimForm(true)} disabled={!selectedPolicy}>
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold">{claim.claimNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                        <Badge className={getSeverityColor(claim.severity)}>
                          {claim.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-sm capitalize">{claim.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Amount</p>
                        <p className="text-sm font-semibold">{formatCurrency(claim.amount)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="text-sm">{claim.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Incident Date</p>
                        <p className="text-sm">{formatDate(claim.incidentDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-sm">{claim.incidentLocation || 'N/A'}</p>
                      </div>
                    </div>

                    {claim.approvedAmount && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                          <p className="text-sm font-semibold text-green-600">{formatCurrency(claim.approvedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Deductible</p>
                          <p className="text-sm font-semibold">{formatCurrency(claim.deductible)}</p>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Policy: {claim.policy.policyNumber}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Provider</p>
                          <p className="text-sm">{claim.policy.provider.displayName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Vehicle</p>
                          <p className="text-sm">{claim.policy.vehicle.make} {claim.policy.vehicle.model}</p>
                        </div>
                      </div>
                    </div>

                    {claim.notes && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-600">Notes</p>
                        <p className="text-sm">{claim.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No insurance claims found</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Select a policy and file a claim to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Insurance Providers</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{provider.displayName}</span>
                    </div>
                    <div className="flex space-x-2">
                      {provider.isVerified && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                      <Badge className={provider.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{provider.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{provider.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{provider.city}, {provider.state}</span>
                    </div>
                  </div>

                  {provider.website && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(provider.website, '_blank')}
                      >
                        Visit Website
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Policy Form Modal */}
      {showPolicyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Insurance Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PolicyForm
                userId={userId}
                vehicleId={vehicleId}
                providers={providers}
                onSubmit={handleCreatePolicy}
                onCancel={() => setShowPolicyForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>File Insurance Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ClaimForm
                policy={selectedPolicy}
                onSubmit={handleCreateClaim}
                onCancel={() => setShowClaimForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Policy Form Component
function PolicyForm({ 
  userId, 
  vehicleId, 
  providers, 
  onSubmit, 
  onCancel 
}: { 
  userId?: string
  vehicleId?: string
  providers: InsuranceProvider[]
  onSubmit: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    providerId: '',
    type: 'comprehensive',
    coverage: {
      accident: true,
      theft: true,
      thirdParty: true,
      ownDamage: true
    },
    premium: 0,
    sumInsured: 500000,
    deductible: 5000,
    terms: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="providerId">Insurance Provider</Label>
        <Select value={formData.providerId} onValueChange={(value) => setFormData(prev => ({ ...prev, providerId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Policy Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comprehensive">Comprehensive</SelectItem>
            <SelectItem value="third-party">Third Party</SelectItem>
            <SelectItem value="collision">Collision</SelectItem>
            <SelectItem value="liability">Liability</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="premium">Monthly Premium</Label>
          <Input
            id="premium"
            type="number"
            value={formData.premium}
            onChange={(e) => setFormData(prev => ({ ...prev, premium: parseFloat(e.target.value) }))}
            placeholder="Enter monthly premium"
          />
        </div>
        <div>
          <Label htmlFor="sumInsured">Sum Insured</Label>
          <Input
            id="sumInsured"
            type="number"
            value={formData.sumInsured}
            onChange={(e) => setFormData(prev => ({ ...prev, sumInsured: parseFloat(e.target.value) }))}
            placeholder="Enter sum insured amount"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deductible">Deductible</Label>
        <Input
          id="deductible"
          type="number"
          value={formData.deductible}
          onChange={(e) => setFormData(prev => ({ ...prev, deductible: parseFloat(e.target.value) }))}
          placeholder="Enter deductible amount"
        />
      </div>

      <div>
        <Label htmlFor="terms">Terms and Conditions</Label>
        <Textarea
          id="terms"
          value={formData.terms}
          onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
          placeholder="Enter terms and conditions"
          rows={3}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" className="flex-1">
          Create Policy
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Claim Form Component
function ClaimForm({ 
  policy, 
  onSubmit, 
  onCancel 
}: { 
  policy: InsurancePolicy | null
  onSubmit: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    type: 'accident',
    description: '',
    incidentDate: '',
    incidentLocation: '',
    severity: 'minor',
    amount: 0,
    documents: [],
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Claim Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accident">Accident</SelectItem>
            <SelectItem value="theft">Theft</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="injury">Injury</SelectItem>
            <SelectItem value="death">Death</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the incident"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="incidentDate">Incident Date</Label>
          <Input
            id="incidentDate"
            type="date"
            value={formData.incidentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="incidentLocation">Incident Location</Label>
          <Input
            id="incidentLocation"
            value={formData.incidentLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentLocation: e.target.value }))}
            placeholder="Enter incident location"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Claim Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
            placeholder="Enter claim amount"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any additional notes"
          rows={3}
        />
      </div>

      {policy && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Policy Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Policy Number:</p>
              <p className="font-medium">{policy.policyNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-medium capitalize">{policy.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Provider:</p>
              <p className="font-medium">{policy.provider.displayName}</p>
            </div>
            <div>
              <p className="text-gray-600">Premium:</p>
              <p className="font-medium">{policy.premium}/month</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button type="submit" className="flex-1">
          File Claim
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}