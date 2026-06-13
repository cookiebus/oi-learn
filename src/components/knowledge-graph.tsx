"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Lock, Unlock, BookOpen, CheckCircle2, PlayCircle } from "lucide-react"

interface NodeData {
  id: string
  title: string
  slug: string
  status: string
  difficulty: number
  category: string | null
  prerequisites: { id: string; prerequisiteId: string }[]
}

interface KnowledgeGraphProps {
  nodes: NodeData[]
}

// 按分类分组的层次布局
const CATEGORY_ORDER = ["语法基础", "数据结构", "算法", "STL", ""]

export function KnowledgeGraph({ nodes }: KnowledgeGraphProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 按分类分组
  const grouped = nodes.reduce<Record<string, NodeData[]>>((acc, node) => {
    const cat = node.category || "其他"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(node)
    return acc
  }, {})

  // 按预设顺序排序
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a)
    const bi = CATEGORY_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "LEARNING": return <PlayCircle className="h-5 w-5 text-blue-500" />
      case "UNLOCKED": return <Unlock className="h-5 w-5 text-amber-500" />
      default: return <Lock className="h-5 w-5 text-gray-300" />
    }
  }

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => {
        const catNodes = grouped[category].sort((a, b) => a.difficulty - b.difficulty)
        return (
          <div key={category}>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">{category || "基础"}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catNodes.map((node) => {
                const isLocked = node.status === "LOCKED"
                const isCompleted = node.status === "COMPLETED"
                return (
                  <button
                    key={node.id}
                    onClick={() => !isLocked && router.push(`/learn/${node.slug}`)}
                    disabled={isLocked}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                      isLocked
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        : isCompleted
                        ? "border-green-200 bg-green-50 hover:shadow-md hover:border-green-300"
                        : "border-gray-200 bg-white hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5",
                      selectedId === node.id && "ring-2 ring-blue-400"
                    )}
                  >
                    {statusIcon(node.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{node.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {"⭐".repeat(node.difficulty) || "入门"}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
