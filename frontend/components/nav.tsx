'use client'

import Link from 'next/link'
import { useState, type CSSProperties } from 'react'
import { Icon } from '@/components/icon'

interface NavProps {
  current?: string
}

export default function Nav({ current }: NavProps) {
  const links = [
    { id: 'platform', label: 'Platform', href: '#' },
    { id: 'learn', label: 'Learn', href: '#' },
    { id: 'practice', label: 'Practice', href: '/practice' },
    { id: 'pricing', label: 'Pricing', href: '#' },
  ]

  return (
    <header style={navStyles.header}>
      <div style={navStyles.left}>
        <Link href="/" style={navStyles.brand}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Neuralearn</span>
          <span style={{ height: 10, width: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} aria-hidden />
        </Link>
        <nav style={navStyles.links}>
          {links.map(l => (
            <NavLink key={l.id} href={l.href} active={current === l.id}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div style={navStyles.right}>
        <Link href="#" style={navStyles.devLink}>
          For Developers <Icon name="external-link" size={13} />
        </Link>
        <DemoButton />
        <StartButton />
      </div>
    </header>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...navStyles.link,
        color: active || hover ? 'var(--foreground)' : 'var(--muted-foreground)',
      }}
    >
      {children}
    </Link>
  )
}

function DemoButton() {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href="/login"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...navStyles.demoBtn, background: hover ? 'var(--muted)' : 'var(--secondary)' }}
    >
      Request Demo
    </Link>
  )
}

function StartButton() {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href="/signup"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...navStyles.startBtn, background: hover ? 'var(--primary-glow)' : 'var(--primary)' }}
    >
      Get Started
    </Link>
  )
}

const navStyles: Record<string, CSSProperties> = {
  header: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 48px',
  },
  left: { display: 'flex', alignItems: 'center', gap: 40 },
  brand: { display: 'flex', alignItems: 'center', gap: 6, color: 'var(--foreground)' },
  links: { display: 'flex', alignItems: 'center', gap: 28 },
  link: { fontSize: 14, transition: 'color 0.2s' },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  devLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14,
    color: 'var(--muted-foreground)', transition: 'color 0.2s',
  },
  demoBtn: {
    borderRadius: 6, border: '1px solid var(--border)', background: 'var(--secondary)',
    padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
    transition: 'background 0.2s', display: 'inline-block',
  },
  startBtn: {
    borderRadius: 6, background: 'var(--primary)', padding: '8px 16px',
    fontSize: 14, fontWeight: 500, color: 'var(--primary-foreground)', transition: 'background 0.2s',
    display: 'inline-block',
  },
}
