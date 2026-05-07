'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Situation } from '@/lib/types'
import { Icon } from '@/components/icon'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import SituationCard from '@/components/situation-card'

const mainStyle: CSSProperties = { minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }

const featuredArrow: CSSProperties = {
  height: 36, width: 36, borderRadius: 999, flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--border)', color: 'var(--muted-foreground)',
}

function featuredCardBase(): CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 20,
    padding: 24, borderRadius: 14,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s',
    color: 'var(--foreground)',
    fontFamily: 'inherit',
    textAlign: 'left',
  }
}

function featuredIconWrap(): CSSProperties {
  return {
    height: 56, width: 56, borderRadius: 12, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'oklch(0.65 0.21 255 / 0.12)',
    border: '1px solid oklch(0.65 0.21 255 / 0.35)',
    color: 'var(--primary)',
  }
}

function PracticeHeader() {
  return (
    <section style={{ padding: '64px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', margin: '0 auto', maxWidth: 880 }}>
        <div style={{
          margin: '0 auto 28px',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', borderRadius: 999,
          border: '1px solid var(--border)', background: 'oklch(0.16 0.02 260 / 0.6)',
          backdropFilter: 'blur(8px)', fontSize: 12, color: 'var(--muted-foreground)',
        }}>
          <span style={{ height: 6, width: 6, borderRadius: 999, background: 'var(--primary)' }} />
          Practice library
        </div>
        <div style={{
          margin: '0 auto 24px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <span style={{
            position: 'relative',
            height: 64, width: 64, borderRadius: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'oklch(0.65 0.21 255 / 0.12)',
            border: '1px solid oklch(0.65 0.21 255 / 0.3)',
            color: 'var(--primary)',
          }}>
            <Icon name="messages-square" size={28} strokeWidth={1.5} />
            <span style={{
              position: 'absolute', top: -4, right: -4,
              height: 16, width: 16, borderRadius: 999,
              background: 'var(--primary)', boxShadow: 'var(--shadow-glow)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary-foreground)',
            }}>
              <Icon name="sparkles" size={9} strokeWidth={2.5} />
            </span>
          </span>
        </div>
        <h1 style={{
          margin: 0, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600,
          letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--foreground)',
        }}>
          Practice talking <span style={{ color: 'var(--muted-foreground)' }}>with AI</span>.
        </h1>
        <p style={{ margin: '20px auto 0', maxWidth: 560, fontSize: 16, color: 'var(--muted-foreground)' }}>
          Pick a real situation, jump into a conversation, and walk away with the muscle memory for working alongside agents.
        </p>
      </div>
    </section>
  )
}

function PracticeFeatured({ onCustom }: { onCustom: () => void }) {
  return (
    <section style={{ padding: '0 24px 56px' }}>
      <div style={{
        margin: '0 auto', maxWidth: 1152,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16,
      }}>
        <button onClick={onCustom} style={featuredCardBase()}>
          <div style={featuredIconWrap()}>
            <Icon name="bot" size={26} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'oklch(0.65 0.21 255)' }}>
              <Icon name="sparkles" size={11} /> AI Coach
            </div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Talk to AI Coach</div>
            <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              Free-form conversation. Bring your own goal, and your coach adapts the rubric to fit.
            </div>
          </div>
          <div style={featuredArrow}>
            <Icon name="arrow-right" size={18} />
          </div>
        </button>

        <button onClick={onCustom} style={featuredCardBase()}>
          <div style={{ ...featuredIconWrap(), background: 'oklch(0.55 0.16 285 / 0.12)', borderColor: 'oklch(0.55 0.16 285 / 0.35)', color: 'oklch(0.75 0.14 285)' }}>
            <Icon name="plus" size={26} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'oklch(0.75 0.14 285)' }}>
              <Icon name="wand" size={11} /> Custom
            </div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Create your own</div>
            <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              Sketch a scenario in plain English. We&apos;ll turn it into a structured practice session.
            </div>
          </div>
          <div style={featuredArrow}>
            <Icon name="arrow-right" size={18} />
          </div>
        </button>
      </div>
    </section>
  )
}

interface PracticeClientProps {
  userName: string
}

export default function PracticeClient({ userName: _userName }: PracticeClientProps) {
  const router = useRouter()
  const [situations, setSituations] = useState<Situation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api.getSituations()
      .then((data: Situation[]) => setSituations(data))
      .catch(() => setError('Could not load situations'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleStartSituation(situationId: string) {
    if (isCreatingSession) return
    setIsCreatingSession(true)
    try {
      const data = await api.createSession(situationId)
      router.push(`/chat/${data.session_id}`)
    } catch {
      setError('Could not create session. Please try again.')
      setIsCreatingSession(false)
    }
  }

  const tags = ['All', 'Core', 'Intermediate', 'Advanced']
  const list = filter === 'All' ? situations : situations.filter(s => {
    const lvl = s.difficulty <= 2 ? 'Core' : s.difficulty <= 3 ? 'Intermediate' : 'Advanced'
    return lvl === filter
  })

  return (
    <main style={mainStyle}>
      <Nav current="practice" />
      <PracticeHeader />
      <PracticeFeatured onCustom={() => situations[0] && handleStartSituation(situations[0].id)} />

      <section style={{ padding: '0 24px 40px' }}>
        <div style={{ margin: '0 auto', maxWidth: 1152 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)' }}>Situations</p>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>Browse the library</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '6px 14px', fontSize: 12,
                    borderRadius: 999,
                    border: '1px solid ' + (filter === t ? 'transparent' : 'var(--border)'),
                    background: filter === t ? 'var(--foreground)' : 'transparent',
                    color: filter === t ? 'var(--background)' : 'var(--muted-foreground)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: 24, padding: '12px 16px',
              borderRadius: 10, border: '1px solid oklch(0.6 0.245 27 / 0.3)',
              background: 'oklch(0.6 0.245 27 / 0.1)', color: 'oklch(0.8 0.15 27)',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, height: 360, opacity: 0.5 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {list.map((s, i) => (
                <SituationCard
                  key={s.id}
                  situation={s}
                  onOpen={() => handleStartSituation(s.id)}
                  isLoading={isCreatingSession}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <div style={{ height: 40 }} />
      <Footer />
    </main>
  )
}
