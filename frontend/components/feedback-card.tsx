const variantStyles = {
  good: {
    border: 'border-l-4 border-green-500',
    bg: 'bg-green-500/10',
    titleColor: 'text-green-400',
    icon: '✅',
  },
  improve: {
    border: 'border-l-4 border-amber-500',
    bg: 'bg-amber-500/10',
    titleColor: 'text-amber-400',
    icon: '⚠️',
  },
  tip: {
    border: 'border-l-4 border-blue-500',
    bg: 'bg-blue-500/10',
    titleColor: 'text-blue-400',
    icon: '💡',
  },
}

interface FeedbackCardProps {
  title: string
  content: string
  variant: 'good' | 'improve' | 'tip'
  betterVersion?: string
}

export default function FeedbackCard({ title, content, variant, betterVersion }: FeedbackCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className={`${styles.border} ${styles.bg} rounded-r-xl p-4`}>
      <div className={`flex items-center gap-2 font-semibold text-sm ${styles.titleColor} mb-2`}>
        <span>{styles.icon}</span>
        <span>{title}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{content}</p>

      {betterVersion && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="text-xs text-zinc-500 mb-1">💡 Phiên bản hay hơn:</div>
          <p className="text-sm text-zinc-300 italic leading-relaxed">&ldquo;{betterVersion}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
