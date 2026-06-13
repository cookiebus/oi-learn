import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { QuestionEditForm } from "./form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminQuestionEditPage({ params }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/learn")

  const { id } = await params
  const isNew = id === "new"

  const question = isNew
    ? null
    : await prisma.question.findUnique({ where: { id } })

  // 获取所有知识点用于下拉选择
  const points = await prisma.knowledgePoint.findMany({
    orderBy: { orderIndex: "asc" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "新建题目" : "编辑题目"}
      </h1>
      <QuestionEditForm
        question={question ? {
          ...question,
          options: question.options ? JSON.parse(question.options as string) : null,
          judgeConfig: question.judgeConfig ? JSON.parse(question.judgeConfig as string) : null,
        } : null}
        points={points}
      />
    </div>
  )
}
