import QRCodeOrdering from '@/components/QRCodeOrdering'

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order QR Code</h1>
          <p className="text-gray-600 mt-2">
            Get a QR code for your vehicle to access emergency assistance anytime, anywhere.
          </p>
        </div>
        
        <QRCodeOrdering />
      </div>
    </div>
  )
}