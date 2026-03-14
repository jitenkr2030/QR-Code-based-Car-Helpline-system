import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'tickets', 'categories', 'kb', 'responses'
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'tickets':
        return await getTickets(userId, partnerId, status, priority, categoryId, limit, offset)
      case 'categories':
        return await getCategories()
      case 'kb':
        return await getKB()
      case 'responses':
        return await getResponses(id)
      case 'ticket':
        return await getTicket(id)
      case 'category':
        return await getCategory(id)
      case 'kb-article':
        return await getKBArticle(id)
      default:
        return await getTickets(userId, partnerId, status, priority, categoryId, limit, offset)
    }

  } catch (error) {
    console.error('Error in support API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    switch (type) {
      case 'ticket':
        return await createTicket(data)
      case 'category':
        return await createCategory(data)
      case 'kb':
        return await createKBArticle(data)
      case 'response':
        return await createResponse(data)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in support API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    switch (type) {
      case 'ticket':
        return await updateTicket(id, data)
      case 'category':
        return await updateCategory(id, data)
      case 'kb':
        return await updateKBArticle(id, data)
      case 'response':
        return await updateResponse(id, data)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in support API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    switch (type) {
      case 'ticket':
        return await deleteTicket(id)
      case 'category':
        return await deleteCategory(id)
      case 'kb':
        return await deleteKBArticle(id)
      case 'response':
        return await deleteResponse(id)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in support API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function getTickets(userId?: string, partnerId?: string, status?: string, priority?: string, categoryId?: string, limit: number = 10, offset: number = 0) {
  let whereClause: any = {}

  if (userId) {
    whereClause.userId = userId
  }

  if (partnerId) {
    whereClause.partnerId = partnerId
  }

  if (status && status !== 'all') {
    whereClause.status = status
  }

  if (priority && priority !== 'all') {
    whereClause.priority = priority
  }

  if (categoryId) {
    whereClause.categoryId = categoryId
  }

  const tickets = await db.supportTicket.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      partner: {
        select: {
          id: true,
          businessName: true,
          email: true,
          phone: true
        }
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
        }
      },
      responses: {
        include: {
          responder: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          responses: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })

  return NextResponse.json({
    success: true,
    tickets: tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      tags: ticket.tags ? JSON.parse(ticket.tags) : [],
      attachments: ticket.attachments ? JSON.parse(ticket.attachments) : [],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      closedAt: ticket.closedAt?.toISOString(),
      user: ticket.user,
      partner: ticket.partner,
      assignedUser: ticket.assignedUser,
      category: ticket.category,
      responsesCount: ticket._count.responses,
      lastResponse: ticket.responses[0] || null
    }))
  })
}

async function getCategories() {
  const categories = await db.supportCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc', name: 'asc' },
    include: {
      _count: {
        select: {
          tickets: true
        }
      }
    }
  })

  return NextResponse.json({
    success: true,
    categories: categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      ticketsCount: category._count.tickets,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }))
  })
}

async function getKB() {
  const articles = await db.supportKB.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    articles: articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      isPublished: article.isPublished,
      viewCount: article.viewCount,
      helpfulCount: article.helpfulCount,
      createdBy: article.createdBy,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }))
  })
}

async function getResponses(ticketId: string) {
  if (!ticketId) {
    return NextResponse.json({ 
      error: 'Ticket ID is required' 
    }, { status: 400 })
  }

  const responses = await db.supportResponse.findMany({
    where: { ticketId },
    include: {
      responder: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json({
    success: true,
    responses: responses.map(response => ({
      id: response.id,
      content: response.content,
      isInternal: response.isInternal,
      attachments: response.attachments ? JSON.parse(response.attachments) : [],
      createdAt: response.createdAt.toISOString(),
      updatedAt: response.updatedAt.toISOString(),
      responder: response.responder
    }))
  })
}

async function getTicket(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Ticket ID is required' 
    }, { status: 400 })
  }

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      partner: {
        select: {
          id: true,
          businessName: true,
          email: true,
          phone: true
        }
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true
        }
      },
      responses: {
        include: {
          responder: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!ticket) {
    return NextResponse.json({ 
      error: 'Ticket not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      tags: ticket.tags ? JSON.parse(ticket.tags) : [],
      attachments: ticket.attachments ? JSON.parse(ticket.attachments) : [],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      closedAt: ticket.closedAt?.toISOString(),
      user: ticket.user,
      partner: ticket.partner,
      assignedUser: ticket.assignedUser,
      category: ticket.category,
      responses: ticket.responses.map(response => ({
        id: response.id,
        content: response.content,
        isInternal: response.isInternal,
        attachments: response.attachments ? JSON.parse(response.attachments) : [],
        createdAt: response.createdAt.toISOString(),
        updatedAt: response.updatedAt.toISOString(),
        responder: response.responder
      }))
    }
  })
}

