'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard,
  Calendar,
  Download,
  Filter
} from 'lucide-react'

interface RevenueAnalyticsProps {
  dateRange?: string
}

interface RevenueData {
  month: string
  revenue: number
  costs: number
  profit: number
  growth: number
  subscriptions: number
  oneTimePayments: number
}

interface RevenueSource {
  source: string
  revenue: number
  percentage: number
  color: string
}

export default function RevenueAnalytics({ dateRange = '30d' }: RevenueAnalyticsProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [revenueSources, setRevenueSources] = useState<RevenueSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  const mockRevenueData: RevenueData[] = [
    {
      month: 'Jan 2024',
      revenue: 15000,
      costs: 8000,
      profit: 7000,
      growth: 12.5,
      subscriptions: 10000,
      oneTimePayments: 5000
    },
    {
      month: 'Feb 2024',
      revenue: 18000,
      costs: 9000,
      profit: 9000,
      growth: 20.0,
      subscriptions: 12000,
      oneTimePayments: 6000
    },
    {
      month: 'Mar 2024',
      revenue: 22000,
      costs: 10000,
      profit: 12000,
      growth: 22.2,
      subscriptions: 15000,
      oneTimePayments: 7000
    }
  ]

  const mockRevenueSources: RevenueSource[] = [
    {
      source: 'Subscriptions',
      revenue: 37000,
      percentage: 68.5,
      color: 'bg-blue-500'
    },
    {
      source: 'Service Fees',
      revenue: 12000,
      percentage: 22.2,
      color: 'bg-green-500'
    },
    {
      source: 'Insurance',
      revenue: 3000,
      percentage: 5.6,
      color: 'bg-purple-500'
    },
    {
      source: 'Other',
      revenue: 2000,
      percentage: 3.7,
      color: 'bg-orange-500'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRevenueData(mockRevenueData)
      setRevenueSources(mockRevenueSources)
      setIsLoading(false)
    }, 1000)
  }, [dateRange])

  const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0)
  const totalCosts = revenueData.reduce((sum, data) => sum + data.costs, 0)
  const totalProfit = revenueData.reduce((sum, data) => sum + data.profit, 0)
  const averageGrowth = revenueData.length > 0 
    ? revenueData.reduce((sum, data) => sum + data.growth, 0) / revenueData.length 
    : 0

  const currentMonth = revenueData[revenueData.length - 1]
  const previousMonth = revenueData[revenueData.length - 2]

  const revenueGrowth = previousMonth 
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
    : 0

  const profitGrowth = previousMonth 
    ? ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100 
    : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{revenueGrowth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{profitGrowth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Operating costs
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average profit margin
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Revenue Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-gray-500">{source.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${source.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{data.month}</p>
                    <p className="text-sm text-gray-500">
                      {data.subscriptions.toLocaleString()} subscriptions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${data.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {data.profit > 0 ? '+' : ''}{data.profit.toLocaleString()} profit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Revenue Analytics</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Monthly Recurring</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    ${currentMonth.subscriptions.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">
                    {((currentMonth.subscriptions / currentMonth.revenue) * 100).toFixed(1)}% of revenue
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">One-Time Payments</h4>
                  <p className="text-2xl font-bold text-green-900">
                    ${currentMonth.oneTimePayments.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    {((currentMonth.oneTimePayments / currentMonth.revenue) * 100).toFixed(1)}% of revenue
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">Growth Rate</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {averageGrowth.toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-600">
                    Average monthly growth
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="subscriptions" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Active Subscriptions</h4>
                  <p className="text-2xl font-bold text-blue-900">1,234</p>
                  <p className="text-sm text-blue-600">+12% from last month</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">MRR (Monthly Recurring)</h4>
                  <p className="text-2xl font-bold text-green-900">
                    ${currentMonth.subscriptions.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    {((currentMonth.subscriptions / 1234) * 100).toFixed(1)}% per user
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800">Payment Success Rate</h4>
                  <p className="text-2xl font-bold text-orange-900">98.5%</p>
                  <p className="text-sm text-orange-600">Last 30 days</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">Failed Payments</h4>
                  <p className="text-2xl font-bold text-red-900">15</p>
                  <p className="text-sm text-red-600">1.5% failure rate</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}