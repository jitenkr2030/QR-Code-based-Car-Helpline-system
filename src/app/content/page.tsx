import ContentManagement from '@/components/ContentManagement'

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your website content, media, and marketing campaigns.
          </p>
        </div>
        
        <ContentManagement 
          onContentCreated={(content) => {
            console.log('Content created:', content)
          }}
          onContentUpdated={(content) => {
            console.log('Content updated:', content)
          }}
          onContentDeleted={(content) => {
            console.log('Content deleted:', content)
          }}
        />
      </div>
    </div>
  )
}