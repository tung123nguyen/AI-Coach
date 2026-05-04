import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'

const variantStyles = {
  good: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-400',
    Icon: CheckCircle2,
  },
  improve: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-400',
    Icon: AlertCircle,
  },
  tip: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-400',
    Icon: Lightbulb,
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
  const Icon = styles.Icon

  return (
    <div className="bg-white/2 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 ${styles.iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <span className={`font-semibold text-sm ${styles.titleColor}`}>{title}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{content}</p>

      {betterVersion && (
        <div className="border-t border-white/10 pt-3 mt-4">
          <div className="text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Phiên bản hay hơn</div>
          <p className="text-sm text-zinc-200 italic leading-relaxed">&ldquo;{betterVersion}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
