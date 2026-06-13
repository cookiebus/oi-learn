"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save, Trash2 } from "lucide-react"

interface PointFormData {
  id?: string
  title: string
  slug: string
  description: string | null
  content: string | null
  difficulty: number
  estimatedMin: number | null
  videoUrl: string | null
  videoDuration: number | null
  category: string | null
  isPublished: boolean
  orderIndex: number
}

interface AllPoint {
  id: string
  title: string
}

interface Props {
  point: (PointFormData & { prerequisites: { prerequisiteId: string }[] }) | null
  allPoints: AllPoint[]
}

export function PointEditForm({ point, allPoints }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PointFormData>({
    title: point?.title || "",
    slug: point?.slug || "",
    description: point?.description || "",
    content: point?.content || "",
    difficulty: point?.difficulty || 1,
    estimatedMin: point?.estimatedMin || 30,
    videoUrl: point?.videoUrl || "",
    videoDuration: point?.videoDuration || 0,
    category: point?.category || "语法基础",
    isPublished: point?.isPublished ?? false,
    orderIndex: point?.orderIndex || 0,
  })
  const [prereqs, setPrereqs] = useState<string[]>(
    point?.prerequisites.map((p) => p.prerequisiteId) || []
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/points", {
        method: point ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: point?.id, prerequisites: prereqs }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push("/admin/points")
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">标题</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="如：for 循环"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug（URL 标识）</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="for-loop"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">讲义内容（Markdown）</label>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
              rows={12}
              placeholder="## 知识点介绍&#10;在这里输入讲义内容..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">难度 (1-5)</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {[1,2,3,4,5].map((d) => (
                  <option key={d} value={d}>{"⭐".repeat(d)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">预估时长（分钟）</label>
              <input
                type="number"
                value={form.estimatedMin ?? 30}
                onChange={(e) => setForm({ ...form, estimatedMin: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={form.category ?? "语法基础"}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="语法基础">语法基础</option>
                <option value="数据结构">数据结构</option>
                <option value="算法">算法</option>
                <option value="STL">STL</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">视频 URL（阿里云 VOD ID）</label>
              <input
                value={form.videoUrl ?? ""}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="video-xxxxx"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">前置知识点</label>
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                {allPoints.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={prereqs.includes(p.id)}
                      onChange={(e) => {
                        setPrereqs(
                          e.target.checked
                            ? [...prereqs, p.id]
                            : prereqs.filter((id) => id !== p.id)
                        )
                      }}
                      className="rounded border-gray-300"
                    />
                    {p.title}
                  </label>
                ))}
                {allPoints.length === 0 && (
                  <p className="text-xs text-gray-400">暂无其他知识点</p>
                )}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm mt-6">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded border-gray-300"
                />
                发布（学生对可见）
              </label>
            </div>
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
