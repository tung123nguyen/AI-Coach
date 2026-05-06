// Shared layout: Nav header
function Nav({ navigate, current }) {
  const links = [
    { id: 'platform', label: 'Platform', href: '#' },
    { id: 'solutions', label: 'Solutions', href: '#' },
    { id: 'practice', label: 'Practice', href: '#practice' },
    { id: 'pricing', label: 'Pricing', href: '#' },
  ];
  return (
    <header style={navStyles.header}>
      <div style={navStyles.left}>
        <a href="#home" onClick={(e) => { e.preventDefault(); navigate('home'); }} style={navStyles.brand}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Neuralearn</span>
          <span style={{ height: 10, width: 10, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} aria-hidden />
        </a>
        <nav style={navStyles.links}>
          {links.map(l => (
            <a
              key={l.id}
              href={l.href}
              onClick={(e) => {
                if (l.id === 'practice') { e.preventDefault(); navigate('practice'); }
              }}
              style={{
                ...navStyles.link,
                color: current === l.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
              onMouseLeave={(e) => e.currentTarget.style.color = current === l.id ? 'var(--foreground)' : 'var(--muted-foreground)'}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div style={navStyles.right}>
        <a href="#" style={navStyles.devLink}>
          For Developers <Icon name="external-link" size={13} />
        </a>
        <a href="#" style={navStyles.demoBtn}
           onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
           onMouseLeave={(e) => e.currentTarget.style.background = 'var(--secondary)'}>
          Request Demo
        </a>
        <a href="#" style={navStyles.startBtn}
           onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-glow)'}
           onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}>
          Get Started
        </a>
      </div>
    </header>
  );
}

const navStyles = {
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
    color: 'var(--muted-foreground)', transition: 'color 0.2s'
  },
  demoBtn: {
    borderRadius: 6, border: '1px solid var(--border)', background: 'var(--secondary)',
    padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
    transition: 'background 0.2s', display: 'inline-block'
  },
  startBtn: {
    borderRadius: 6, background: 'var(--primary)', padding: '8px 16px',
    fontSize: 14, fontWeight: 500, color: 'var(--primary-foreground)', transition: 'background 0.2s',
    display: 'inline-block'
  },
};

function Footer() {
  const cols = [
    { title: 'Product', links: ['Platform', 'Practice', 'Labs', 'Evals'] },
    { title: 'Company', links: ['About', 'Customers', 'Careers', 'Contact'] },
    { title: 'Resources', links: ['Blog', 'Guides', 'Changelog', 'Security'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'DPA', 'Trust'] },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '64px 48px' }}>
      <div style={{ margin: '0 auto', maxWidth: 1152, display: 'grid', gap: 40, gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>Neuralearn</span>
            <span style={{ height: 8, width: 8, borderRadius: 2, background: 'var(--primary)' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)' }}>
            Learning for the agentic AI era.
          </p>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <p style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)' }}>{c.title}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.links.map(l => (
                <li key={l}><a href="#" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ margin: '48px auto 0', maxWidth: 1152, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}>
        <span>© {new Date().getFullYear()} Neuralearn, Inc.</span>
        <span>Made for the agentic era.</span>
      </div>
    </footer>
  );
}

window.Nav = Nav;
window.Footer = Footer;
