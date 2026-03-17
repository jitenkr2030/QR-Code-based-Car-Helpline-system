'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  DollarSign, 
  ShoppingCart, 
  MessageSquare, 
  FileText, 
  Target, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Zap, 
  Eye, 
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Search,
  Settings,
  Monitor,
  Smartphone,
  Globe,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  BrainIcon
} from 'lucide-react'

interface AdvancedMetrics {
  userGrowthRate: number
  partnerGrowthRate: number
  revenueGrowthRate: number
  userEngagementScore: number
  partnerEngagementScore: number
  avgResponseTime: number
  avgResolutionTime: number
  customerSatisfactionScore: number
  contentEngagementRate: number
  contentConversionRate: number
  campaignROI: number
  campaignConversionRate: number
  churnRisk: number
  ltv: number
  nps: number
  conversionRate: number
  dropoffRate: number
  retentionRate: number
  churnRate: number
}

interface FunnelStep {
  name: string
  count: number
  conversionRate?: number
  dropoffRate?: number
}

interface FunnelAnalytics {
  steps: FunnelStep[]
  conversionRates: number[]
  dropoffRates: number[]
  overallConversionRate: number
  bottlenecks: Array<{
    step: string
    dropoffRate: number
    severity: string
  }>
  optimization: Array<{
    step: string
    issue: string
    recommendation: string
    priority: string
  }>
}

interface RetentionAnalytics {
  userRetention: { rate: number; trend: string }
  partnerRetention: { rate: number; trend: string }
  subscriptionRetention: { rate: number; trend: string }
  customerLifetimeValue: { value: number; trend: string }
  churnAnalysis: { rate: number; risk: string; reasons: string[] }
  retentionSegments: {
    highValue: { count: number; retentionRate: number }
    mediumValue: { count: number; retentionRate: number }
    lowValue: { count: number; retentionRate: number }
  }
}

interface CohortAnalytics {
  cohorts: Array<{
    month: string
    users: number
    retention: number[]
  }>
  metrics: {
    avgRetentionRate: number
    avgLifetimeValue: number
    cohortComparison: string
  }
}

interface PredictiveAnalytics {
  userChurnPrediction: {
    atRiskUsers: number
    churnProbability: number
    riskFactors: string[]
  }
  revenueForecast: {
    predicted: number
    confidence: number
    trend: string
  }
  demandPrediction: {
    services: string[]
    predictedVolume: number
    confidence: number
  }
  growthPrediction: {
    userGrowth: number
    partnerGrowth: number
    revenueGrowth: number
    confidence: number
  }
  riskAssessment: {
    overall: string
    factors: {
      market: string
      competition: string
      technology: string
    }
  }
  opportunityAnalysis: {
    opportunities: string[]
    potential: number
    confidence: number
  }
}

interface RealtimeAnalytics {
  activeUsers: number
  activePartners: number
  currentBookings: number
  currentRevenue: number
  systemLoad: number
  errorRate: number
  responseTime: number
  timestamp: string
}

interface AdvancedAnalyticsProps {
  onMetricUpdate?: (metric: string, value: any) => void
}

