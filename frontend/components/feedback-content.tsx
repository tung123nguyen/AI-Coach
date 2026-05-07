import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import FeedbackCard from '@/components/feedback-card'
import { Feedback } from '@/lib/types'

interface FeedbackContentProps {
  sessionId: string
  feedback: Feedback
  situationName: string
  situationEmoji: string
  personaName: string
  minutesDiff: number
  userMessageCount: number
}

export default function FeedbackContent({
  sessionId,
  feedback,
  situationName,
  situationEmoji,
  personaName,
  minutesDiff,
  userMessageCount,
}: FeedbackContentProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <nav className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span>ConvGym</span>
            <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm inline-block" />
          </Link>
          <Link
            href="/practice"
            className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/6 rounded-lg px-3 py-2 transition-colors"
          >
            Trang chủ
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Cuộc chat đã kết thúc
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            <span className="text-zinc-500">Feedback từ</span>{' '}
            <span className="text-white">Coach AI</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            {situationEmoji} {situationName} — với {personaName}
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-white/2 border border-white/10 rounded-2xl p-5 mb-8 flex justify-center gap-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{minutesDiff}</div>
            <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">phút</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{userMessageCount}</div>
            <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">tin của bạn</div>
          </div>
        </div>

        {/* Feedback cards */}
        <div className="flex flex-col gap-3 mb-10">
          <FeedbackCard
            variant="good"
            title={feedback.good.title}
            content={feedback.good.content}
          />
          <FeedbackCard
            variant="improve"
            title={feedback.improve.title}
            content={feedback.improve.content}
            betterVersion={feedback.improve.better_version}
          />
          <FeedbackCard
            variant="tip"
            title={feedback.tip.title}
            content={feedback.tip.content}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/practice"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl py-3.5 transition-colors"
          >
            Practice nữa
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/chat/${sessionId}`}
            className="flex-1 inline-flex items-center justify-center bg-white/3 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white text-sm font-medium rounded-xl py-3.5 transition-colors"
          >
            Xem lại chat
          </Link>
        </div>
      </div>
    </div>
  )
}
