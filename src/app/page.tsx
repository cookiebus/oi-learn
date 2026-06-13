import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Trophy, Video, ChevronRight, Sparkles } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "体系化知识点",
    desc: "从基础语法到高级算法，完整的信奥学习路径",
  },
  {
    icon: Video,
    title: "视频精讲",
    desc: "每个知识点配套视频讲解，看得懂、学得会",
  },
  {
    icon: Brain,
    title: "AI 助教",
    desc: "随时提问，AI 因材施教，针对性解答疑惑",
  },
  {
    icon: Trophy,
    title: "闯关解锁",
    desc: "测试通过才能解锁下一关，确保基础扎实",
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              信奥自适应学习平台
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 text-balance">
              AI 因材施教
              <br />
              轻松入门信奥
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              从零开始，体系化学习信奥知识。AI 助教随时答疑，
              <br />
              闯关解锁机制确保每一步都扎实。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg text-base px-8">
                  免费开始学习
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                  浏览课程
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 -mt-16 relative">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">如何学习</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "选择知识点", desc: "从基础语法开始，按照知识图谱逐步进阶" },
              { step: "02", title: "看视频 + 学讲义", desc: "观看精讲视频，阅读配套讲义，理解核心概念" },
              { step: "03", title: "测试闯关", desc: "完成测试题，通过后才能解锁下一个知识点" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>© 2024 信奥学. All rights reserved.</p>
      </footer>
    </div>
  )
}
