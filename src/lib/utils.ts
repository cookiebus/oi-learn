import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwind class merge utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化时间 */
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/** 难度标签 */
export function difficultyLabel(level: number) {
  const labels = ["", "⭐ 入门", "⭐⭐ 基础", "⭐⭐⭐ 进阶", "⭐⭐⭐⭐ 困难", "⭐⭐⭐⭐⭐ 挑战"]
  return labels[level] ?? "未知"
}

/** 状态标签 */
export function statusLabel(status: string) {
  const map: Record<string, string> = {
    LOCKED: "🔒 未解锁",
    UNLOCKED: "🔓 已解锁",
    LEARNING: "📖 学习中",
    COMPLETED: "✅ 已完成",
  }
  return map[status] ?? status
}
