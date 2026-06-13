"use client"

import { useRef, useEffect, useState } from "react"
import { Play, Pause, Maximize, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  src: string
  title: string
  onProgress?: (progress: number) => void
}

export function VideoPlayer({ src, title, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      const pct = (video.currentTime / video.duration) * 100
      setProgress(pct)
      onProgress?.(pct)
    }
    const onLoaded = () => setDuration(video.duration)

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("loadedmetadata", onLoaded)
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("loadedmetadata", onLoaded)
    }
  }, [onProgress])

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current?.play()
      setIsPlaying(true)
    } else {
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        controls
        playsInline
        onEnded={() => setIsPlaying(false)}
      />
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-900">
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>视频待上传</p>
          </div>
        </div>
      )}
    </div>
  )
}
