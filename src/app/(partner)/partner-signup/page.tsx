import PartnerRegistration from '@/components/PartnerRegistration'

export default function PartnerRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Partner Registration</h1>
          <p className="text-gray-600 mt-2">
            Join our network of service partners and start earning today.
          </p>
        </div>
        
        <PartnerRegistration />
      </div>
    </div>
  )
}