import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'overview', 'revenue', 'users', 'partners', 'services'
    const period = searchParams.get('period') // 'day', 'week', 'month', 'quarter', 'year'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let analyticsData: any = {}

    switch (type) {
      case 'overview':
        analyticsData = await getOverviewAnalytics(period || undefined, startDate || undefined, endDate || undefined)
        break
      case 'revenue':
        analyticsData = await getRevenueAnalytics(period || undefined, startDate || undefined, endDate || undefined)
        break
      case 'users':
        analyticsData = await getUserAnalytics(period || undefined, startDate || undefined, endDate || undefined)
        break
      case 'partners':
        analyticsData = await getPartnerAnalytics(period || undefined, startDate || undefined, endDate || undefined)
        break
      case 'services':
        analyticsData = await getServiceAnalytics(period || undefined, startDate || undefined, endDate || undefined)
        break
      default:
        analyticsData = await getOverviewAnalytics(period || undefined, startDate || undefined, endDate || undefined)
    }

    return NextResponse.json({
      success: true,
      type,
      period,
      data: analyticsData
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}

async function getOverviewAnalytics(period?: string, startDate?: string, endDate?: string) {
  const dateRange = getDateRange(period, startDate, endDate)

  const [
    totalUsers,
    totalPartners,
    totalVehicles,
    totalOrders,
    totalBookings,
    totalPayments,
    activeUsers,
    activePartners,
    completedBookings,
    completedPayments,
    totalRevenue
  ] = await Promise.all([
    db.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.partner.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.vehicle.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.qRCodeOrder.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.serviceBooking.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.payment.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.partner.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    db.serviceBooking.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        status: 'completed'
      }
    }),
    db.payment.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        status: 'completed'
      }
    }),
    db.payment.aggregate({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        status: 'completed'
      },
      _sum: { amount: true }
    })
  ])

  return {
    overview: {
      totalUsers,
      totalPartners,
      totalVehicles,
      totalOrders,
      totalBookings,
      totalPayments,
      activeUsers,
      activePartners,
      completedBookings,
      completedPayments,
      totalRevenue: totalRevenue._sum.amount || 0
    },
    growth: {
      userGrowth: await calculateGrowthRate('user', dateRange),
      partnerGrowth: await calculateGrowthRate('partner', dateRange),
      orderGrowth: await calculateGrowthRate('order', dateRange),
      bookingGrowth: await calculateGrowthRate('booking', dateRange)
    }
  }
}

async function getRevenueAnalytics(period?: string, startDate?: string, endDate?: string) {
  const dateRange = getDateRange(period, startDate, endDate)

  // Revenue by period
  const revenueByPeriod = await db.payment.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      status: 'completed'
    },
    _sum: { amount: true }
  })

  // Revenue by payment method
  const revenueByMethod = await db.payment.groupBy({
    by: ['paymentMethod'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      status: 'completed'
    },
    _sum: { amount: true }
  })

  // Revenue by service type
  const revenueByService = await db.serviceBooking.groupBy({
    by: ['serviceType'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      status: 'completed'
    },
    _count: true
  })

  // Average order value
  const avgOrderValue = await db.qRCodeOrder.aggregate({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _avg: { totalPrice: true }
  })

  // Top revenue sources
  const topRevenueSources = await db.payment.groupBy({
    by: ['orderId'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      status: 'completed'
    },
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' }
    },
    take: 10
  })

  return {
    totalRevenue: revenueByPeriod.reduce((sum, item) => sum + (item._sum.amount || 0), 0),
    revenueByPeriod: revenueByPeriod.map(item => ({
      date: item.createdAt,
      revenue: item._sum.amount || 0
    })),
    revenueByMethod: revenueByMethod.map(item => ({
      method: item.paymentMethod,
      revenue: item._sum.amount || 0
    })),
    revenueByService: revenueByService.map(item => ({
      serviceType: item.serviceType,
      count: item._count,
      avgRevenue: (item._count * avgOrderValue._avg.totalPrice || 0)
    })),
    avgOrderValue: avgOrderValue._avg.totalPrice || 0,
    topRevenueSources: topRevenueSources.map(item => ({
      orderId: item.orderId,
      revenue: item._sum.amount || 0
    }))
  }
}

