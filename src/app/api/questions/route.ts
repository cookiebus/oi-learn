import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 创建题目
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const { pointId, type, title, question, options, correctAnswer, codeTemplate, timeLimit, memoryLimit, wikioiProblemId, explanation, orderIndex } = await request.json()

    if (!pointId || !question) {
      return NextResponse.json({ error: "所属知识点和题目内容不能为空" }, { status: 400 })
    }

    const judgeConfig = timeLimit || memoryLimit ? JSON.stringify({ timeLimit, memoryLimit }) : null

    const q = await prisma.question.create({
      data: {
        pointId,
        type,
        title,
        question,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        codeTemplate,
        judgeConfig,
        wikioiProblemId,
        explanation,
        orderIndex: orderIndex || 0,
      },
    })

    return NextResponse.json(q)
  } catch (error) {
    console.error("Create question error:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

// 更新题目
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const { id, pointId, type, title, question, options, correctAnswer, codeTemplate, timeLimit, memoryLimit, wikioiProblemId, explanation, orderIndex } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "缺少 ID" }, { status: 400 })
    }

    const judgeConfig = timeLimit || memoryLimit ? JSON.stringify({ timeLimit, memoryLimit }) : null

    const q = await prisma.question.update({
      where: { id },
      data: { pointId, type, title, question, options: options ? JSON.stringify(options) : null, correctAnswer, codeTemplate, judgeConfig, wikioiProblemId, explanation, orderIndex },
    })

    return NextResponse.json(q)
  } catch (error) {
    console.error("Update question error:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 查询题目列表
export async function GET() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { point: { select: { id: true, title: true } } },
    take: 200,
  })
  return NextResponse.json(questions)
}
