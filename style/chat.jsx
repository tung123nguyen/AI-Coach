// Chat page — original design using Neuralearn tokens, no Facebook/Messenger branding
const SCENARIO_LIBRARY = {
  coach: {
    title: 'AI Coach',
    subtitle: 'Free-form practice',
    intro: "Hi — I'm your communication coach. What kind of conversation do you want to rehearse today? It can be anything: a tough message, a fuzzy ask, a code review, a pitch.",
    suggestions: ['Help me brief an agent', 'Practice a hard apology', 'Coach me on a code review'],
    glyph: 'bot',
    accent: 'oklch(0.65 0.21 255)',
  },
  custom: {
    title: 'Custom scenario',
    subtitle: 'Sketch your own',
    intro: "Tell me the situation in plain English — who you're talking to, what you want out of it, and any constraints. I'll turn it into a practice session.",
    suggestions: ['I have a stakeholder who keeps changing the spec', 'I need to write a hard email to a teammate', 'Help me prep a 60-second pitch'],
    glyph: 'plus',
    accent: 'oklch(0.55 0.16 285)',
  },
  standup: {
    title: 'Lead a standup with AI teammates',
    subtitle: 'Workplace · 8 min',
    intro: "Morning. You're the lead today. Two of your teammates are AI agents — one shipped a feature overnight, the other is stuck on a flaky test. Open the standup. What's your first move?",
    suggestions: ['Ask both agents for their status', 'Surface the flaky test as the priority', "Set today's shared goal first"],
    glyph: 'users',
    accent: 'oklch(0.55 0.14 230)',
  },
  spec: {
    title: 'Brief an agent on a fuzzy spec',
    subtitle: 'Product · 12 min',
    intro: "Your PM just slacked: \"Can we add some kind of dashboard for billing?\" That's the whole brief. You need to turn it into something an agent can actually execute. Where do you start?",
    suggestions: ['Ask three clarifying questions first', 'Draft a structured prompt with constraints', 'Define what done looks like'],
    glyph: 'file-text',
    accent: 'oklch(0.5 0.14 280)',
  },
  review: {
    title: 'Pair-review code with an AI critic',
    subtitle: 'Engineering · 15 min',
    intro: "I've reviewed the diff you sent. There's a clever bit of caching that'll work, but I think it's hiding a race condition. Want me to walk through it, or do you want to push back on my read first?",
    suggestions: ['Walk me through the race condition', 'I disagree — defend your read', 'What would you do instead?'],
    glyph: 'code',
    accent: 'oklch(0.5 0.13 200)',
  },
  support: {
    title: 'Handle a frustrated customer',
    subtitle: 'Support · 10 min',
    intro: "Inbound from a customer: \"This is the third time this week your product has lost my work. I'm done.\" Draft your reply. I'll play the customer and react.",
    suggestions: ['Lead with empathy, then a concrete fix', 'Ask what they lost, specifically', 'Offer a call instead of email'],
    glyph: 'headphones',
    accent: 'oklch(0.55 0.14 30)',
  },
  design: {
    title: 'Run a design crit with AI as a stand-in',
    subtitle: 'Design · 14 min',
    intro: "Show me the flow. I'll play three skeptical stakeholders — eng, support, and the CFO — and push on it from each angle. Pitch me in two sentences before you share the screens.",
    suggestions: ['Pitch the flow in two sentences', 'Skip ahead — start with eng concerns', 'Ask which stakeholder to convince first'],
    glyph: 'pen-tool',
    accent: 'oklch(0.55 0.14 320)',
  },
  interview: {
    title: 'Mock interview with an AI panel',
    subtitle: 'Career · 20 min',
    intro: "Welcome. Three of us today: behavioral, system design, and culture. We'll rotate every five minutes and give a single block of feedback at the end. Ready when you are.",
    suggestions: ["I'm ready — start with behavioral", "Can I ask about the role first?", "Tell me how you'll grade me"],
    glyph: 'briefcase',
    accent: 'oklch(0.55 0.14 150)',
  },
  pitch: {
    title: 'Sharpen a 60-second pitch',
    subtitle: 'Business · 6 min',
    intro: "Imagine you're in an elevator with someone who could write the check. Sixty seconds. Go — and I'll react like an investor would.",
    suggestions: ["Let me draft, then you react", 'Investor first, ask me anything', 'Can you give me the structure?'],
    glyph: 'mic',
    accent: 'oklch(0.55 0.14 60)',
  },
  data: {
    title: 'Get an agent to query your data',
    subtitle: 'Data · 16 min',
    intro: "I'm your analytics agent. I have access to `orders`, `customers`, `events`, and `inventory`. Ask me anything — but be specific. Vague questions get vague answers.",
    suggestions: ['Show me churn last quarter', 'Which SKUs are stockouts?', 'How should I phrase this?'],
    glyph: 'database',
    accent: 'oklch(0.5 0.13 250)',
  },
  apology: {
    title: 'Draft a hard apology message',
    subtitle: 'Comms · 7 min',
    intro: "Tell me what happened, who was hurt, and what you can actually offer to make it right. We'll write it together — one sentence at a time.",
    suggestions: ['I missed a deadline that broke a launch', 'I sent the wrong file to a customer', 'I want the structure first'],
    glyph: 'mail',
    accent: 'oklch(0.55 0.14 10)',
  },
};