async function getCategory(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Category ID is required' 
    }, { status: 400 })
  }

  const category = await db.supportCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tickets: true
        }
      }
    }
  })

  if (!category) {
    return NextResponse.json({ 
      error: 'Category not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      ticketsCount: category._count.tickets,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }
  })
}

async function getKBArticle(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Article ID is required' 
    }, { status: 400 })
  }

  const article = await db.supportKB.findUnique({
    where: { id }
  })

  if (!article) {
    return NextResponse.json({ 
      error: 'Article not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      isPublished: article.isPublished,
      viewCount: article.viewCount,
      helpfulCount: article.helpfulCount,
      createdBy: article.createdBy,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }
  })
}

async function createTicket(data: any) {
  const { subject, description, type, priority, userId, partnerId, categoryId, tags, attachments } = data

  // Generate ticket number
  const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const ticket = await db.supportTicket.create({
    data: {
      ticketNumber,
      subject,
      description,
      type: type || 'general',
      priority: priority || 'normal',
      userId,
      partnerId,
      categoryId,
      tags: tags ? JSON.stringify(tags) : null,
      attachments: attachments ? JSON.stringify(attachments) : null,
      status: 'open'
    }
  })

  // Send notification to support team
  await fetch('/api/notifications/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'broadcast',
      notification: {
        title: 'New Support Ticket',
        message: `New ticket: ${subject}`,
        icon: '/icons/support.png',
        tag: 'support-ticket',
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject,
          priority,
          type,
          timestamp: new Date().toISOString()
        },
        actions: [
          {
            action: 'view',
            title: 'View Ticket',
            icon: '/icons/view.png'
          }
        ],
        url: '/support/tickets',
        requireInteraction: false
      }
    })
  })

  return NextResponse.json({
    success: true,
    message: 'Support ticket created successfully',
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status
    }
  })
}

async function createCategory(data: any) {
  const { name, description, icon, color, sortOrder } = data

  const category = await db.supportCategory.create({
    data: {
      name,
      description,
      icon,
      color,
      sortOrder: sortOrder || 0
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Support category created successfully',
    category: {
      id: category.id,
      name: category.name,
      color: category.color
    }
  })
}

async function createKBArticle(data: any) {
  const { title, slug, content, excerpt, category, tags, isPublished, createdBy } = data

  // Generate slug if not provided
  let finalSlug = slug
  if (!finalSlug) {
    finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const article = await db.supportKB.create({
    data: {
      title,
      slug: finalSlug,
      content,
      excerpt,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      isPublished: isPublished || false,
      viewCount: 0,
      helpfulCount: 0,
      createdBy: createdBy || 'system'
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Knowledge base article created successfully',
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      isPublished: article.isPublished
    }
  })
}

async function createResponse(data: any) {
  const { ticketId, content, isInternal, respondedBy, attachments } = data

  const response = await db.supportResponse.create({
    data: {
      ticketId,
      content,
      isInternal: isInternal || false,
      respondedBy,
      attachments: attachments ? JSON.stringify(attachments) : null
    }
  })

  // Update ticket status if it's the first response
  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId }
  })

  if (ticket && ticket.status === 'open') {
    await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'in_progress',
        updatedAt: new Date()
      }
    })
  }

  // Send notification to ticket creator if it's a customer response
  if (ticket && !isInternal) {
    const notificationData = {
      title: 'Response to Your Support Ticket',
      message: `Your ticket "${ticket.subject}" has been updated.`,
      icon: '/icons/support.png',
      tag: 'ticket-response',
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'view',
          title: 'View Ticket',
          icon: '/icons/view.png'
        }
      ],
      url: '/support/tickets',
      requireInteraction: false
    }

    if (ticket.userId) {
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'send',
          userId: ticket.userId,
          notification: notificationData
        })
      })
    } else if (ticket.partnerId) {
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'send',
          partnerId: ticket.partnerId,
          notification: notificationData
        })
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Response added successfully',
    response: {
      id: response.id,
      content: response.content,
      isInternal: response.isInternal
    }
  })
}

async function updateTicket(id: string, data: any) {
  const ticket = await db.supportTicket.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Support ticket updated successfully',
    ticket
  })
}

async function updateCategory(id: string, data: any) {
  const category = await db.supportCategory.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Support category updated successfully',
    category
  })
}

async function updateKBArticle(id: string, data: any) {
  const article = await db.supportKB.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Knowledge base article updated successfully',
    article
  })
}

async function updateResponse(id: string, data: any) {
  const response = await db.supportResponse.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Response updated successfully',
    response
  })
}

async function deleteTicket(id: string) {
  await db.supportTicket.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Support ticket deleted successfully'
  })
}

async function deleteCategory(id: string) {
  await db.supportCategory.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Support category deleted successfully'
  })
}

async function deleteKBArticle(id: string) {
  await db.supportKB.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Knowledge base article deleted successfully'
  })
}

async function deleteResponse(id: string) {
  await db.supportResponse.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Response deleted successfully'
  })
}