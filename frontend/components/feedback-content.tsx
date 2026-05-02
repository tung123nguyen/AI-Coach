import Link from 'next/link'
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
    <div className="min-h-screen bg-zinc-950">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-white">Cuộc chat đã kết thúc!</h1>
          <p className="text-zinc-500 text-sm mt-2">
            {situationEmoji} {situationName} — với {personaName}
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{minutesDiff}</div>
            <div className="text-xs text-zinc-500 mt-0.5">phút</div>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{userMessageCount}</div>
            <div className="text-xs text-zinc-500 mt-0.5">tin của bạn</div>
          </div>
        </div>

        {/* Feedback cards */}
        <div className="flex flex-col gap-4 mb-8">
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
        <div className="flex gap-3">
          <Link
            href="/home"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl py-3 text-center transition-colors"
          >
            Practice nữa
          </Link>
          <Link
            href={`/chat/${sessionId}`}
            className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium rounded-xl py-3 text-center transition-colors"
          >
            Xem lại chat
          </Link>
        </div>
      </div>
    </div>
  )
}
