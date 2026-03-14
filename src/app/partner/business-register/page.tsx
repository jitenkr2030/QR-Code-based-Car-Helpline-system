import PartnerRegistration from '@/components/PartnerRegistration'

export default function PartnerRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Car Helpline</h1>
          </Link>
          <p className="text-gray-600">Register your service business and start receiving customer requests</p>
        </div>
        
        <PartnerRegistration />
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/partner/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login here
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Want to test QR code scanning?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Scan Demo QR Code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}