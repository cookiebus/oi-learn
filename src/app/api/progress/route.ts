import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 获取当前学生的所有进度
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const progress = await prisma.studentProgress.findMany({
    where: { userId: session.user.id },
  })

  return NextResponse.json(progress)
}

// 更新进度（测试完成时调用）
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { pointId, score } = await request.json()
  const passed = score >= 60

  // 更新当前知识点的状态
  await prisma.studentProgress.upsert({
    where: {
      userId_pointId: { userId: session.user.id, pointId },
    },
    update: {
      status: passed ? "COMPLETED" : "LEARNING",
      testScore: score,
      completedAt: passed ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      pointId,
      status: passed ? "COMPLETED" : "LEARNING",
      testScore: score,
      completedAt: passed ? new Date() : null,
    },
  })

  // 如果测试通过，解锁后续知识点
  if (passed) {
    const dependentPoints = await prisma.prerequisite.findMany({
      where: { prerequisiteId: pointId },
      include: {
        point: {
          include: {
            prerequisites: true,
          },
        },
      },
    })

    for (const dep of dependentPoints) {
      // 检查该知识点的所有前置是否都已通过
      const allPrereqs = dep.point.prerequisites
      const completedPrereqs = await prisma.studentProgress.count({
        where: {
          userId: session.user.id,
          pointId: { in: allPrereqs.map((p) => p.prerequisiteId) },
          status: "COMPLETED",
        },
      })

      if (allPrereqs.length === completedPrereqs) {
        await prisma.studentProgress.upsert({
          where: {
            userId_pointId: { userId: session.user.id, pointId: dep.pointId },
          },
          update: { status: "UNLOCKED" },
          create: {
            userId: session.user.id,
            pointId: dep.pointId,
            status: "UNLOCKED",
          },
        })
      }
    }
  }

  return NextResponse.json({ success: true, passed })
}
