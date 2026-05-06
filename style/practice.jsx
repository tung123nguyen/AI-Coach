// Practice / Situations page
const SITUATIONS = [
  {
    id: 'standup',
    title: 'Lead a standup with AI teammates',
    blurb: 'Open the day, surface blockers, and ask AI agents to summarize threads in under 60 seconds.',
    tag: 'Workplace', level: 'Core', minutes: 8,
    tone: 'oklch(0.45 0.12 230)',
    glyph: 'users',
  },
  {
    id: 'spec',
    title: 'Brief an agent on a fuzzy spec',
    blurb: 'Translate a one-line ask from a stakeholder into a tight, executable agent prompt with constraints.',
    tag: 'Product', level: 'Intermediate', minutes: 12,
    tone: 'oklch(0.5 0.14 280)',
    glyph: 'file-text',
  },
  {
    id: 'review',
    title: 'Pair-review code with an AI critic',
    blurb: 'Drive a back-and-forth review: ask for trade-offs, push back, and land on the right abstraction.',
    tag: 'Engineering', level: 'Intermediate', minutes: 15,
    tone: 'oklch(0.45 0.13 200)',
    glyph: 'code',
  },
  {
    id: 'support',
    title: 'Handle a frustrated customer',
    blurb: 'Respond to a heated email with empathy, structure, and a clear next step — coached by AI.',
    tag: 'Support', level: 'Core', minutes: 10,
    tone: 'oklch(0.5 0.14 30)',
    glyph: 'headphones',
  },
  {
    id: 'design',
    title: 'Run a design crit with AI as a stand-in',
    blurb: 'Pitch a flow, defend it under questioning, and use AI to spot weak assumptions before stakeholders do.',
    tag: 'Design', level: 'Intermediate', minutes: 14,
    tone: 'oklch(0.5 0.14 320)',
    glyph: 'pen-tool',
  },
  {
    id: 'interview',
    title: 'Mock interview with an AI panel',
    blurb: 'Behavioral questions, system design probing, and structured feedback you can actually act on.',
    tag: 'Career', level: 'Advanced', minutes: 20,
    tone: 'oklch(0.5 0.14 150)',
    glyph: 'briefcase',
  },
  {
    id: 'pitch',
    title: 'Sharpen a 60-second pitch',
    blurb: 'Workshop your elevator pitch with an AI listener that asks the questions an investor would.',
    tag: 'Business', level: 'Core', minutes: 6,
    tone: 'oklch(0.5 0.14 60)',
    glyph: 'mic',
  },
  {
    id: 'data',
    title: 'Get an agent to query your data',
    blurb: 'Frame the question, name the tables, narrow the window. Prompt patterns for analytics workflows.',
    tag: 'Data', level: 'Advanced', minutes: 16,
    tone: 'oklch(0.45 0.13 250)',
    glyph: 'database',
  },
  {
    id: 'apology',
    title: 'Draft a hard apology message',
    blurb: 'Acknowledge, own, and offer a concrete remedy. Iterate with AI until the tone lands.',
    tag: 'Comms', level: 'Core', minutes: 7,
    tone: 'oklch(0.5 0.14 10)',
    glyph: 'mail',
  },
];

