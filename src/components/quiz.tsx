"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChoiceQuestion {
  id: string
  question: string
  options: { label: string; text: string }[] | null
  correctAnswer: string | null
  explanation?: string | null
}

interface CodeQuestion {
  id: string
  question: string
  codeTemplate?: string | null
  wikioiProblemId?: number | null
  explanation?: string | null
}

type Question = (ChoiceQuestion | CodeQuestion) & { type: "CHOICE" | "CODE" }

interface QuizProps {
  questions: Question[]
  pointId: string
  onComplete: (score: number, passed: boolean) => void
}

export function Quiz({ questions, pointId, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const current = questions[currentIndex]
  const isChoice = current?.type === "CHOICE"
  const isLast = currentIndex === questions.length - 1

  const handleAnswer = (questionId: string, answer: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    let correct = 0
    questions.forEach((q) => {
      if (q.type === "CHOICE" && answers[q.id] === (q as ChoiceQuestion).correctAnswer) {
        correct++
      }
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= 60
    setShowResult(true)
    onComplete(score, passed)
  }

  if (showResult) {
    const correct = questions.filter(
      (q) => q.type === "CHOICE" && answers[q.id] === (q as ChoiceQuestion).correctAnswer
    ).length
    const passed = correct / questions.length >= 0.6
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            {passed ? "🎉 测试通过！" : "😅 再接再厉！"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-3xl font-bold">
            {Math.round((correct / questions.length) * 100)}%
          </div>
          <p className="text-center text-gray-500">
            {correct} / {questions.length} 题正确
          </p>
          {!passed && (
            <p className="text-center text-sm text-gray-400">
              60% 正确率即可解锁下一个知识点，再试一次吧！
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!current) {
    return <p className="text-gray-500">当前知识点暂无测试题</p>
  }

  const selectedAnswer = answers[current.id]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">第 {currentIndex + 1} 题</CardTitle>
          <span className="text-xs text-gray-400">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{current.question}</p>

        {isChoice && (current as ChoiceQuestion).options && (
          <div className="space-y-2">
            {(current as ChoiceQuestion).options!.map((opt) => {
              const isCorrect = submitted && opt.label === (current as ChoiceQuestion).correctAnswer
              const isWrong = submitted && selectedAnswer === opt.label && opt.label !== (current as ChoiceQuestion).correctAnswer
              return (
                <button
                  key={opt.label}
                  onClick={() => handleAnswer(current.id, opt.label)}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 text-sm transition-all",
                    selectedAnswer === opt.label && !submitted && "border-blue-500 bg-blue-50",
                    isCorrect && "border-green-500 bg-green-50",
                    isWrong && "border-red-500 bg-red-50",
                    !selectedAnswer && "hover:border-gray-300",
                    !submitted && "cursor-pointer"
                  )}
                  disabled={submitted}
                >
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                </button>
              )
            })}
          </div>
        )}

        {current.type === "CODE" && (
          <div className="rounded-lg bg-gray-900 p-4">
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{(current as CodeQuestion).codeTemplate || "// 请前往 wikioi.cn 完成编程题"}</code>
            </pre>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            上一题
          </Button>
          <Button size="sm" onClick={handleNext}>
            {isLast ? "提交" : "下一题"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
