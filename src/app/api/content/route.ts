import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'posts', 'categories', 'media', 'pages', 'campaigns'
    const id = searchParams.get('id')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'posts':
        return await getPosts(categoryId, status, limit, offset)
      case 'categories':
        return await getCategories()
      case 'media':
        return await getMediaFiles(limit, offset)
      case 'pages':
        return await getLandingPages()
      case 'campaigns':
        return await getMarketingCampaigns(status, limit, offset)
      case 'post':
        return await getPost(id)
      case 'category':
        return await getCategory(id)
      case 'page':
        return await getLandingPage(id)
      case 'campaign':
        return await getMarketingCampaign(id)
      default:
        return await getPosts(categoryId, status, limit, offset)
    }

  } catch (error) {
    console.error('Error in content API:', error)
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
      case 'post':
        return await createPost(data)
      case 'category':
        return await createCategory(data)
      case 'media':
        return await uploadMedia(data)
      case 'page':
        return await createLandingPage(data)
      case 'campaign':
        return await createCampaign(data)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in content API:', error)
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
      case 'post':
        return await updatePost(id, data)
      case 'category':
        return await updateCategory(id, data)
      case 'media':
        return await updateMediaFile(id, data)
      case 'page':
        return await updateLandingPage(id, data)
      case 'campaign':
        return await updateCampaign(id, data)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in content API:', error)
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
      case 'post':
        return await deletePost(id)
      case 'category':
        return await deleteCategory(id)
      case 'media':
        return await deleteMediaFile(id)
      case 'page':
        return await deleteLandingPage(id)
      case 'campaign':
        return await deleteCampaign(id)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function getPosts(categoryId?: string, status?: string, limit: number = 10, offset: number = 0) {
  let whereClause: any = {}

  if (categoryId) {
    whereClause.categoryId = categoryId
  }

  if (status && status !== 'all') {
    whereClause.status = status
  }

  const posts = await db.contentPost.findMany({
    where: whereClause,
    include: {
      author: {
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
          slug: true,
          color: true
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    skip: offset
  })

  return NextResponse.json({
    success: true,
    posts: posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      status: post.status,
      type: post.type,
      tags: post.tags ? JSON.parse(post.tags) : [],
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      views: post.views,
      likes: post.likes,
      shares: post.shares,
      comments: post.comments
    }))
  })
}

async function getCategories() {
  const categories = await db.contentCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc', name: 'asc' },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    }
  })

  return NextResponse.json({
    success: true,
    categories: categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      postsCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }))
  })
}

async function getMediaFiles(limit: number = 10, offset: number = 0) {
  const mediaFiles = await db.mediaFile.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })

  return NextResponse.json({
    success: true,
    mediaFiles: mediaFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      type: file.type,
      url: file.url,
      path: file.path,
      alt: file.alt,
      caption: file.caption,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString()
    }))
  })
}

async function getLandingPages() {
  const landingPages = await db.landingPage.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    landingPages: landingPages.map(page => ({
      id: page.id,
      name: page.name,
      slug: page.slug,
      title: page.title,
      description: page.description,
      content: page.content ? JSON.parse(page.content) : {},
      template: page.template,
      status: page.status,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      seoKeywords: page.seoKeywords,
      publishedAt: page.publishedAt?.toISOString(),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      views: page.views,
      conversions: page.conversions,
      bounceRate: page.bounceRate
    }))
  })
}

async function getMarketingCampaigns(status?: string, limit: number = 10, offset: number = 0) {
  let whereClause: any = {}

  if (status && status !== 'all') {
    whereClause.status = status
  }

  const campaigns = await db.marketingCampaign.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })

  return NextResponse.json({
    success: true,
    campaigns: campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      budget: campaign.budget,
      currency: campaign.currency,
      target: campaign.target ? JSON.parse(campaign.target) : {},
      content: campaign.content ? JSON.parse(campaign.content) : {},
      results: campaign.results ? JSON.parse(campaign.results) : {},
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened: campaign.opened,
      clicked: campaign.clicked,
      converted: campaign.converted,
      cost: campaign.cost,
      revenue: campaign.revenue
    }))
  })
}

async function getPost(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Post ID is required' 
    }, { status: 400 })
  }

  const post = await db.contentPost.findUnique({
    where: { id },
    include: {
      author: {
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
          slug: true,
          color: true
        }
      }
    }
  })

  if (!post) {
    return NextResponse.json({ 
      error: 'Post not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      status: post.status,
      type: post.type,
      tags: post.tags ? JSON.parse(post.tags) : [],
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      views: post.views,
      likes: post.likes,
      shares: post.shares,
      comments: post.comments
    }
  })
}

async function getCategory(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Category ID is required' 
    }, { status: 400 })
  }

  const category = await db.contentCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true
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
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      postsCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }
  })
}

async function getLandingPage(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Page ID is required' 
    }, { status: 400 })
  }

  const page = await db.landingPage.findUnique({
    where: { id }
  })

  if (!page) {
    return NextResponse.json({ 
      error: 'Landing page not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    page: {
      id: page.id,
      name: page.name,
      slug: page.slug,
      title: page.title,
      description: page.description,
      content: page.content ? JSON.parse(page.content) : {},
      template: page.template,
      status: page.status,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      seoKeywords: page.seoKeywords,
      publishedAt: page.publishedAt?.toISOString(),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      views: page.views,
      conversions: page.conversions,
      bounceRate: page.bounceRate
    }
  })
}