function SituationCard({ s, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={() => onOpen(s.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        background: 'var(--card)',
        border: `1px solid ${hover ? 'oklch(0.65 0.21 255 / 0.4)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--foreground)',
      }}>
      {/* Image */}
      <div className="img-placeholder" style={{
        height: 160,
        position: 'relative',
        background: `radial-gradient(circle at 30% 30%, ${s.tone}, oklch(0.09 0.015 260) 75%)`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, oklch(1 0 0 / 0.04) 0, oklch(1 0 0 / 0.04) 1px, transparent 1px, transparent 14px)'
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'oklch(0.06 0.01 260 / 0.6)', border: '1px solid var(--border)', backdropFilter: 'blur(6px)', color: 'var(--foreground)' }}>{s.tag}</span>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'oklch(0.06 0.01 260 / 0.6)', border: '1px solid var(--border)', backdropFilter: 'blur(6px)', color: 'var(--muted-foreground)' }}>{s.level}</span>
        </div>
        <div style={{
          position: 'absolute', right: 14, bottom: 14,
          height: 44, width: 44, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'oklch(0.06 0.01 260 / 0.7)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)',
          color: 'var(--foreground)'
        }}>
          <Icon name={s.glyph} size={20} strokeWidth={1.5} />
        </div>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.35, textWrap: 'pretty' }}>{s.title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-foreground)', flex: 1 }}>{s.blurb}</p>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={12} /> {s.minutes} min
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: 'var(--primary)', opacity: hover ? 1 : 0, transition: 'opacity 0.2s'
          }}>
            Open <Icon name="arrow-right" size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function PracticeHeader() {
  return (
    <section style={{ padding: '64px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', margin: '0 auto', maxWidth: 880 }}>
        {/* Iconographic header — mirrors chat view header style */}
        <div style={{
          margin: '0 auto 28px',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', borderRadius: 999,
          border: '1px solid var(--border)', background: 'oklch(0.16 0.02 260 / 0.6)',
          backdropFilter: 'blur(8px)', fontSize: 12, color: 'var(--muted-foreground)'
        }}>
          <span style={{ height: 6, width: 6, borderRadius: 999, background: 'var(--primary)' }} />
          Practice library
        </div>
        <div style={{
          margin: '0 auto 24px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 14
        }}>
          <span style={{
            position: 'relative',
            height: 64, width: 64, borderRadius: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'oklch(0.65 0.21 255 / 0.12)',
            border: '1px solid oklch(0.65 0.21 255 / 0.3)',
            color: 'var(--primary)'
          }}>
            <Icon name="messages-square" size={28} strokeWidth={1.5} />
            <span style={{
              position: 'absolute', top: -4, right: -4,
              height: 16, width: 16, borderRadius: 999,
              background: 'var(--primary)', boxShadow: 'var(--shadow-glow)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary-foreground)'
            }}>
              <Icon name="sparkles" size={9} strokeWidth={2.5} />
            </span>
          </span>
        </div>
        <h1 style={{
          margin: 0, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600,
          letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--foreground)'
        }}>
          Practice talking <span style={{ color: 'var(--muted-foreground)' }}>with AI</span>.
        </h1>
        <p style={{ margin: '20px auto 0', maxWidth: 560, fontSize: 16, color: 'var(--muted-foreground)' }}>
          Pick a real situation, jump into a conversation, and walk away with the muscle memory for working alongside agents.
        </p>
      </div>
    </section>
  );
}

function PracticeFeatured({ navigate }) {
  return (
    <section style={{ padding: '0 24px 56px' }}>
      <div style={{
        margin: '0 auto', maxWidth: 1152,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16
      }}>
        {/* Talk to AI Coach */}
        <button onClick={() => navigate('chat', { id: 'coach' })} style={featuredCardBase('var(--primary)')}>
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

        {/* Create your own */}
        <button onClick={() => navigate('chat', { id: 'custom' })} style={featuredCardBase('oklch(0.55 0.16 285)')}>
          <div style={{ ...featuredIconWrap(), background: 'oklch(0.55 0.16 285 / 0.12)', borderColor: 'oklch(0.55 0.16 285 / 0.35)', color: 'oklch(0.75 0.14 285)' }}>
            <Icon name="plus" size={26} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'oklch(0.75 0.14 285)' }}>
              <Icon name="wand" size={11} /> Custom
            </div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Create your own</div>
            <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              Sketch a scenario in plain English. We'll turn it into a structured practice session.
            </div>
          </div>
          <div style={featuredArrow}>
            <Icon name="arrow-right" size={18} />
          </div>
        </button>
      </div>
    </section>
  );
}

function featuredCardBase(accent) {
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
  };
}
function featuredIconWrap() {
  return {
    height: 56, width: 56, borderRadius: 12, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'oklch(0.65 0.21 255 / 0.12)',
    border: '1px solid oklch(0.65 0.21 255 / 0.35)',
    color: 'var(--primary)',
  };
}
const featuredArrow = {
  height: 36, width: 36, borderRadius: 999, flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--border)', color: 'var(--muted-foreground)',
};

function Practice({ navigate }) {
  const [filter, setFilter] = React.useState('All');
  const tags = ['All', ...Array.from(new Set(SITUATIONS.map(s => s.tag)))];
  const list = filter === 'All' ? SITUATIONS : SITUATIONS.filter(s => s.tag === filter);
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <Nav navigate={navigate} current="practice" />
      <PracticeHeader />
      <PracticeFeatured navigate={navigate} />
      <section style={{ padding: '0 24px 40px' }}>
        <div style={{ margin: '0 auto', maxWidth: 1152 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)' }}>Situations</p>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>Browse the library</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  style={{
                    padding: '6px 14px', fontSize: 12,
                    borderRadius: 999,
                    border: '1px solid ' + (filter === t ? 'transparent' : 'var(--border)'),
                    background: filter === t ? 'var(--foreground)' : 'transparent',
                    color: filter === t ? 'var(--background)' : 'var(--muted-foreground)',
                    transition: 'all 0.15s'
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{
            display: 'grid', gap: 18,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {list.map(s => (
              <SituationCard key={s.id} s={s} onOpen={(id) => navigate('chat', { id })} />
            ))}
          </div>
        </div>
      </section>
      <div style={{ height: 40 }} />
      <Footer />
    </main>
  );
}

window.Practice = Practice;
window.SITUATIONS = SITUATIONS;
