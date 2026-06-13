"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/video-player"
import { Quiz } from "@/components/quiz"
import { AIChat } from "@/components/ai-chat"
import { difficultyLabel } from "@/lib/utils"
import { ArrowLeft, Clock, Lock, FileText, Video, HelpCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface PointData {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  difficulty: number
  estimatedMin: number | null
  videoUrl: string | null
  videoDuration: number | null
  category: string | null
}

interface QuestionData {
  id: string
  type: "CHOICE" | "CODE"
  title: string | null
  question: string
  options: { label: string; text: string }[] | null
  correctAnswer: string | null
  codeTemplate: string | null
  wikioiProblemId: number | null
  explanation: string | null
}

interface Props {
  point: PointData
  questions: QuestionData[]
  status: string
  isLocked: boolean
  lockedPrereqs: string[]
  initialProgress: { status: string; testScore: number | null } | null
}

export function PointDetailClient({ point, questions, status, isLocked, lockedPrereqs, initialProgress }: Props) {
  const router = useRouter()
  const [videoProgress, setVideoProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("content")

  const handleQuizComplete = useCallback(async (score: number, passed: boolean) => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointId: point.id, score }),
      })

      if (passed) {
        // 短暂展示通过页面后跳转回知识图谱
        setTimeout(() => {
          router.push("/learn")
          router.refresh()
        }, 2500)
      }
    } catch (e) {
      console.error("Failed to save progress:", e)
    }
  }, [point.id, router])

  // 锁定状态显示
  if (isLocked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Lock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold mb-2">知识点未解锁</h1>
        <p className="text-gray-500 mb-4">
          请先完成以下前置知识点：
        </p>
        <ul className="list-disc list-inside text-sm text-gray-400 mb-8">
          {lockedPrereqs.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <Link href="/learn">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-1" /> 返回学习路径
          </Button>
        </Link>
      </div>
    )
  }

  const choiceQuestions = questions.filter((q) => q.type === "CHOICE")
  const hasQuiz = choiceQuestions.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 顶部导航 */}
      <div className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回知识图谱
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{point.title}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <span>{difficultyLabel(point.difficulty)}</span>
              {point.category && (
                <span className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-0.5 text-xs font-medium">
                  {point.category}
                </span>
              )}
              {point.estimatedMin && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {point.estimatedMin} 分钟
                </span>
              )}
              {point.videoDuration && (
                <span>
                  视频: {Math.floor(point.videoDuration / 60)}:{String(point.videoDuration % 60).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 主要内容区 */}
        <div className="space-y-6">
          {/* 视频 */}
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <VideoPlayer
                src={point.videoUrl || ""}
                title={point.title}
                onProgress={setVideoProgress}
              />
            </CardContent>
          </Card>

          {/* 内容标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                讲义
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-1.5" disabled={!hasQuiz}>
                <HelpCircle className="h-4 w-4" />
                测试{hasQuiz ? ` (${choiceQuestions.length}题)` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardContent className="p-6">
                  {point.content ? (
                    <div className="prose prose-sm max-w-none prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                      {/* 简单 Markdown 渲染：换行分段、代码块 */}
                      {point.content.split("\n").map((line, i) => {
                        if (line.startsWith("```")) return null
                        if (line.startsWith("## ")) {
                          return <h2 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(3)}</h2>
                        }
                        if (line.startsWith("- ")) {
                          return <li key={i} className="ml-4 text-sm text-gray-700">{line.slice(2)}</li>
                        }
                        if (line.trim() === "") return <div key={i} className="h-2" />
                        return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{line}</p>
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">暂无讲义内容</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz">
              <Quiz
                questions={choiceQuestions}
                pointId={point.id}
                onComplete={handleQuizComplete}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* 侧边栏 - AI 助手 */}
        <div className="lg:sticky lg:top-20">
          <AIChat pointTitle={point.title} pointContent={point.content || undefined} />
        </div>
      </div>
    </div>
  )
}
