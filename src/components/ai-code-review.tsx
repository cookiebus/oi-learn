"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, AlertCircle, CheckCircle2, Lightbulb, Bug } from "lucide-react"
import { cn } from "@/lib/utils"

// C++ 代码模板
const DEFAULT_TEMPLATE = `#include <iostream>
using namespace std;

int main() {
    // 在这里编写你的代码


    return 0;
}`

interface AICodeReviewProps {
  problemTitle?: string
  problemDescription?: string
  template?: string
}

interface ReviewResult {
  hasError: boolean
  score: number
  summary: string
  issues: { type: "error" | "warning" | "suggestion"; line?: number; message: string }[]
  improvements: string[]
  correctCode?: string
}

export function AICodeReview({ problemTitle, problemDescription, template }: AICodeReviewProps) {
  const [code, setCode] = useState(template || DEFAULT_TEMPLATE)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/ai/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problemTitle,
          problemDescription,
        }),
      })

      if (!res.ok) throw new Error("审查失败")
      const data = await res.json()
      setResult(data)
      setActiveTab("result")
    } catch {
      setResult({
        hasError: true,
        score: 0,
        summary: "AI 审查服务暂时不可用，请检查 API 配置或稍后重试。",
        issues: [],
        improvements: [],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor" className="flex items-center gap-1.5">
            <Bug className="h-4 w-4" />
            编写代码
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-1.5" disabled={!result}>
            <Lightbulb className="h-4 w-4" />
            AI 审查结果
          </TabsTrigger>
        </TabsList>

        {/* 代码编辑器 */}
        <TabsContent value="editor" className="space-y-4">
          <CodeEditor value={code} onChange={setCode} height="400px" />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCode(template || DEFAULT_TEMPLATE)}
            >
              重置模板
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !code.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  AI 正在审查...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  AI 审查代码
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* 审查结果 */}
        <TabsContent value="result">
          {result && (
            <div className="space-y-4 animate-fadeIn">
              {/* 评分和总结 */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                      result.score >= 80 ? "bg-green-100 text-green-600" :
                      result.score >= 50 ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {result.score}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {result.hasError ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-semibold">
                          {result.score >= 80 ? "质量不错！" :
                           result.score >= 50 ? "还需要改进" :
                           "问题较多"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 问题列表 */}
              {result.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bug className="h-4 w-4 text-red-500" />
                      发现 {result.issues.length} 个问题
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border p-3 text-sm",
                          issue.type === "error" ? "border-red-200 bg-red-50" :
                          issue.type === "warning" ? "border-yellow-200 bg-yellow-50" :
                          "border-blue-200 bg-blue-50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            "flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded",
                            issue.type === "error" ? "bg-red-200 text-red-700" :
                            issue.type === "warning" ? "bg-yellow-200 text-yellow-700" :
                            "bg-blue-200 text-blue-700"
                          )}>
                            {issue.type === "error" ? "错误" :
                             issue.type === "warning" ? "警告" : "建议"}
                            {issue.line && ` 第${issue.line}行`}
                          </span>
                          <p className="text-gray-700">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 改进建议 */}
              {result.improvements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      改进建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-amber-500 flex-shrink-0">💡</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 正确代码示例 */}
              {result.correctCode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      参考代码
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeEditor
                      value={result.correctCode}
                      readOnly
                      height="250px"
                    />
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setActiveTab("editor")
                  setResult(null)
                }}>
                  继续修改
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
