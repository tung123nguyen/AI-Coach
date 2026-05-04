'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

interface FeedbackProcessingProps {
  sessionId: string
}

export default function FeedbackProcessing({ sessionId }: FeedbackProcessingProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, 2000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-3">
          Đang xử lý
        </p>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Coach AI đang phân tích...</h2>
        <p className="text-sm text-zinc-400">
          Đang đọc lại từng câu để chuẩn bị feedback cho bạn.
        </p>
        <p className="text-xs text-zinc-600 mt-6">
          Session: {sessionId.slice(0, 8)}...
        </p>
      </div>
    </div>
  )
}
