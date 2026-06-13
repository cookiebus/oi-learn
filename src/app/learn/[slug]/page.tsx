import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PointDetailClient } from "./client"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PointDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { slug } = await params

  const point = await prisma.knowledgePoint.findUnique({
    where: { slug },
    include: {
      prerequisites: {
        include: { prerequisite: true },
      },
      questions: {
        orderBy: { orderIndex: "asc" },
      },
    },
  })

  if (!point || !point.isPublished) notFound()

  // 检查是否解锁
  const progress = await prisma.studentProgress.findUnique({
    where: {
      userId_pointId: { userId: session.user.id, pointId: point.id },
    },
  })

  const status = progress?.status || "LOCKED"

  // 如果是 LOCKED，检查前置条件是否满足
  if (status === "LOCKED" && point.prerequisites.length > 0) {
    const completedPrereqs = await prisma.studentProgress.count({
      where: {
        userId: session.user.id,
        pointId: { in: point.prerequisites.map((p) => p.prerequisiteId) },
        status: "COMPLETED",
      },
    })

    if (completedPrereqs === point.prerequisites.length) {
      // 所有前置已完成，自动解锁
      await prisma.studentProgress.upsert({
        where: { userId_pointId: { userId: session.user.id, pointId: point.id } },
        update: { status: "UNLOCKED" },
        create: { userId: session.user.id, pointId: point.id, status: "UNLOCKED" },
      })
    }
  }

  // 检查是否被锁定（前置未完成）
  const isLocked = status === "LOCKED"
  const lockedPrereqs = isLocked
    ? point.prerequisites
        .filter((p) => progress?.status !== "COMPLETED")
        .map((p) => p.prerequisite.title)
    : []

  // 序列化数据给客户端
  const serializedPoint = {
    id: point.id,
    title: point.title,
    slug: point.slug,
    description: point.description,
    content: point.content,
    difficulty: point.difficulty,
    estimatedMin: point.estimatedMin,
    videoUrl: point.videoUrl,
    videoDuration: point.videoDuration,
    category: point.category,
  }

  const serializedQuestions = point.questions.map((q) => ({
    id: q.id,
    type: q.type as "CHOICE" | "CODE",
    question: q.question,
    title: q.title,
    options: q.options ? JSON.parse(q.options) : null,
    correctAnswer: q.correctAnswer,
    codeTemplate: q.codeTemplate,
    wikioiProblemId: q.wikioiProblemId,
    explanation: q.explanation,
  }))

  return (
    <PointDetailClient
      point={serializedPoint}
      questions={serializedQuestions}
      status={status}
      isLocked={isLocked}
      lockedPrereqs={lockedPrereqs}
      initialProgress={progress ? { status: progress.status, testScore: progress.testScore } : null}
    />
  )
}
