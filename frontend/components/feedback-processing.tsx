'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FeedbackProcessingProps {
  sessionId: string
}

export default function FeedbackProcessing({ sessionId }: FeedbackProcessingProps) {
  const router = useRouter()

  useEffect(() => {
    // Poll every 2s by refreshing the server component
    const timer = setInterval(() => {
      router.refresh()
    }, 2000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Đang xử lý feedback...</h2>
        <p className="text-sm text-zinc-500">Coach AI đang phân tích cuộc trò chuyện của bạn</p>
        <p className="text-xs text-zinc-600 mt-4">
          Session: {sessionId.slice(0, 8)}...
        </p>
      </div>
    </div>
  )
}
