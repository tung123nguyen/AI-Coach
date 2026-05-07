'use client'

import { useState } from 'react'
import { Icon } from '@/components/icon'
import { Situation } from '@/lib/types'

const TONES: Record<string, string> = {
  work:   'oklch(0.45 0.13 230)',
  daily:  'oklch(0.45 0.13 185)',
  social: 'oklch(0.45 0.13 285)',
  dating: 'oklch(0.48 0.14 10)',
}

const ICONS: Record<string, string> = {
  work:   'briefcase',
  daily:  'building-2',
  social: 'users',
  dating: 'heart',
}

const LEVEL_COLORS: Record<string, string> = {
  Core:         'oklch(0.65 0.15 145)',
  Intermediate: 'oklch(0.72 0.17 60)',
  Advanced:     'oklch(0.65 0.2 27)',
}

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

export default function SituationCard({ situation, onOpen, isLoading, index: _index }: SituationCardProps) {
  const [hover, setHover] = useState(false)
  const tone = TONES[situation.category] ?? 'oklch(0.45 0.13 250)'
  const iconName = ICONS[situation.category] ?? 'message-circle'
  const level = levelFor(situation.difficulty)
  const levelColor = LEVEL_COLORS[level]

  return (
    <button
      onClick={onOpen}
      disabled={isLoading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        background: 'var(--card)',
        border: `1px solid ${hover ? 'oklch(0.65 0.21 255 / 0.45)' : 'var(--border)'}`,
        borderRadius: 14,
        padding: 0,
        overflow: 'hidden',
        cursor: isLoading ? 'wait' : 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 12px 40px oklch(0 0 0 / 0.35)' : '0 2px 8px oklch(0 0 0 / 0.15)',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--foreground)',
        opacity: isLoading ? 0.55 : 1,
        height: 360,
      }}
    >
      {/* ── Image area — 2/3 ── */}
      <div style={{
        flex: 2,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 35% 45%, ${tone} 0%, oklch(0.08 0.014 260) 72%)`,
      }}>
        {situation.image_situation ? (
          <img
            src={situation.image_situation}
            alt={situation.name}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <>
            {/* Subtle grid texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(135deg, oklch(1 0 0 / 0.025) 0, oklch(1 0 0 / 0.025) 1px, transparent 1px, transparent 18px)',
            }} />
            {/* Centered icon */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 76, width: 76, borderRadius: 22,
                background: 'oklch(1 0 0 / 0.07)',
                border: '1px solid oklch(1 0 0 / 0.13)',
                backdropFilter: 'blur(6px)',
                boxShadow: `0 12px 40px ${tone.replace(')', ' / 0.4)')}`,
                color: 'oklch(1 0 0 / 0.9)',
                transition: 'transform 0.25s',
                transform: hover ? 'scale(1.08)' : 'scale(1)',
              }}>
                <Icon name={iconName} size={34} strokeWidth={1.3} />
              </div>
            </div>
          </>
        )}

        {/* Top-to-bottom scrim: giúp badge đọc được trên mọi ảnh */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, oklch(0 0 0 / 0.42) 0%, transparent 45%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom-to-top scrim: softens ảnh trước khi vào content */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, oklch(0 0 0 / 0.55) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        {/* Badges — top left */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, zIndex: 1 }}>
          <span style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '4px 10px', borderRadius: 999,
            background: 'oklch(0.08 0.01 260 / 0.7)',
            border: '1px solid oklch(1 0 0 / 0.12)',
            backdropFilter: 'blur(8px)',
            color: 'oklch(1 0 0 / 0.85)',
          }}>
            Practice
          </span>
        </div>

        {/* Level badge — top right */}
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 1 }}>
          <span style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.13em',
            padding: '4px 10px', borderRadius: 999,
            background: 'oklch(0.08 0.01 260 / 0.7)',
            border: `1px solid ${levelColor}55`,
            backdropFilter: 'blur(8px)',
            color: levelColor,
          }}>
            {level}
          </span>
        </div>
      </div>

      {/* ── Content area — 1/3 ── */}
      <div style={{
        flex: 1,
        padding: '16px 20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 0,
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 15, fontWeight: 650, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {situation.name}
          </h3>
          <p style={{
            margin: '5px 0 0',
            fontSize: 12.5, lineHeight: 1.45, color: 'var(--muted-foreground)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {situation.description}
          </p>
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11.5, color: 'var(--muted-foreground)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon name="clock" size={11} />
            {situation.difficulty * 3} min
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: 'var(--primary)',
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.2s',
            fontWeight: 500,
          }}>
            Open <Icon name="arrow-right" size={11} />
          </span>
        </div>
      </div>
    </button>
  )
}
