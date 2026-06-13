import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildTutorPrompt, aiChat } from "@/lib/ai"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const { messages, pointTitle, pointContent } = await request.json()

    if (!pointTitle) {
      return NextResponse.json({ error: "缺少知识点信息" }, { status: 400 })
    }

    const lastMessage = messages?.[messages.length - 1]
    if (!lastMessage?.content) {
      return NextResponse.json({ error: "请输入问题" }, { status: 400 })
    }

    const tutorMessages = buildTutorPrompt(
      pointTitle,
      pointContent || "暂无详细讲义内容。",
      lastMessage.content
    )

    // 加上历史消息（最近4轮）
    const history = (messages || []).slice(-4, -1).map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const allMessages = [...tutorMessages.slice(0, 1), ...history, ...tutorMessages.slice(1)]

    const content = await aiChat(allMessages)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "AI 服务异常" }, { status: 500 })
  }
}
