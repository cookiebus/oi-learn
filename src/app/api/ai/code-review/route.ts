import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { aiChat } from "@/lib/ai"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const { code, problemTitle, problemDescription } = await request.json()

    if (!code?.trim()) {
      return NextResponse.json({ error: "代码不能为空" }, { status: 400 })
    }

    const systemPrompt = `你是一位经验丰富的信奥教练，专门辅导 C++ 编程入门学生。

你的任务：审查学生提交的 C++ 代码，给出详细的改进建议。

审查要点：
1. **语法错误**：找出所有编译错误、运行时错误
2. **逻辑错误**：算法是否正确？边界情况是否处理？
3. **代码规范**：命名是否合理？缩进是否规范？是否有不必要的代码？
4. **效率问题**：是否有更优的解法？（信奥特别关注时间复杂度）
5. **学习建议**：针对性地告诉学生哪里可以改进，如何改进

评分规则（满分 100）：
- 90-100：代码完美，没有明显问题
- 70-89：有小问题，但整体思路正确
- 50-69：有较多问题，需要大幅修改
- 0-49：代码基本不可用，需要重写

请严格按以下 JSON 格式返回（不要加 markdown 标记，纯 JSON）：
{
  "score": 85,
  "summary": "对代码的整体评价（中文，用第二人称'你'来和学生对话，语气鼓励、耐心）",
  "issues": [
    { "type": "error|warning|suggestion", "line": 5, "message": "具体问题描述" }
  ],
  "improvements": ["改进建议1", "改进建议2"],
  "correctCode": "如果问题较多，给出修正后的完整代码（否则返回空字符串）"
}`

    const userPrompt = problemTitle
      ? `题目：${problemTitle}\n${problemDescription ? `描述：${problemDescription}\n` : ""}\n学生代码：\n\`\`\`cpp\n${code}\n\`\`\``
      : `学生代码：\n\`\`\`cpp\n${code}\n\`\`\``

    const content = await aiChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 0.3)

    // 尝试解析 JSON
    try {
      // 如果返回内容包含 ```json 包裹，去掉
      const cleanJson = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      const result = JSON.parse(cleanJson)
      return NextResponse.json({
        hasError: result.score < 50,
        score: result.score,
        summary: result.summary || "AI 审查完成",
        issues: result.issues || [],
        improvements: result.improvements || [],
        correctCode: result.correctCode || "",
      })
    } catch {
      // JSON 解析失败，返回原始文本
      return NextResponse.json({
        hasError: false,
        score: 50,
        summary: content,
        issues: [],
        improvements: [],
        correctCode: "",
      })
    }
  } catch (error) {
    console.error("AI code review error:", error)
    return NextResponse.json({ error: "AI 审查服务异常" }, { status: 500 })
  }
}
