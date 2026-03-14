import AdvancedAnalytics from '@/components/AdvancedAnalytics'

export default function AdvancedAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive business intelligence and predictive analytics.
          </p>
        </div>
        
        <AdvancedAnalytics 
          onMetricUpdate={(metric, value) => {
            console.log('Metric updated:', metric, value)
          }}
        />
      </div>
    </div>
  )
}