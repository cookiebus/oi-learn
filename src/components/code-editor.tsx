"use client"

import { useRef, useCallback } from "react"
import Editor from "@monaco-editor/react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  height?: string
  language?: string
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = "300px",
  language = "cpp",
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor
    // 设置 VS Code 风格快捷键
    editor.focus()
  }, [])

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-xs text-gray-400">
        <span className="font-mono">C++</span>
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange?.(val || "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          tabSize: 2,
          readOnly,
          automaticLayout: true,
          padding: { top: 12 },
          bracketPairColorization: { enabled: true },
          renderWhitespace: "selection",
          wordWrap: "on",
        }}
      />
    </div>
  )
}