async function getMarketingCampaign(id: string) {
  if (!id) {
    return NextResponse.json({ 
      error: 'Campaign ID is required' 
    }, { status: 400 })
  }

  const campaign = await db.marketingCampaign.findUnique({
    where: { id }
  })

  if (!campaign) {
    return NextResponse.json({ 
      error: 'Campaign not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      budget: campaign.budget,
      currency: campaign.currency,
      target: campaign.target ? JSON.parse(campaign.target) : {},
      content: campaign.content ? JSON.parse(campaign.content) : {},
      results: campaign.results ? JSON.parse(campaign.results) : {},
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened: campaign.opened,
      clicked: campaign.clicked,
      converted: campaign.converted,
      cost: campaign.cost,
      revenue: campaign.revenue
    }
  })
}

async function createPost(data: any) {
  const { title, slug, content, excerpt, featuredImage, type, authorId, categoryId, tags, seoTitle, seoDescription, seoKeywords, status } = data

  // Generate slug if not provided
  let finalSlug = slug
  if (!finalSlug) {
    finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const post = await db.contentPost.create({
    data: {
      title,
      slug: finalSlug,
      content,
      excerpt,
      featuredImage,
      type: type || 'blog',
      authorId,
      categoryId,
      tags: tags ? JSON.stringify(tags) : null,
      seoTitle,
      seoDescription,
      seoKeywords,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Post created successfully',
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status
    }
  })
}

async function createCategory(data: any) {
  const { name, slug, description, icon, color, sortOrder } = data

  // Generate slug if not provided
  let finalSlug = slug
  if (!finalSlug) {
    finalSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const category = await db.contentCategory.create({
    data: {
      name,
      slug: finalSlug,
      description,
      icon,
      color,
      sortOrder: sortOrder || 0
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Category created successfully',
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug
    }
  })
}

async function uploadMedia(data: any) {
  const { filename, originalName, mimeType, size, type, url, path, alt, caption, uploadedBy } = data

  const mediaFile = await db.mediaFile.create({
    data: {
      filename,
      originalName,
      mimeType,
      size,
      type,
      url,
      path,
      alt,
      caption,
      uploadedBy
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Media file uploaded successfully',
    mediaFile: {
      id: mediaFile.id,
      filename: mediaFile.filename,
      originalName: mediaFile.originalName,
      url: mediaFile.url
    }
  })
}

async function createLandingPage(data: any) {
  const { name, slug, title, description, content, template, seoTitle, seoDescription, seoKeywords, status } = data

  // Generate slug if not provided
  let finalSlug = slug
  if (!finalSlug) {
    finalSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const page = await db.landingPage.create({
    data: {
      name,
      slug: finalSlug,
      title,
      description,
      content: JSON.stringify(content),
      template,
      seoTitle,
      seoDescription,
      seoKeywords,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Landing page created successfully',
    page: {
      id: page.id,
      name: page.name,
      slug: page.slug,
      status: page.status
    }
  })
}

async function createCampaign(data: any) {
  const { name, description, type, startDate, endDate, budget, currency, target, content, createdBy, status } = data

  const campaign = await db.marketingCampaign.create({
    data: {
      name,
      description,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      budget,
      currency,
      target: target ? JSON.stringify(target) : null,
      content: content ? JSON.stringify(content) : null,
      createdBy,
      status: status || 'draft'
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Marketing campaign created successfully',
    campaign: {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status
    }
  })
}

async function updatePost(id: string, data: any) {
  const post = await db.contentPost.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Post updated successfully',
    post
  })
}

async function updateCategory(id: string, data: any) {
  const category = await db.contentCategory.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Category updated successfully',
    category
  })
}

async function updateMediaFile(id: string, data: any) {
  const mediaFile = await db.mediaFile.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Media file updated successfully',
    mediaFile
  })
}

async function updateLandingPage(id: string, data: any) {
  const page = await db.landingPage.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Landing page updated successfully',
    page
  })
}

async function updateCampaign(id: string, data: any) {
  const campaign = await db.marketingCampaign.update({
    where: { id },
    data
  })

  return NextResponse.json({
    success: true,
    message: 'Marketing campaign updated successfully',
    campaign
  })
}

async function deletePost(id: string) {
  await db.contentPost.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Post deleted successfully'
  })
}

async function deleteCategory(id: string) {
  await db.contentCategory.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Category deleted successfully'
  })
}

async function deleteMediaFile(id: string) {
  await db.mediaFile.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Media file deleted successfully'
  })
}

async function deleteLandingPage(id: string) {
  await db.landingPage.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Landing page deleted successfully'
  })
}

async function deleteCampaign(id: string) {
  await db.marketingCampaign.delete({
    where: { id }
  })

  return NextResponse.json({
    success: true,
    message: 'Marketing campaign deleted successfully'
  })
}