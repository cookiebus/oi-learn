"use client"

import { AICodeReview } from "@/components/ai-code-review"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, BookOpen } from "lucide-react"
import { signIn, useSession } from "next-auth/react"

export default function PracticePage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center p-8">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h1 className="text-2xl font-bold mb-2">请先登录</h1>
          <p className="text-gray-500 mb-6">登录后即可使用 AI 代码审查功能</p>
          <button
            onClick={() => signIn()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            登录
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code className="h-6 w-6 text-blue-500" />
          C++ 代码练习场
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          自由编写 C++ 代码，AI 帮你审查语法、逻辑，给出改进建议
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <AICodeReview />
        </CardContent>
      </Card>
    </div>
  )
}
