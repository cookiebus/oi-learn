import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PointEditForm } from "./form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminPointEditPage({ params }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/learn")

  const { id } = await params
  const isNew = id === "new"

  const raw = isNew
    ? null
    : await prisma.knowledgePoint.findUnique({
        where: { id },
        include: {
          prerequisites: { include: { prerequisite: true } },
        },
      })

  if (!isNew && !raw) {
    return <div className="p-8 text-center text-gray-400">知识点不存在</div>
  }

  // 转换为表单所需的格式
  const point = raw
    ? {
        id: raw.id,
        title: raw.title,
        slug: raw.slug,
        description: raw.description,
        content: raw.content,
        difficulty: raw.difficulty,
        estimatedMin: raw.estimatedMin,
        videoUrl: raw.videoUrl,
        videoDuration: raw.videoDuration,
        category: raw.category,
        isPublished: raw.isPublished,
        orderIndex: raw.orderIndex,
        prerequisites: raw.prerequisites.map((p) => ({ prerequisiteId: p.prerequisiteId })),
      }
    : null

  // 获取所有知识点（用于选择前置依赖）
  const allPoints = await prisma.knowledgePoint.findMany({
    orderBy: { orderIndex: "asc" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "新建知识点" : `编辑: ${raw!.title}`}
      </h1>
      <PointEditForm
        point={point}
        allPoints={allPoints.filter((p) => p.id !== raw?.id)}
      />
    </div>
  )
}
