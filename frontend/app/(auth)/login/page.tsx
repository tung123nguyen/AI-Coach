'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/icon'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/practice')
  }

  return (
    <main style={s.page}>
      <div aria-hidden style={s.glow} />

      <div style={s.wrap}>
        {/* Brand */}
        <Link href="/" style={s.brand}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Neuralearn</span>
          <span style={{ height: 10, width: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} aria-hidden />
        </Link>
        <p style={s.subtitle}>Chào mừng trở lại</p>

        {/* Card */}
        <div style={s.card}>
          <form onSubmit={handleSubmit} style={s.form}>
            <Field label="Email">
              <input
                id="email"
                type="email"
                placeholder="ban@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                style={s.input}
              />
            </Field>

            <Field label="Mật khẩu">
              <input
                id="password"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                style={s.input}
              />
            </Field>

            {error && (
              <div style={s.errorBox}>
                <Icon name="alert-triangle" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{ ...s.btn, background: btnHover ? 'var(--primary-glow)' : 'var(--primary)' }}
            >
              {loading ? (
                <>
                  <span style={s.spinner} />
                  Đang đăng nhập…
                </>
              ) : (
                <>
                  Đăng nhập
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p style={s.foot}>
          Chưa có tài khoản?{' '}
          <Link href="/signup" style={s.footLink}>Đăng ký</Link>
        </p>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)' }}>{label}</label>
      {children}
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    background: 'var(--gradient-hero)',
    pointerEvents: 'none',
  },
  wrap: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--foreground)',
    marginBottom: 8,
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: 14,
    color: 'var(--muted-foreground)',
  },
  card: {
    width: '100%',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 28,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    border: '1px solid var(--input)',
    background: 'oklch(1 0 0 / 0.04)',
    color: 'var(--foreground)',
    fontSize: 14,
    padding: '0 14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 13,
    color: 'oklch(0.75 0.15 27)',
    background: 'oklch(0.6 0.245 27 / 0.1)',
    border: '1px solid oklch(0.6 0.245 27 / 0.25)',
    borderRadius: 8,
    padding: '10px 12px',
  },
  btn: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    border: 0,
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.2s',
    marginTop: 4,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    borderRadius: 999,
    border: '2px solid oklch(1 0 0 / 0.25)',
    borderTopColor: 'var(--primary-foreground)',
    animation: 'spin 0.7s linear infinite',
  },
  foot: {
    marginTop: 20,
    fontSize: 13,
    color: 'var(--muted-foreground)',
  },
  footLink: {
    color: 'var(--primary)',
    fontWeight: 500,
  },
}
