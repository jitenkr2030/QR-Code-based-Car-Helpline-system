import FileUpload from '@/components/FileUpload'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">File Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your documents, images, and other files.
          </p>
        </div>
        
        <FileUpload
          type="document"
          entityId="demo-entity"
          accept="image/*,.pdf,.doc,.docx,.txt"
          maxSize={10}
          maxFiles={5}
          multiple={true}
          showExistingFiles={true}
          onUploadComplete={(files) => {
            console.log('Files uploaded:', files)
          }}
        />
      </div>
    </div>
  )
}