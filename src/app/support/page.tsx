import SupportSystem from '@/components/SupportSystem'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support System</h1>
          <p className="text-gray-600 mt-2">
            Manage support tickets, knowledge base, and customer service.
          </p>
        </div>
        
        <SupportSystem 
          onTicketCreated={(ticket) => {
            console.log('Ticket created:', ticket)
          }}
          onTicketUpdated={(ticket) => {
            console.log('Ticket updated:', ticket)
          }}
          onTicketResolved={(ticket) => {
            console.log('Ticket resolved:', ticket)
          }}
        />
      </div>
    </div>
  )
}