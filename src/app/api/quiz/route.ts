import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 提交测验答案
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const { pointId, answers } = await request.json()

    // 获取该知识点的所有题目
    const questions = await prisma.question.findMany({
      where: { pointId, type: "CHOICE" },
    })

    let correctCount = 0
    const totalCount = questions.length

    // 判分并记录
    for (const q of questions) {
      const userAnswer = answers?.[q.id]
      const isCorrect = userAnswer === q.correctAnswer

      await prisma.userAnswer.create({
        data: {
          userId: session.user.id,
          questionId: q.id,
          answer: userAnswer,
          isCorrect,
        },
      })

      if (isCorrect) correctCount++
    }

    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    const passed = score >= 60

    // 更新进度
    await prisma.studentProgress.upsert({
      where: { userId_pointId: { userId: session.user.id, pointId } },
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

    // 如果通过，尝试解锁后续知识点
    if (passed) {
      const dependents = await prisma.prerequisite.findMany({
        where: { prerequisiteId: pointId },
        include: {
          point: {
            include: {
              prerequisites: true,
            },
          },
        },
      })

      for (const dep of dependents) {
        const prereqIds = dep.point.prerequisites.map((p) => p.prerequisiteId)
        const completedCount = await prisma.studentProgress.count({
          where: {
            userId: session.user.id,
            pointId: { in: prereqIds },
            status: "COMPLETED",
          },
        })

        if (completedCount === prereqIds.length) {
          await prisma.studentProgress.upsert({
            where: { userId_pointId: { userId: session.user.id, pointId: dep.pointId } },
            update: { status: "UNLOCKED" },
            create: { userId: session.user.id, pointId: dep.pointId, status: "UNLOCKED" },
          })
        }
      }
    }

    return NextResponse.json({ score, passed, correctCount, totalCount })
  } catch (error) {
    console.error("Quiz error:", error)
    return NextResponse.json({ error: "提交失败" }, { status: 500 })
  }
}
