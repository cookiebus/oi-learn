import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Code, CheckCircle } from "lucide-react"

export default async function AdminQuestionsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/learn")

  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { point: { select: { title: true } } },
    take: 100,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">题目管理</h1>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> 新建题目
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
            {q.type === "CHOICE" ? (
              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Code className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {q.type === "CHOICE" ? "选择题" : "代码题"}
                </span>
                <span className="text-sm truncate">{q.question.slice(0, 80)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                所属知识点: {q.point?.title || "未关联"}
                {q.wikioiProblemId && ` | wikioi #${q.wikioiProblemId}`}
              </p>
            </div>
            <Link href={`/admin/questions/${q.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>还没有创建题目</p>
          </div>
        )}
      </div>
    </div>
  )
}
