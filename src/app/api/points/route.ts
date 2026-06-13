import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 创建知识点
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const { title, slug, description, content, difficulty, estimatedMin, videoUrl, videoDuration, category, isPublished, orderIndex, prerequisites } = await request.json()

    if (!title || !slug) {
      return NextResponse.json({ error: "标题和 Slug 不能为空" }, { status: 400 })
    }

    const existing = await prisma.knowledgePoint.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const point = await prisma.knowledgePoint.create({
      data: {
        title, slug, description, content, difficulty: difficulty || 1,
        estimatedMin, videoUrl, videoDuration, category, isPublished: isPublished || false,
        orderIndex: orderIndex || 0,
        prerequisites: prerequisites?.length ? {
          create: prerequisites.map((prereqId: string) => ({
            prerequisite: { connect: { id: prereqId } },
          })),
        } : undefined,
      },
    })

    return NextResponse.json(point)
  } catch (error) {
    console.error("Create point error:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

// 更新知识点
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const { id, title, slug, description, content, difficulty, estimatedMin, videoUrl, videoDuration, category, isPublished, orderIndex, prerequisites } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "缺少 ID" }, { status: 400 })
    }

    // 更新前置依赖：先删后建
    if (prerequisites) {
      await prisma.prerequisite.deleteMany({ where: { pointId: id } })
      if (prerequisites.length > 0) {
        await prisma.prerequisite.createMany({
          data: prerequisites.map((prereqId: string) => ({
            pointId: id,
            prerequisiteId: prereqId,
          })),
        })
      }
    }

    const point = await prisma.knowledgePoint.update({
      where: { id },
      data: { title, slug, description, content, difficulty, estimatedMin, videoUrl, videoDuration, category, isPublished, orderIndex },
    })

    return NextResponse.json(point)
  } catch (error) {
    console.error("Update point error:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 查询知识点列表
export async function GET() {
  const points = await prisma.knowledgePoint.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      prerequisites: { include: { prerequisite: { select: { id: true, title: true } } } },
      _count: { select: { questions: true, progresses: true } },
    },
  })
  return NextResponse.json(points)
}
