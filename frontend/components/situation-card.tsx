import { ArrowRight } from 'lucide-react'
import { Situation } from '@/lib/types'

interface SituationCardProps {
  situation: Situation
  onStart: () => void
  isLoading: boolean
}

export default function SituationCard({ situation, onStart, isLoading }: SituationCardProps) {
  return (
    <div className="group relative bg-white/2 hover:bg-white/4 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col gap-5 transition-all">
      {/* Top: emoji + difficulty */}
      <div className="flex items-start justify-between">
        <span className="text-5xl leading-none">{situation.emoji}</span>
        <div className="flex gap-1 pt-1.5">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < situation.difficulty ? 'bg-blue-500' : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white leading-snug">{situation.name}</h3>
        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{situation.description}</p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 bg-white/4 group-hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 group-hover:text-white text-sm font-medium rounded-xl py-2.5 transition-all"
      >
        {isLoading ? 'Đang tạo...' : (
          <>
            Bắt đầu
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