function ChatHeader({ scenario, navigate }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'oklch(0.06 0.01 260 / 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <button onClick={() => navigate('practice')} style={{
        height: 36, width: 36, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border)', background: 'var(--secondary)',
        color: 'var(--foreground)'
      }} aria-label="Back">
        <Icon name="arrow-left" size={16} />
      </button>
      <div style={{
        position: 'relative',
        height: 44, width: 44, borderRadius: 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `${scenario.accent} / 0.14`,
        backgroundColor: 'oklch(0.65 0.21 255 / 0.14)',
        border: `1px solid ${scenario.accent}`,
        color: scenario.accent,
      }}>
        <Icon name={scenario.glyph} size={20} strokeWidth={1.5} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          height: 12, width: 12, borderRadius: 999,
          background: 'oklch(0.7 0.15 145)',
          border: '2px solid var(--background)',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600 }}>
          {scenario.title}
          <Icon name="badge-check" size={14} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          <span style={{ color: 'oklch(0.7 0.15 145)' }}>●</span> Active · {scenario.subtitle}
        </div>
      </div>
      <button style={iconBtn} aria-label="Info"><Icon name="info" size={16} /></button>
      <button style={iconBtn} aria-label="More"><Icon name="more-horizontal" size={16} /></button>
    </div>
  );
}
const iconBtn = {
  height: 36, width: 36, borderRadius: 999,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--muted-foreground)',
};

function Sidebar({ active, onPick, navigate }) {
  const items = Object.entries(SCENARIO_LIBRARY).map(([id, s]) => ({ id, ...s }));
  return (
    <aside style={{
      width: 320, borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      background: 'oklch(0.07 0.012 260)',
    }}>
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Sessions</h2>
        <button onClick={() => navigate('practice')} style={{
          ...iconBtn, height: 32, width: 32,
        }} aria-label="New session">
          <Icon name="square-pen" size={14} />
        </button>
      </div>
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 999,
          background: 'var(--secondary)', border: '1px solid var(--border)',
          color: 'var(--muted-foreground)', fontSize: 13,
        }}>
          <Icon name="search" size={14} />
          <input placeholder="Search sessions" style={{
            background: 'transparent', border: 0, outline: 'none', flex: 1,
            color: 'var(--foreground)', fontSize: 13, fontFamily: 'inherit'
          }} />
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
        {items.map(s => {
          const isActive = active === s.id;
          return (
            <button key={s.id} onClick={() => onPick(s.id)} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              width: '100%', padding: '12px',
              borderRadius: 10, border: 0,
              background: isActive ? 'var(--secondary)' : 'transparent',
              color: 'var(--foreground)', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'oklch(0.12 0.018 260)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{
                height: 40, width: 40, borderRadius: 10, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'oklch(0.65 0.21 255 / 0.12)',
                border: '1px solid oklch(0.65 0.21 255 / 0.25)',
                color: s.accent,
              }}>
                <Icon name={s.glyph} size={16} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function InfoPanel({ scenario }) {
  return (
    <aside style={{
      width: 320, borderLeft: '1px solid var(--border)',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 24,
      background: 'oklch(0.07 0.012 260)',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          height: 88, width: 88, borderRadius: 22,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'oklch(0.65 0.21 255 / 0.14)',
          border: '1px solid oklch(0.65 0.21 255 / 0.3)',
          color: scenario.accent,
        }}>
          <Icon name={scenario.glyph} size={36} strokeWidth={1.4} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 600 }}>
          {scenario.title}
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
  );
}

function MessageBubble({ m, scenario }) {
  if (m.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="fade-in">
        <div style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '18px 18px 4px 18px',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontSize: 15, lineHeight: 1.5,
          boxShadow: '0 1px 0 oklch(1 0 0 / 0.05)',
        }}>{m.text}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="fade-in">
      <div style={{
        height: 32, width: 32, borderRadius: 999, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.65 0.21 255 / 0.12)',
        border: '1px solid oklch(0.65 0.21 255 / 0.3)',
        color: scenario.accent,
      }}>
        <Icon name={scenario.glyph} size={14} strokeWidth={1.6} />
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
      }}>{m.text}</div>
    </div>
  );
}

