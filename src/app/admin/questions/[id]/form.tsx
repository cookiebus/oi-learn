"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save, Plus, X } from "lucide-react"

interface QuestionData {
  id: string
  pointId: string
  type: string
  title: string | null
  question: string
  options: { label: string; text: string }[] | null
  correctAnswer: string | null
  codeTemplate: string | null
  judgeConfig: { timeLimit?: number; memoryLimit?: number } | null
  wikioiProblemId: number | null
  explanation: string | null
  orderIndex: number
}

interface Point {
  id: string
  title: string
}

interface Props {
  question: QuestionData | null
  points: Point[]
}

const DEFAULT_OPTIONS = [
  { label: "A", text: "" },
  { label: "B", text: "" },
  { label: "C", text: "" },
  { label: "D", text: "" },
]

export function QuestionEditForm({ question, points }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState(question?.type || "CHOICE")
  const [form, setForm] = useState({
    pointId: question?.pointId || (points[0]?.id || ""),
    title: question?.title || "",
    question: question?.question || "",
    correctAnswer: question?.correctAnswer || "",
    codeTemplate: question?.codeTemplate || "",
    timeLimit: question?.judgeConfig?.timeLimit || 1000,
    memoryLimit: question?.judgeConfig?.memoryLimit || 256,
    wikioiProblemId: question?.wikioiProblemId || undefined as number | undefined,
    explanation: question?.explanation || "",
    orderIndex: question?.orderIndex || 0,
  })
  const [options, setOptions] = useState(
    question?.options || DEFAULT_OPTIONS
  )

  const updateOption = (label: string, text: string) => {
    setOptions(options.map((o) => (o.label === label ? { ...o, text } : o)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: any = {
        ...form,
        id: question?.id,
        type,
        options: type === "CHOICE" ? options : null,
      }

      const res = await fetch("/api/questions", {
        method: question ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        router.push("/admin/questions")
        router.refresh()
      } else {
        alert(data.error || "保存失败")
      }
    } catch {
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={type === "CHOICE"}
                onChange={() => setType("CHOICE")}
              />
              选择题
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={type === "CODE"}
                onChange={() => setType("CODE")}
              />
              代码题
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">所属知识点</label>
              <select
                value={form.pointId}
                onChange={(e) => setForm({ ...form, pointId: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {points.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">排序</label>
              <input
                type="number"
                value={form.orderIndex}
                onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">题目内容</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {type === "CHOICE" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">选项</label>
                {options.map((opt) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-6">{opt.label}.</span>
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(opt.label, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder={`选项 ${opt.label}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">正确答案</label>
                <select
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">请选择</option>
                  {options.map((opt) => (
                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === "CODE" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">代码模板</label>
                <textarea
                  value={form.codeTemplate}
                  onChange={(e) => setForm({ ...form, codeTemplate: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
                  rows={6}
                  placeholder="#include &lt;iostream&gt;&#10;using namespace std;&#10;&#10;int main() {&#10;  // 在这里编写代码&#10;  return 0;&#10;}"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">时限 (ms)</label>
                  <input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">内存限制 (MB)</label>
                  <input
                    type="number"
                    value={form.memoryLimit}
                    onChange={(e) => setForm({ ...form, memoryLimit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">wikioi 题目 ID</label>
                  <input
                    type="number"
                    value={form.wikioiProblemId || ""}
                    onChange={(e) => setForm({ ...form, wikioiProblemId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="选填"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">解析</label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="题目解析（选填）"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>取消</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
}
