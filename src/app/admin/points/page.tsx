import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Eye, EyeOff } from "lucide-react"

export default async function AdminPointsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/learn")

  const points = await prisma.knowledgePoint.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      prerequisites: { include: { prerequisite: true } },
      _count: { select: { questions: true } },
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">知识点管理</h1>
        <Link href="/admin/points/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> 新建知识点
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {points.map((point, i) => (
          <div
            key={point.id}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span className="text-xs text-gray-400 w-6">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{point.title}</span>
                {!point.isPublished && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">未发布</span>
                )}
              </div>
              <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                <span>{"⭐".repeat(point.difficulty)}</span>
                <span>{point.category || "未分类"}</span>
                <span>{point._count.questions} 题</span>
                {point.prerequisites.length > 0 && (
                  <span>前置: {point.prerequisites.map((p) => p.prerequisite.title).join(", ")}</span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {point.isPublished ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-300" />
              )}
              <Link href={`/admin/points/${point.id}`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        {points.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>还没有创建知识点</p>
            <p className="text-sm mt-1">点击上方按钮开始创建</p>
          </div>
        )}
      </div>
    </div>
  )
}
