'use client'

import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Message, Persona, Situation, CoachCard } from '@/lib/types'
import { Icon } from '@/components/icon'
import Nav from '@/components/nav'

const GLYPH = 'bot'
const ACCENT = 'oklch(0.65 0.21 255)'

const CATEGORY_ICONS: Record<string, string> = {
  work:   'briefcase',
  daily:  'building-2',
  social: 'users',
  dating: 'heart',
}
const AMBER = 'oklch(0.78 0.17 75)'
const AMBER_BG = 'oklch(0.78 0.17 75 / 0.08)'
const AMBER_BORDER = 'oklch(0.78 0.17 75 / 0.25)'

const iconBtn: CSSProperties = {
  height: 36, width: 36, borderRadius: 999,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--muted-foreground)',
}

const composerIcon: CSSProperties = {
  height: 34, width: 34, borderRadius: 999,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 0, background: 'transparent', color: 'var(--muted-foreground)',
}

interface ChatClientProps {
  sessionId: string
  initialMessages: Message[]
  persona: Persona
  sessionStatus?: 'active' | 'ended'
}

export default function ChatClient({ sessionId, initialMessages, persona, sessionStatus }: ChatClientProps) {
  const router = useRouter()
  const isEnded = sessionStatus === 'ended'
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [typing, setTyping] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState('')
  const [situations, setSituations] = useState<Situation[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    api.getSituations()
      .then((data: Situation[]) => setSituations(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!bottomRef.current) return
    // Instant scroll on mount, smooth for subsequent updates.
    bottomRef.current.scrollIntoView({
      behavior: isFirstRender.current ? 'instant' : 'smooth',
      block: 'end',
    })
    isFirstRender.current = false
  }, [messages, typing])

  async function send(text: string) {
    const t = text.trim()
    if (!t || typing || isEnded) return

    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      sender: 'user',
      content: t,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setTyping(true)
    setError('')

    try {
      const data = await api.sendMessage(sessionId, t)

      // Replace optimistic with real user message (includes coach_card if triggered).
      const realUserMsg: Message = {
        id: data.user_message_id,
        sender: 'user',
        content: t,
        created_at: new Date().toISOString(),
        coach_card: data.coach_card ?? null,
      }
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: data.ai_message,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        realUserMsg,
        aiMsg,
      ])
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setError(err instanceof Error ? err.message : 'Send failed. Try again.')
    } finally {
      setTyping(false)
    }
  }

  async function handleEnd() {
    if (!window.confirm('End this session?')) return
    setIsEnding(true)
    try {
      await api.endSession(sessionId)
      router.push(`/feedback/${sessionId}`)
    } catch {
      setError('Could not end session. Try again.')
      setIsEnding(false)
    }
  }

  async function handlePickSituation(id: string) {
    try {
      const data = await api.createSession(id)
      router.push(`/chat/${data.session_id}`)
    } catch {
      setError('Could not start session.')
    }
  }

  const personaName = persona?.name || 'AI'
  const subtitle = isEnded ? 'Ended session' : 'Practice session'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
      <Nav current="practice" />
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '320px 1fr 320px',
        borderTop: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <Sidebar
          situations={situations}
          onPick={handlePickSituation}
          activePersonaName={personaName}
        />
        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', background: 'var(--background)' }}>
          <ChatHeader
            personaName={personaName}
            subtitle={subtitle}
            isEnded={isEnded}
            isEnding={isEnding}
            onEnd={handleEnd}
            sessionId={sessionId}
          />
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.18em', padding: '4px 0 8px' }}>
              Practice session · {subtitle}
            </div>
            {messages.map(m => <MessageBubble key={m.id} m={m} />)}
            {typing && <TypingIndicator />}
            {error && (
              <div className="fade-in" style={{
                alignSelf: 'center', fontSize: 12,
                padding: '8px 14px', borderRadius: 999,
                border: '1px solid oklch(0.6 0.245 27 / 0.3)',
                background: 'oklch(0.6 0.245 27 / 0.1)', color: 'oklch(0.8 0.15 27)',
              }}>{error}</div>
            )}
            <div ref={bottomRef} />
          </div>
          <Composer onSend={send} disabled={isEnded || typing || isEnding} />
        </main>
        <InfoPanel personaName={personaName} />
      </div>
    </div>
  )
}