function TypingIndicator({ scenario }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="fade-in">
      <div style={{
        height: 32, width: 32, borderRadius: 999, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.65 0.21 255 / 0.12)',
        border: '1px solid oklch(0.65 0.21 255 / 0.3)',
        color: scenario.accent,
      }}>
        <Icon name={scenario.glyph} size={14} strokeWidth={1.6} />
      </div>
      <div style={{
        padding: '14px 18px',
        borderRadius: '18px 18px 18px 4px',
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            height: 6, width: 6, borderRadius: 999,
            background: 'var(--muted-foreground)',
            animation: `typing 1.2s ${i * 0.15}s infinite ease-in-out`
          }} />
        ))}
        <style>{`
          @keyframes typing {
            0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
        `}</style>
      </div>
    </div>
  );
}

function Composer({ onSend, suggestions, showSuggestions }) {
  const [text, setText] = React.useState('');
  const inputRef = React.useRef(null);
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };
  return (
    <div style={{ padding: '12px 24px 20px', background: 'oklch(0.06 0.01 260)' }}>
      {showSuggestions && suggestions?.length ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => onSend(s)} style={{
              padding: '8px 14px', fontSize: 13,
              borderRadius: 999, border: '1px solid var(--border)',
              background: 'var(--card)', color: 'var(--foreground)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'oklch(0.65 0.21 255 / 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}>
        <button style={composerIcon} aria-label="Attach"><Icon name="image" size={18} /></button>
        <button style={composerIcon} aria-label="Sticker"><Icon name="smile" size={18} /></button>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Practice your message..."
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--foreground)', fontSize: 15, fontFamily: 'inherit',
            padding: '4px 0',
          }}
        />
        <button onClick={send} style={{
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
  );
}
const composerIcon = {
  height: 34, width: 34, borderRadius: 999,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: 0, background: 'transparent', color: 'var(--muted-foreground)',
};

function generateReply(userText, scenario) {
  const lower = userText.toLowerCase();
  // A few shaped, scenario-aware replies. Not LLM — feels like a coached partner.
  if (lower.includes('?')) {
    return `Good question to lead with. Before I answer: what's the outcome you'd accept here? Naming that up front makes the rest of the conversation cheaper.`;
  }
  if (userText.length < 30) {
    return `That's a start — but it's thin. Try expanding it: who's the audience, what do they need to know, and what action should they take after reading it?`;
  }
  return `Solid framing. One thing I'd push on: you're stating the situation, but you haven't named the trade-off. What does the reader give up if they say yes? That's usually where these conversations get stuck.\n\nWant to try a revision, or should I model what I'd say?`;
}

function Chat({ navigate, params }) {
  const initialId = params?.id && SCENARIO_LIBRARY[params.id] ? params.id : 'coach';
  const [activeId, setActiveId] = React.useState(initialId);
  const scenario = SCENARIO_LIBRARY[activeId];

  const [messagesByScenario, setMessagesByScenario] = React.useState(() => {
    const init = {};
    Object.entries(SCENARIO_LIBRARY).forEach(([id, s]) => {
      init[id] = [{ role: 'ai', text: s.intro }];
    });
    return init;
  });
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  const messages = messagesByScenario[activeId] || [];

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, activeId]);

  const send = (text) => {
    setMessagesByScenario(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { role: 'user', text }]
    }));
    setTyping(true);
    setTimeout(() => {
      setMessagesByScenario(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), { role: 'ai', text: generateReply(text, scenario) }]
      }));
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
      <Nav navigate={navigate} current="practice" />
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr 320px',
        minHeight: 'calc(100vh - 80px)',
        borderTop: '1px solid var(--border)',
      }}>
        <Sidebar active={activeId} onPick={setActiveId} navigate={navigate} />
        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--background)' }}>
          <ChatHeader scenario={scenario} navigate={navigate} />
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.18em', padding: '4px 0 8px' }}>
              Practice session · {scenario.subtitle}
            </div>
            {messages.map((m, i) => <MessageBubble key={i} m={m} scenario={scenario} />)}
            {typing && <TypingIndicator scenario={scenario} />}
          </div>
          <Composer onSend={send} suggestions={scenario.suggestions} showSuggestions={showSuggestions} />
        </main>
        <InfoPanel scenario={scenario} />
      </div>
    </div>
  );
}

window.Chat = Chat;