async function getUserAnalytics(period?: string, startDate?: string, endDate?: string) {
  const dateRange = getDateRange(period, startDate, endDate)

  // User registration trends
  const userRegistrations = await db.user.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // User activity
  const activeUsers = await db.user.findMany({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    include: {
      _count: {
        select: {
          vehicles: true,
          orders: true,
          bookings: true
        }
      }
    }
  })

  // User demographics
  const userStats = await db.user.aggregate({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  return {
    totalUsers: userStats._count,
    userRegistrations: userRegistrations.map(item => ({
      date: item.createdAt,
      count: item._count
    })),
    activeUsers: activeUsers.length,
    avgVehiclesPerUser: activeUsers.reduce((sum, user) => sum + user._count.vehicles, 0) / activeUsers.length || 0,
    avgOrdersPerUser: activeUsers.reduce((sum, user) => sum + user._count.orders, 0) / activeUsers.length || 0,
    avgBookingsPerUser: activeUsers.reduce((sum, user) => sum + user._count.bookings, 0) / activeUsers.length || 0,
    userActivity: {
      totalVehicles: activeUsers.reduce((sum, user) => sum + user._count.vehicles, 0),
      totalOrders: activeUsers.reduce((sum, user) => sum + user._count.orders, 0),
      totalBookings: activeUsers.reduce((sum, user) => sum + user._count.bookings, 0)
    }
  }
}

async function getPartnerAnalytics(period?: string, startDate?: string, endDate?: string) {
  const dateRange = getDateRange(period, startDate, endDate)

  // Partner registration trends
  const partnerRegistrations = await db.partner.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // Partner performance
  const partners = await db.partner.findMany({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    include: {
      _count: {
        select: {
          mechanics: true,
          serviceBookings: true,
          earnings: true
        }
      }
    }
  })

  // Partner earnings
  const partnerEarnings = await db.earning.groupBy({
    by: ['partnerId'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _sum: { amount: true }
  })

  return {
    totalPartners: partners.length,
    partnerRegistrations: partnerRegistrations.map(item => ({
      date: item.createdAt,
      count: item._count
    })),
    activePartners: partners.filter(p => p.isActive && p.isVerified).length,
    avgRating: partners.reduce((sum, p) => sum + (p.rating || 0), 0) / partners.length || 0,
    avgMechanicsPerPartner: partners.reduce((sum, p) => sum + p._count.mechanics, 0) / partners.length || 0,
    avgBookingsPerPartner: partners.reduce((sum, p) => sum + p._count.serviceBookings, 0) / partners.length || 0,
    topPerformers: partners
      .map(partner => ({
        id: partner.id,
        businessName: partner.businessName,
        rating: partner.rating,
        totalBookings: partner._count.serviceBookings,
        totalEarnings: partnerEarnings.find(e => e.partnerId === partner.id)?._sum.amount || 0
      }))
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 10),
    partnerStats: {
      totalMechanics: partners.reduce((sum, p) => sum + p._count.mechanics, 0),
      totalBookings: partners.reduce((sum, p) => sum + p._count.serviceBookings, 0),
      totalEarnings: partnerEarnings.reduce((sum, e) => sum + (e._sum.amount || 0), 0)
    }
  }
}

async function getServiceAnalytics(period?: string, startDate?: string, endDate?: string) {
  const dateRange = getDateRange(period, startDate, endDate)

  // Service booking trends
  const serviceBookings = await db.serviceBooking.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // Service type distribution
  const serviceTypeDistribution = await db.serviceBooking.groupBy({
    by: ['serviceType'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // Service status distribution
  const statusDistribution = await db.serviceBooking.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // Urgency distribution
  const urgencyDistribution = await db.serviceBooking.groupBy({
    by: ['urgency'],
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    _count: true
  })

  // Response time analytics
  const completedBookings = await db.serviceBooking.findMany({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      status: 'completed'
    },
    select: {
      createdAt: true,
      assignedAt: true,
      completedAt: true
    }
  })

  const avgResponseTime = completedBookings.reduce((sum, booking) => {
    if (booking.assignedAt && booking.createdAt) {
      const responseTime = new Date(booking.assignedAt).getTime() - new Date(booking.createdAt).getTime()
      return sum + responseTime
    }
    return sum
  }, 0) / completedBookings.length

  const avgServiceTime = completedBookings.reduce((sum, booking) => {
    if (booking.completedAt && booking.assignedAt) {
      const serviceTime = new Date(booking.completedAt).getTime() - new Date(booking.assignedAt).getTime()
      return sum + serviceTime
    }
    return sum
  }, 0) / completedBookings.length

  return {
    totalBookings: serviceBookings.reduce((sum, item) => sum + item._count, 0),
    serviceBookings: serviceBookings.map(item => ({
      date: item.createdAt,
      count: item._count
    })),
    serviceTypeDistribution: serviceTypeDistribution.map(item => ({
      serviceType: item.serviceType,
      count: item._count
    })),
    statusDistribution: statusDistribution.map(item => ({
      status: item.status,
      count: item._count
    })),
    urgencyDistribution: urgencyDistribution.map(item => ({
      urgency: item.urgency,
      count: item._count
    })),
    performance: {
      avgResponseTime: Math.round(avgResponseTime / (1000 * 60)), // Convert to minutes
      avgServiceTime: Math.round(avgServiceTime / (1000 * 60)), // Convert to minutes
      completionRate: (completedBookings.length / serviceBookings.reduce((sum, item) => sum + item._count, 0)) * 100
    }
  }
}

function getDateRange(period?: string, startDate?: string, endDate?: string) {
  const now = new Date()
  let start: Date
  let end: Date = now

  if (startDate && endDate) {
    start = new Date(startDate)
    end = new Date(endDate)
  } else {
    switch (period) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        end = now
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        end = now
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        end = now
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = now
    }
  }

  return { start, end }
}

function calculateGrowthRate(entity: string, dateRange: { start: Date; end: Date }) {
  // Calculate growth rate compared to previous period
  const previousPeriod = {
    start: new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime())),
    end: dateRange.start
  }

  // This is a simplified calculation - in production, you'd fetch actual data for comparison
  return 0 // Placeholder for growth rate calculation
}