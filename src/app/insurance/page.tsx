import InsuranceIntegration from '@/components/InsuranceIntegration'

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Integration</h1>
          <p className="text-gray-600 mt-2">
            Manage your insurance policies and claims with our integrated system.
          </p>
        </div>
        
        <InsuranceIntegration 
          onPolicyCreated={(policy) => {
            console.log('Policy created:', policy)
          }}
          onClaimCreated={(claim) => {
            console.log('Claim created:', claim)
          }}
        />
      </div>
    </div>
  )
}