/**
 * AI 服务封装
 * 支持 DeepSeek / 通义千问 / Claude 等兼容 OpenAI 格式的 API
 */

interface AIChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface AIChatOptions {
  messages: AIChatMessage[]
  onStream?: (chunk: string) => void
  temperature?: number
  maxTokens?: number
}

const API_URL = process.env.AI_API_URL || "https://api.deepseek.com/v1"
const API_KEY = process.env.AI_API_KEY || ""
const MODEL = process.env.AI_MODEL || "deepseek-chat"

/**
 * AI 对话（流式输出）
 */
export async function aiChatStream(options: AIChatOptions) {
  const { messages, onStream, temperature = 0.7, maxTokens = 4096 } = options

  const response = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let fullContent = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === "[DONE]") continue
      try {
        const json = JSON.parse(data)
        const content = json.choices?.[0]?.delta?.content || ""
        if (content) {
          fullContent += content
          onStream?.(content)
        }
      } catch {
        // skip parse errors
      }
    }
  }

  return fullContent
}

/**
 * AI 对话（非流式，完整返回）
 */
export async function aiChat(messages: AIChatMessage[], temperature = 0.7) {
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

/**
 * 知识点 AI 助教 Prompt 构建
 */
export function buildTutorPrompt(pointTitle: string, pointContent: string, question: string) {
  return [
    {
      role: "system" as const,
      content: `你是一位专业的信奥（信息学奥林匹克竞赛）教练。你在辅导学生关于"${pointTitle}"的知识点。
请用通俗易懂的语言回答学生的问题，适当举例，鼓励学生思考。
如果需要，可以给出 C++ 代码示例。

以下是该知识点的教学内容：
${pointContent}

保持耐心、友好，引导学生自己找到答案。`,
    },
    {
      role: "user" as const,
      content: question,
    },
  ]
}

/**
 * AI 推荐学习路径
 */
export async function generateLearningPath(
  completedPoints: string[],
  availablePoints: { id: string; title: string; difficulty: number; category: string }[]
) {
  const prompt = `你是一位信奥学习规划师。学生已完成的知识点：${completedPoints.join("、")}。
可选的下一个知识点：${JSON.stringify(availablePoints)}。
请根据学生的完成情况，推荐接下来最应该学习的 1-3 个知识点，并说明理由。
用 JSON 格式返回：{ recommendation: [{ pointId: string, reason: string }] }`

  const result = await aiChat([
    { role: "system", content: "你是一位专业的信奥学习规划师。只返回 JSON。" },
    { role: "user", content: prompt },
  ], 0.3)

  try {
    return JSON.parse(result)
  } catch {
    return { recommendation: [] }
  }
}
