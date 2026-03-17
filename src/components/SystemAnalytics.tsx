'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Thermometer,
  Monitor,
  Database,
  Cloud,
  RefreshCw
} from 'lucide-react'

interface SystemAnalyticsProps {
  refreshInterval?: number
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  icon: React.ReactNode
  description: string
}

interface SystemAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
}

interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  timestamp: string
  source: string
}

export default function SystemAnalytics({ refreshInterval = 30000 }: SystemAnalyticsProps) {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Mock metrics data
  const mockMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'normal',
      threshold: { warning: 70, critical: 90 },
      icon: <Cpu className="w-4 h-4" />,
      description: 'Current CPU utilization'
    },
    {
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      status: 'warning',
      threshold: { warning: 60, critical: 80 },
      icon: <Monitor className="w-4 h-4" />,
      description: 'RAM utilization'
    },
    {
      name: 'Disk Usage',
      value: 35,
      unit: '%',
      status: 'normal',
      threshold: { warning: 80, critical: 95 },
      icon: <HardDrive className="w-4 h-4" />,
      description: 'Storage utilization'
    },
    {
      name: 'Network Traffic',
      value: 25,
      unit: 'Mbps',
      status: 'normal',
      threshold: { warning: 80, critical: 95 },
      icon: <Wifi className="w-4 h-4" />,
      description: 'Network bandwidth usage'
    },
    {
      name: 'Database Connections',
      value: 12,
      unit: '',
      status: 'normal',
      threshold: { warning: 15, critical: 20 },
      icon: <Database className="w-4 h-4" />,
      description: 'Active database connections'
    },
    {
      name: 'API Response Time',
      value: 120,
      unit: 'ms',
      status: 'normal',
      threshold: { warning: 200, critical: 500 },
      icon: <Zap className="w-4 h-4" />,
      description: 'Average API response time'
    },
    {
      name: 'Server Temperature',
      value: 65,
      unit: '°C',
      status: 'normal',
      threshold: { warning: 70, critical: 85 },
      icon: <Thermometer className="w-4 h-4" />,
      description: 'Server temperature'
    },
    {
      name: 'Uptime',
      value: 99.9,
      unit: '%',
      status: 'normal',
      threshold: { warning: 99, critical: 95 },
      icon: <Activity className="w-4 h-4" />,
      description: 'System uptime percentage'
    }
  ]

  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage is above warning threshold',
      timestamp: '2024-01-15T10:30:00Z',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      description: 'System maintenance scheduled for tonight',
      timestamp: '2024-01-15T09:00:00Z',
      resolved: false
    }
  ]

  const mockLogs: SystemLog[] = [
    {
      id: '1',
      level: 'info',
      message: 'System started successfully',
      timestamp: '2024-01-15T10:00:00Z',
      source: 'system'
    },
    {
      id: '2',
      level: 'warning',
      message: 'Memory usage approaching warning threshold',
      timestamp: '2024-01-15T10:15:00Z',
      source: 'monitor'
    },
    {
      id: '3',
      level: 'error',
      message: 'Database connection failed',
      timestamp: '2024-01-15T10:20:00Z',
      source: 'database'
    }
  ]

  useEffect(() => {
    const fetchData = () => {
      setMetrics(mockMetrics)
      setAlerts(mockAlerts)
      setLogs(mockLogs)
      setLastRefresh(new Date())
      setIsLoading(false)
    }

    fetchData()
    
    const interval = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      case 'debug': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const criticalMetrics = metrics.filter(m => m.status === 'critical')
  const warningMetrics = metrics.filter(m => m.status === 'warning')
  const normalMetrics = metrics.filter(m => m.status === 'normal')

  const activeAlerts = alerts.filter(a => !a.resolved)
  const criticalAlerts = activeAlerts.filter(a => a.type === 'critical')
  const warningAlerts = activeAlerts.filter(a => a.type === 'warning')

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
      {/* System Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Analytics</h2>
          <p className="text-gray-600">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                criticalMetrics.length > 0 ? 'bg-red-500' :
                warningMetrics.length > 0 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></div>
              <span className="text-lg font-bold">
                {criticalMetrics.length > 0 ? 'Critical' :
                 warningMetrics.length > 0 ? 'Warning' : 'Normal'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {normalMetrics.length} normal, {warningMetrics.length} warning, {criticalMetrics.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts.length} critical, {warningAlerts.length} warning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.filter(m => m.status === 'normal').length > metrics.length / 2 ? 'Good' : 'Fair'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on system metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.find(m => m.name === 'Uptime')?.value.toFixed(1) || '99.9'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </span>
                  <Badge className={getStatusBgColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <Progress 
                  value={metric.threshold.critical} 
                  max={metric.threshold.critical}
                  className={`h-2 ${
                    metric.status === 'critical' ? 'bg-red-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      alert.type === 'critical' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{alert.title}</p>
                        <Badge className={getStatusBgColor(alert.type)}>
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1 ${getLogColor(log.level)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{log.message}</p>
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{log.source}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">System Information</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">OS:</span> Linux Ubuntu 22.04</p>
                    <p className="text-sm"><span className="font-medium">Kernel:</span> 5.15.0</p>
                    <p className="text-sm"><span className="font-medium">Architecture:</span> x86_64</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Application</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">Version:</span> 1.0.0</p>
                    <p className="text-sm"><span className="font-medium">Node.js:</span> 18.17.0</p>
                    <p className="text-sm"><span className="font-medium">Environment:</span> Production</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                {metrics.filter(m => m.name.includes('CPU') || m.name.includes('Memory') || m.name.includes('API')).map((metric) => (
                  <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">{metric.name}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm"><span className="font-medium">Current:</span> {metric.value}{metric.unit}</p>
                      <p className="text-sm"><span className="font-medium">Status:</span> 
                        <span className={`ml-2 ${getStatusColor(metric.status)}`}>{metric.status}</span>
                      </p>
                      <p className="text-sm"><span className="font-medium">Threshold:</span> 
                        Warning: {metric.threshold.warning}{metric.unit}, Critical: {metric.threshold.critical}{metric.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="infrastructure" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">Network</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">Bandwidth:</span> 1 Gbps</p>
                    <p className="text-sm"><span className="font-medium">Latency:</span> 12ms</p>
                    <p className="text-sm"><span className="font-medium">Uptime:</span> 99.9%</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800">Storage</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="font-medium">Total:</span> 500 GB</p>
                    <p className="text-sm"><span className="font-medium">Used:</span> 175 GB</p>
                    <p className="text-sm"><span className="font-medium">Available:</span> 325 GB</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}