export default function AdvancedAnalytics({ onMetricUpdate }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'funnel' | 'retention' | 'cohort' | 'predictive' | 'realtime'>('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null)
  const [retention, setRetention] = useState<RetentionAnalytics | null>(null)
  const [cohort, setCohort] = useState<CohortAnalytics | null>(null)
  const [predictive, setPredictive] = useState<PredictiveAnalytics | null>(null)
  const [realtime, setRealtime] = useState<RealtimeAnalytics | null>(null)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAdvancedDashboard()
    } else if (activeTab === 'funnel') {
      fetchFunnelAnalytics()
    } else if (activeTab === 'retention') {
      fetchRetentionAnalytics()
    } else if (activeTab === 'cohort') {
      fetchCohortAnalytics()
    } else if (activeTab === 'predictive') {
      fetchPredictiveAnalytics()
    } else if (activeTab === 'realtime') {
      fetchRealtimeAnalytics()
    }
  }, [activeTab, selectedPeriod])

  useEffect(() => {
    // Set up real-time updates
    const interval = setInterval(() => {
      if (activeTab === 'realtime') {
        fetchRealtimeAnalytics()
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [activeTab])

  const fetchAdvancedDashboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?type=dashboard&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching advanced dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFunnelAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?type=funnel&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setFunnel(data.funnel)
      }
    } catch (error) {
      console.error('Error fetching funnel analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRetentionAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?type=retention&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setRetention(data.retention)
      }
    } catch (error) {
      console.error('Error fetching retention analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCohortAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?type=cohort&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setCohort(data.cohort)
      }
    } catch (error) {
      console.error('Error fetching cohort analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPredictiveAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?type=predictive&period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setPredictive(data.predictive)
      }
    } catch (error) {
      console.error('Error fetching predictive analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRealtimeAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced?type=realtime')
      const data = await response.json()
      
      if (data.success) {
        setRealtime(data.realtime)
      }
    } catch (error) {
      console.error('Error fetching realtime analytics:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 20) return 'text-green-600'
    if (risk <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive business intelligence and predictive analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === 'dashboard') {
                fetchAdvancedDashboard()
              } else if (activeTab === 'funnel') {
                fetchFunnelAnalytics()
              } else if (activeTab === 'retention') {
                fetchRetentionAnalytics()
              } else if (activeTab === 'cohort') {
                fetchCohortAnalytics()
              } else if (activeTab === 'predictive') {
                fetchPredictiveAnalytics()
              } else if (activeTab === 'realtime') {
                fetchRealtimeAnalytics()
              }
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3Icon className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'funnel' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('funnel')}
        >
          <TrendingUpIcon className="w-4 h-4 mr-2" />
          Funnel
        </Button>
        <Button
          variant={activeTab === 'retention' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('retention')}
        >
          <Users className="w-4 h-4 mr-2" />
          Retention
        </Button>
        <Button
          variant={activeTab === 'cohort' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('cohort')}
        >
          <ActivityIcon className="w-4 h-4 mr-2" />
          Cohort
        </Button>
        <Button
          variant={activeTab === 'predictive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('predictive')}
        >
          <BrainIcon className="w-4 h-4 mr-2" />
          Predictive
        </Button>
        <Button
          variant={activeTab === 'realtime' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('realtime')}
        >
          <Monitor className="w-4 h-4 mr-2" />
          Real-time
        </Button>
      </div>

      {/* Advanced Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Growth</p>
                    <p className="text-2xl font-bold">{metrics?.userGrowthRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getGrowthIcon(metrics?.userGrowthRate || 0)}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {getGrowthIcon(metrics?.userGrowthRate || 0)}
                  <span className={`text-sm ${getGrowthColor(metrics?.userGrowthRate || 0)}`}>
                    {metrics?.userGrowthRate > 0 ? '+' : ''}{metrics?.userGrowthRate?.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Partner Growth</p>
                    <p className="text-2xl font-bold">{metrics?.partnerGrowthRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    {getGrowthIcon(metrics?.partnerGrowthRate || 0)}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {getGrowthIcon(metrics?.partnerGrowthRate || 0)}
                  <span className={`text-sm ${getGrowthColor(metrics?.partnerGrowthRate || 0)}`}>
                    {metrics?.partnerGrowthRate > 0 ? '+' : ''}{metrics?.partnerGrowthRate?.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                    <p className="text-2xl font-bold">{metrics?.revenueGrowthRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    {getGrowthIcon(metrics?.revenueGrowthRate || 0)}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {getGrowthIcon(metrics?.revenueGrowthRate || 0)}
                  <span className={`text-sm ${getGrowthColor(metrics?.revenueGrowthRate || 0)}`}>
                    {metrics?.revenueGrowthRate > 0 ? '+' : ''}{metrics?.revenueGrowthRate?.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold">{metrics?.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">
                    {metrics?.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Engagement</p>
                    <p className="text-2xl font-bold">{metrics?.userEngagementScore.toFixed(0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className={`font-medium ${getScoreColor(metrics?.userEngagementScore || 0)}`}>
                      {metrics?.userEngagementScore.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={metrics?.userEngagementScore || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Partner Engagement</p>
                    <p className="text-2xl font-bold">{metrics?.partnerEngagementScore.toFixed(0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className={`font-medium ${getScoreColor(metrics?.partnerEngagementScore || 0)}`}>
                      {metrics?.partnerEngagementScore.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={metrics?.partnerEngagementScore || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">{metrics?.customerSatisfactionScore}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">NPS Score</span>
                    <span className={`font-medium ${getScoreColor(metrics?.customerSatisfactionScore || 0)}`}>
                      {metrics?.customerSatisfactionScore}
                    </span>
                  </div>
                  <Progress value={metrics?.customerSatisfactionScore || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Content Engagement</p>
                    <p className="text-2xl font-bold">{metrics?.contentEngagementRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Engagement Rate</span>
                    <span className="font-medium text-purple-600">
                      {metrics?.contentEngagementRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics?.contentEngagementRate || 0} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{Math.round((metrics?.avgResponseTime || 0) / 60)}m</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Target</span>
                    <span className="font-medium text-green-600">30m</span>
                  </div>
                  <Progress value={Math.min(100, (30 / ((metrics?.avgResponseTime || 1800) / 60)) * 100)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                    <p className="text-2xl font-bold">{Math.round((metrics?.avgResolutionTime || 0) / 3600)}h</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Target</span>
                    <span className="font-medium text-green-600">24h</span>
                  </div>
                  <Progress value={Math.min(100, (24 / ((metrics?.avgResolutionTime || 86400) / 3600)) * 100)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Risk</p>
                    <p className="text-2xl font-bold">{metrics?.churnRisk.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Risk Level</span>
                    <span className={`font-medium ${getRiskColor(metrics?.churnRisk || 0)}`}>
                      {metrics?.churnRisk <= 20 ? 'Low' : metrics?.churnRisk <= 50 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <Progress value={100 - (metrics?.churnRisk || 0)} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer LTV</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics?.ltv || 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Average</span>
                    <span className="font-medium text-purple-600">
                      {formatCurrency((metrics?.ltv || 0) / 12)}/mo
                    </span>
                  </div>
                  <Progress value={Math.min(100, ((metrics?.ltv || 0) / 10000) * 100)} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Funnel Analytics Tab */}
      {activeTab === 'funnel' && funnel && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnel.steps.map((step, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm font-bold">{formatNumber(step.count)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(step.count / funnel.steps[0].count) * 100}%` }}
                        />
                      </div>
                      {index < funnel.steps.length - 1 && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Conversion: {funnel.conversionRates[index]?.toFixed(1)}%</span>
                          <span>Dropoff: {funnel.dropoffRates[index]?.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funnel Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Conversion Rate</span>
                    <span className="text-sm font-bold">{funnel.overallConversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Dropoff</span>
                    <span className="text-sm font-bold">{funnel.dropoffRates[0]?.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel Bottlenecks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel.bottlenecks.length > 0 ? (
                  funnel.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-800">{bottleneck.step}</p>
                        <p className="text-xs text-red-600">Dropoff: {bottleneck.dropoffRate.toFixed(1)}%</p>
                      </div>
                      <Badge className={bottleneck.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {bottleneck.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">No bottlenecks detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel.optimization.length > 0 ? (
                  funnel.optimization.map((opt, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">{opt.step}</p>
                          <p className="text-xs text-blue-600">{opt.issue}</p>
                          <p className="text-xs text-blue-600 mt-1">{opt.recommendation}</p>
                        </div>
                        <Badge className={opt.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                          {opt.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Funnel is performing well</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retention Analytics Tab */}
      {activeTab === 'retention' && retention && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Retention Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Users</span>
                    <span className={`text-sm font-bold ${getScoreColor(retention.userRetention.rate)}`}>
                      {retention.userRetention.rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Partners</span>
                    <span className={`text-sm font-bold ${getScoreColor(retention.partnerRetention.rate)}`}>
                      {retention.partnerRetention.rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscriptions</span>
                    <span className={`text-sm font-bold ${getScoreColor(retention.subscriptionRetention.rate)}`}>
                      {retention.subscriptionRetention.rate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Lifetime Value */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(retention.customerLifetimeValue.value)}
                    </p>
                    <p className="text-sm text-gray-600">Average LTV</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getGrowthIcon(retention.customerLifetimeValue.trend === 'increasing' ? 5 : -5)}
                    <span className={`text-sm ${getGrowthColor(retention.customerLifetimeValue.trend === 'increasing' ? 5 : -5)}`}>
                      {retention.customerLifetimeValue.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Churn Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {retention.churnAnalysis.rate}%
                    </p>
                    <p className="text-sm text-gray-600">Churn Rate</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge className={getRiskColor(retention.churnAnalysis.rate)}>
                      {retention.churnAnalysis.risk}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium">Churn Reasons:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {retention.churnAnalysis.reasons.map((reason, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retention Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Retention Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(retention.retentionSegments).map(([segment, data]) => (
                  <div key={segment} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{segment} Value</span>
                      <span className="text-sm text-gray-500">{data.count} customers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retention Rate</span>
                      <span className={`text-sm font-bold ${getScoreColor(data.retentionRate)}`}>
                        {data.retentionRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cohort Analysis Tab */}
      {activeTab === 'cohort' && cohort && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cohort Table */}
            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Cohort</th>
                        <th className="text-left p-2">Users</th>
                        <th className="text-left p-2">Month 1</th>
                        <th className="text-left p-2">Month 2</th>
                        <th className="text-left p-2">Month 3</th>
                        <th className="text-left p-2">Month 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohort.cohorts.map((cohort, index) => (
                        <tr key={index}>
                          <td className="p-2">{cohort.month}</td>
                          <td className="p-2">{cohort.users}</td>
                          {cohort.retention.map((rate, i) => (
                            <td key={i} className="p-2">{rate}%</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cohort Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Cohort Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Retention Rate</span>
                    <span className="text-sm font-bold">{cohort.metrics.avgRetentionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average LTV</span>
                    <span className="text-sm font-bold">{formatCurrency(cohort.metrics.avgLifetimeValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Comparison</span>
                    <span className="text-sm font-bold text-green-600">{cohort.metrics.cohortComparison}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'predictive' && predictive && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Churn Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>User Churn Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {predictive.userChurnPrediction.atRiskUsers}
                    </p>
                    <p className="text-sm text-gray-600">At-Risk Users</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Probability</span>
                    <span className="text-sm font-bold">{(predictive.userChurnPrediction.churnProbability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {predictive.userChurnPrediction.riskFactors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(predictive.revenueForecast.predicted)}
                    </p>
                    <p className="text-sm text-gray-600">Predicted Revenue</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm font-bold">{(predictive.revenueForecast.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getGrowthIcon(predictive.revenueForecast.trend === 'increasing' ? 5 : -5)}
                    <span className={`text-sm ${getGrowthColor(predictive.revenueForecast.trend === 'increasing' ? 5 : -5)}`}>
                      {predictive.revenueForecast.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User Growth</span>
                      <span className="text-sm font-bold">+{predictive.growthPrediction.userGrowth}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Partner Growth</span>
                      <span className="text-sm font-bold">+{predictive.growthPrediction.partnerGrowth}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <span className="text-sm font-bold">+{predictive.growthPrediction.revenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm font-bold">{(predictive.growthPrediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {predictive.riskAssessment.overall}
                  </p>
                  <p className="text-sm text-gray-600">Overall Risk</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Market</span>
                    <span className={`text-sm font-bold ${getRiskColor(predictive.riskAssessment.factors.market === 'low' ? 20 : predictive.riskAssessment.factors.market === 'medium' ? 50 : 80)}`}>
                      {predictive.riskAssessment.factors.market}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Competition</span>
                    <span className={`text-sm font-bold ${getRiskColor(predictive.riskAssessment.factors.competition === 'low' ? 20 : predictive.riskAssessment.factors.competition === 'medium' ? 50 : 80)}`}>
                      {predictive.riskAssessment.factors.competition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Technology</span>
                    <span className={`text-sm font-bold ${getRiskColor(predictive.riskAssessment.factors.technology === 'low' ? 20 : predictive.riskAssessment.factors.technology === 'medium' ? 50 : 80)}`}>
                      {predictive.riskAssessment.factors.technology}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(predictive.opportunityAnalysis.potential)}
                  </p>
                  <p className="text-sm text-gray-600">Potential Revenue</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Opportunities:</p>
                  <div className="flex flex-wrap gap-2">
                    {predictive.opportunityAnalysis.opportunities.map((opportunity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {opportunity}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm font-bold">{(predictive.opportunityAnalysis.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Analytics Tab */}
      {activeTab === 'realtime' && realtime && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(realtime.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Users */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{realtime.activeUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Partners */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Partners</p>
                    <p className="text-2xl font-bold">{realtime.activePartners}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Bookings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Bookings</p>
                    <p className="text-2xl font-bold">{realtime.currentBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Revenue */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(realtime.currentRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Load */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Load</p>
                    <p className="text-2xl font-bold">{realtime.systemLoad}%</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={realtime.systemLoad} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">{realtime.errorRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={realtime.errorRate} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{realtime.responseTime}ms</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">All Systems Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}