import Maps from '@/components/Maps'

export default function MapsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Maps & Navigation</h1>
          <p className="text-gray-600 mt-2">
            Find nearby service partners and get directions to your destination.
          </p>
        </div>
        
        <Maps />
      </div>
    </div>
  )
}