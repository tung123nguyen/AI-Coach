import { Situation } from '@/lib/types'

interface SituationCardProps {
  situation: Situation
  onStart: () => void
  isLoading: boolean
}

export default function SituationCard({ situation, onStart, isLoading }: SituationCardProps) {
  return (
    <div
      className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:border-zinc-700 hover:scale-[1.01]"
    >
      {/* Top: emoji + difficulty */}
      <div className="flex items-start justify-between">
        <span className="text-5xl leading-none">{situation.emoji}</span>
        <div className="flex gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < situation.difficulty ? 'bg-blue-400' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white leading-snug">{situation.name}</h3>
        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{situation.description}</p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={isLoading}
        className="w-full bg-zinc-800 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-white text-sm font-medium rounded-xl py-2.5 transition-all duration-150 group-hover:bg-blue-600 group-hover:text-white"
      >
        {isLoading ? 'Đang tạo...' : 'Bắt đầu →'}
      </button>
    </div>
  )
}
