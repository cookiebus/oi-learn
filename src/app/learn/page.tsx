import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"

export default async function LearnPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // 获取所有已发布的知识点
  const points = await prisma.knowledgePoint.findMany({
    where: { isPublished: true },
    include: { prerequisites: true },
    orderBy: { orderIndex: "asc" },
  })

  // 获取学生进度
  const progressMap = new Map(
    (await prisma.studentProgress.findMany({
      where: { userId: session.user.id },
    })).map((p) => [p.pointId, p.status])
  )

  // 计算总进度
  const totalCount = points.length
  const completedCount = points.filter((p) => progressMap.get(p.id) === "COMPLETED").length
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // 构建节点数据（含状态）
  const nodes = points.map((point) => ({
    id: point.id,
    title: point.title,
    slug: point.slug,
    status: progressMap.get(point.id) || "LOCKED",
    difficulty: point.difficulty,
    category: point.category,
    prerequisites: point.prerequisites,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 进度概览 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            我的学习路径
          </h1>
          <span className="text-sm text-gray-500">
            {completedCount} / {totalCount} 已完成
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <p className="text-xs text-gray-400 mt-1">
          完成当前知识点的测试即可解锁下一个知识点
        </p>
      </div>

      {/* 知识图谱 */}
      {nodes.length > 0 ? (
        <KnowledgeGraph nodes={nodes} />
      ) : (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>还没有发布的知识点</p>
          <p className="text-sm mt-1">请联系管理员添加课程内容</p>
        </div>
      )}
    </div>
  )
}
