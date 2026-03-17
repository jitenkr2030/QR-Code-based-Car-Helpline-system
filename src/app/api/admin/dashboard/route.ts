import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get dashboard statistics
    const [
      totalUsers,
      totalPartners,
      totalVehicles,
      totalOrders,
      totalBookings,
      totalPayments,
      activePartners,
      completedBookings,
      completedPayments,
      totalRevenue
    ] = await Promise.all([
      db.user.count(),
      db.partner.count(),
      db.vehicle.count(),
      db.qRCodeOrder.count(),
      db.serviceBooking.count(),
      db.payment.count(),
      db.partner.count({ where: { isActive: true, isVerified: true } }),
      db.serviceBooking.count({ where: { status: 'completed' } }),
      db.payment.count({ where: { status: 'completed' } }),
      db.payment.aggregate({ _sum: { amount: true } })
    ])

    // Get recent activities
    const [
      recentUsers,
      recentPartners,
      recentOrders,
      recentBookings
    ] = await Promise.all([
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              vehicles: true
            }
          }
        }
      }),
      db.partner.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          email: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              mechanics: true
            }
          }
        }
      }),
      db.qRCodeOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderId: true,
          qrType: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      db.serviceBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serviceType: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true
            }
          }
        }
      })
    ])

    // Format response
    const dashboardData = {
      stats: {
        totalUsers,
        totalPartners,
        totalVehicles,
        totalOrders,
        totalBookings,
        totalPayments,
        activePartners,
        completedBookings,
        completedPayments,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recent: {
        users: recentUsers,
        partners: recentPartners,
        orders: recentOrders,
        bookings: recentBookings
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}