function ChatHeader({
  personaName,
  subtitle,
  isEnded,
  isEnding,
  onEnd,
  sessionId,
}: {
  personaName: string
  subtitle: string
  isEnded: boolean
  isEnding: boolean
  onEnd: () => void
  sessionId: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'oklch(0.06 0.01 260 / 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <Link href="/home" style={{
        ...iconBtn,
        background: 'var(--secondary)', color: 'var(--foreground)',
      }} aria-label="Back">
        <Icon name="arrow-left" size={16} />
      </Link>
      <div style={{
        position: 'relative',
        height: 44, width: 44, borderRadius: 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'oklch(0.65 0.21 255 / 0.14)',
        border: `1px solid ${ACCENT}`,
        color: ACCENT,
      }}>
        <Icon name={GLYPH} size={20} strokeWidth={1.5} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          height: 12, width: 12, borderRadius: 999,
          background: isEnded ? 'var(--muted-foreground)' : 'oklch(0.7 0.15 145)',
          border: '2px solid var(--background)',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600 }}>
          {personaName}
          <Icon name="badge-check" size={14} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          <span style={{ color: isEnded ? 'var(--muted-foreground)' : 'oklch(0.7 0.15 145)' }}>●</span> {isEnded ? 'Ended' : 'Active'} · {subtitle}
        </div>
      </div>
      {isEnded ? (
        <Link href={`/feedback/${sessionId}`} style={{
          ...iconBtn, width: 'auto', padding: '0 14px', gap: 6,
          background: 'var(--primary)', color: 'var(--primary-foreground)', border: 0,
          fontSize: 13, fontWeight: 500,
        }}>
          Feedback <Icon name="arrow-right" size={14} />
        </Link>
      ) : (
        <button onClick={onEnd} disabled={isEnding} style={{
          ...iconBtn, width: 'auto', padding: '0 14px',
          fontSize: 13, color: 'var(--foreground)', background: 'var(--secondary)',
        }}>
          {isEnding ? 'Ending…' : 'End'}
        </button>
      )}
      <button style={iconBtn} aria-label="Info"><Icon name="info" size={16} /></button>
      <button style={iconBtn} aria-label="More"><Icon name="more-horizontal" size={16} /></button>
    </div>
  )
}

