'use client'

import { useState } from 'react'
import { Icon } from '@/components/icon'
import { Situation } from '@/lib/types'

const TONES = [
  'oklch(0.45 0.12 230)',
  'oklch(0.5 0.14 280)',
  'oklch(0.45 0.13 200)',
  'oklch(0.5 0.14 30)',
  'oklch(0.5 0.14 320)',
  'oklch(0.5 0.14 150)',
  'oklch(0.5 0.14 60)',
  'oklch(0.45 0.13 250)',
  'oklch(0.5 0.14 10)',
]

function levelFor(difficulty: number) {
  if (difficulty <= 2) return 'Core'
  if (difficulty <= 3) return 'Intermediate'
  return 'Advanced'
}

interface SituationCardProps {
  situation: Situation
  onOpen: () => void
  isLoading: boolean
  index: number
}

export default function SituationCard({ situation, onOpen, isLoading, index }: SituationCardProps) {
  const [hover, setHover] = useState(false)
  const tone = TONES[index % TONES.length]
  const tag = 'Practice'
  const level = levelFor(situation.difficulty)

  return (
    <button
      onClick={onOpen}
      disabled={isLoading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        background: 'var(--card)',
        border: `1px solid ${hover ? 'oklch(0.65 0.21 255 / 0.4)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: 0,
        overflow: 'hidden',
        cursor: isLoading ? 'wait' : 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--foreground)',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <div className="img-placeholder" style={{
        height: 160,
        position: 'relative',
        background: `radial-gradient(circle at 30% 30%, ${tone}, oklch(0.09 0.015 260) 75%)`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, oklch(1 0 0 / 0.04) 0, oklch(1 0 0 / 0.04) 1px, transparent 1px, transparent 14px)',
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'oklch(0.06 0.01 260 / 0.6)', border: '1px solid var(--border)', backdropFilter: 'blur(6px)', color: 'var(--foreground)' }}>{tag}</span>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'oklch(0.06 0.01 260 / 0.6)', border: '1px solid var(--border)', backdropFilter: 'blur(6px)', color: 'var(--muted-foreground)' }}>{level}</span>
        </div>
        <div style={{
          position: 'absolute', right: 14, bottom: 14,
          height: 44, width: 44, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'oklch(0.06 0.01 260 / 0.7)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)',
          color: 'var(--foreground)',
          fontSize: 22, lineHeight: 1,
        }}>
          {situation.emoji}
        </div>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.35, textWrap: 'pretty' }}>{situation.name}</h3>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-foreground)', flex: 1 }}>{situation.description}</p>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={12} /> {situation.difficulty * 3} min
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: 'var(--primary)', opacity: hover ? 1 : 0, transition: 'opacity 0.2s',
          }}>
            Open <Icon name="arrow-right" size={12} />
          </span>
        </div>
      </div>
    </button>
  )
}
