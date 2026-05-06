import {
  ArrowRight, ArrowLeft, Fingerprint, Sparkles, MessageSquare, GraduationCap,
  ShieldCheck, Workflow, Database, Bot, Rocket, ExternalLink, MessagesSquare,
  Users, FileText, Code, Headphones, PenTool, Briefcase, Mic, Mail, Plus, Wand,
  Clock, BadgeCheck, Info, MoreHorizontal, SquarePen, Search, Image as ImageIcon,
  Smile, SendHorizontal, BellOff, Pin, Archive,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'

const iconMap: Record<string, LucideIcon> = {
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'fingerprint': Fingerprint,
  'sparkles': Sparkles,
  'message-square': MessageSquare,
  'graduation-cap': GraduationCap,
  'shield-check': ShieldCheck,
  'workflow': Workflow,
  'database': Database,
  'bot': Bot,
  'rocket': Rocket,
  'external-link': ExternalLink,
  'messages-square': MessagesSquare,
  'users': Users,
  'file-text': FileText,
  'code': Code,
  'headphones': Headphones,
  'pen-tool': PenTool,
  'briefcase': Briefcase,
  'mic': Mic,
  'mail': Mail,
  'plus': Plus,
  'wand': Wand,
  'clock': Clock,
  'badge-check': BadgeCheck,
  'info': Info,
  'more-horizontal': MoreHorizontal,
  'square-pen': SquarePen,
  'search': Search,
  'image': ImageIcon,
  'smile': Smile,
  'send-horizontal': SendHorizontal,
  'bell-off': BellOff,
  'pin': Pin,
  'archive': Archive,
}

interface IconProps {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 16, strokeWidth = 1.75, className, style }: IconProps) {
  const Cmp = iconMap[name]
  if (!Cmp) return null
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ display: 'inline-flex', verticalAlign: 'middle', ...style }}
      aria-hidden
    />
  )
}