function Sidebar({
  situations,
  onPick,
  activePersonaName,
}: {
  situations: Situation[]
  onPick: (id: string) => void
  activePersonaName: string
}) {
  const [search, setSearch] = useState('')
  const filtered = situations.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <aside style={{
      width: 320, borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      background: 'oklch(0.07 0.012 260)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Sessions</h2>
        <Link href="/home" style={{ ...iconBtn, height: 32, width: 32 }} aria-label="New session">
          <Icon name="square-pen" size={14} />
        </Link>
      </div>
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 999,
          background: 'var(--secondary)', border: '1px solid var(--border)',
          color: 'var(--muted-foreground)', fontSize: 13,
        }}>
          <Icon name="search" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sessions"
            style={{
              background: 'transparent', border: 0, outline: 'none', flex: 1,
              color: 'var(--foreground)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
      <div style={{ padding: '0 20px 8px', display: 'flex', gap: 18, fontSize: 13 }}>
        {['All', 'Active', 'Saved'].map((t, i) => (
          <span key={t} style={{
            color: i === 0 ? 'var(--primary)' : 'var(--muted-foreground)',
            paddingBottom: 6,
            borderBottom: i === 0 ? '1px solid var(--primary)' : '1px solid transparent',
            cursor: 'pointer', fontWeight: i === 0 ? 600 : 400,
          }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 16px' }}>
        {filtered.map(s => {
          const isActive = s.persona_data?.name === activePersonaName
          return (
            <SidebarItem key={s.id} situation={s} isActive={isActive} onPick={() => onPick(s.id)} />
          )
        })}
      </div>
    </aside>
  )
}

function SidebarItem({
  situation,
  isActive,
  onPick,
}: {
  situation: Situation
  isActive: boolean
  onPick: () => void
}) {
  const [hover, setHover] = useState(false)
  const bg = isActive ? 'var(--secondary)' : (hover ? 'oklch(0.12 0.018 260)' : 'transparent')
  return (
    <button
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, alignItems: 'center',
        width: '100%', padding: 12,
        borderRadius: 10, border: 0,
        background: bg,
        color: 'var(--foreground)', textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        height: 40, width: 40, borderRadius: 10, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.65 0.21 255 / 0.12)',
        border: '1px solid oklch(0.65 0.21 255 / 0.25)',
        color: ACCENT,
        overflow: 'hidden',
      }}>
        {situation.image_situation
          ? <img src={situation.image_situation} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Icon name={CATEGORY_ICONS[situation.category] ?? 'message-circle'} size={18} strokeWidth={1.5} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{situation.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {situation.persona_data?.name || 'AI partner'}
        </div>
      </div>
    </button>
  )
}

function InfoPanel({ personaName }: { personaName: string }) {
  return (
    <aside style={{
      width: 320, borderLeft: '1px solid var(--border)',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 24,
      background: 'oklch(0.07 0.012 260)',
      overflowY: 'auto', minHeight: 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          height: 88, width: 88, borderRadius: 22,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'oklch(0.65 0.21 255 / 0.14)',
          border: '1px solid oklch(0.65 0.21 255 / 0.3)',
          color: ACCENT,
        }}>
          <Icon name={GLYPH} size={36} strokeWidth={1.4} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 600 }}>
          {personaName}
          <Icon name="badge-check" size={14} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
          {[
            { icon: 'bell-off', label: 'Mute' },
            { icon: 'search', label: 'Search' },
            { icon: 'pin', label: 'Pin' },
          ].map(a => (
            <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--muted-foreground)', fontSize: 12 }}>
              <span style={{
                height: 36, width: 36, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)',
              }}>
                <Icon name={a.icon} size={14} />
              </span>
              {a.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Coach info</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)' }}>
          <Icon name="sparkles" size={16} style={{ color: 'var(--primary)', marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Adaptive feedback</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.5 }}>
              Responses are generated by AI. The coach evaluates clarity, framing, and follow-up — not correctness of facts.
            </div>
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Privacy & support</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: 'bell-off', label: 'Mute notifications' },
            { icon: 'shield-check', label: 'Safety controls' },
            { icon: 'archive', label: 'Archive session' },
          ].map(it => (
            <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', fontSize: 13.5, color: 'var(--foreground)' }}>
              <Icon name={it.icon} size={15} style={{ color: 'var(--muted-foreground)' }} />
              {it.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function MessageBubble({ m }: { m: Message }) {
  if (m.sender === 'user') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="fade-in">
        <div style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '18px 18px 4px 18px',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontSize: 15, lineHeight: 1.5,
          boxShadow: '0 1px 0 oklch(1 0 0 / 0.05)',
          whiteSpace: 'pre-wrap',
        }}>{m.content}</div>
        {m.coach_card && (
          <div style={{ maxWidth: '70%', width: '100%' }}>
            <CoachCardInline card={m.coach_card} />
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="fade-in">
      <div style={{
        height: 32, width: 32, borderRadius: 999, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.65 0.21 255 / 0.12)',
        border: '1px solid oklch(0.65 0.21 255 / 0.3)',
        color: ACCENT,
      }}>
        <Icon name={GLYPH} size={14} strokeWidth={1.6} />
      </div>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '18px 18px 18px 4px',
        background: 'var(--secondary)',
        color: 'var(--foreground)',
        fontSize: 15, lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        border: '1px solid var(--border)',
      }}>{m.content}</div>
    </div>
  )
}

function CoachCardInline({ card }: { card: CoachCard }) {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fade-in" style={{
      marginTop: 6,
      borderRadius: 10,
      border: `1px solid ${AMBER_BORDER}`,
      background: AMBER_BG,
      overflow: 'hidden',
    }}>
      {/* Tier 1 — always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
      }}>
        <Icon name="lightbulb" size={13} style={{ color: AMBER, flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.4,
        }}>
          {card.issue}
        </span>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            fontSize: 12, color: AMBER, fontWeight: 500,
            background: 'transparent', border: 0, cursor: 'pointer',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          {expanded ? 'Thu gọn ↑' : 'Chi tiết ↓'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            fontSize: 14, lineHeight: 1, color: 'var(--muted-foreground)',
            background: 'transparent', border: 0, cursor: 'pointer',
            padding: '2px 2px', flexShrink: 0,
            fontFamily: 'inherit',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Tier 2 — expanded details */}
      {expanded && (
        <div style={{
          padding: '10px 12px 12px',
          borderTop: `1px solid ${AMBER_BORDER}`,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div>
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: AMBER,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
            }}>
              Vì sao chưa tốt
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              {card.explanation}
            </div>
          </div>
          {card.suggestions.length > 0 && (
            <div>
              <div style={{
                fontSize: 10.5, fontWeight: 700, color: AMBER,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
              }}>
                Thử nói thay thế
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {card.suggestions.map((s, i) => (
                  <div key={i} style={{
                    fontSize: 13, padding: '8px 11px', borderRadius: 7,
                    background: 'oklch(0.78 0.17 75 / 0.1)',
                    border: '1px solid oklch(0.78 0.17 75 / 0.2)',
                    color: 'var(--foreground)', lineHeight: 1.45,
                    fontStyle: 'italic',
                  }}>
                    "{s}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="fade-in">
      <div style={{
        height: 32, width: 32, borderRadius: 999, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.65 0.21 255 / 0.12)',
        border: '1px solid oklch(0.65 0.21 255 / 0.3)',
        color: ACCENT,
      }}>
        <Icon name={GLYPH} size={14} strokeWidth={1.6} />
      </div>
      <div style={{
        padding: '14px 18px',
        borderRadius: '18px 18px 18px 4px',
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            height: 6, width: 6, borderRadius: 999,
            background: 'var(--muted-foreground)',
            animation: `typing 1.2s ${i * 0.15}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  )
}

function Composer({ onSend, disabled }: { onSend: (t: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }
  return (
    <div style={{ padding: '12px 24px 20px', background: 'oklch(0.06 0.01 260)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        opacity: disabled ? 0.6 : 1,
      }}>
        <button style={composerIcon} aria-label="Attach"><Icon name="image" size={18} /></button>
        <button style={composerIcon} aria-label="Sticker"><Icon name="smile" size={18} /></button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          disabled={disabled}
          placeholder="Practice your message..."
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--foreground)', fontSize: 15, fontFamily: 'inherit',
            padding: '4px 0',
          }}
        />
        <button onClick={send} disabled={disabled || !text.trim()} style={{
          ...composerIcon,
          background: text.trim() ? 'var(--primary)' : 'transparent',
          color: text.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
          transition: 'background 0.15s',
        }} aria-label="Send">
          <Icon name="send-horizontal" size={16} />
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'center' }}>
        AI coach · Responses are practice scaffolding, not professional advice.
      </div>
    </div>
  )
}
