export default function Footer() {
  const cols = [
    { title: 'Product', links: ['Platform', 'Practice', 'Labs', 'Evals'] },
    { title: 'Company', links: ['About', 'Customers', 'Careers', 'Contact'] },
    { title: 'Resources', links: ['Blog', 'Guides', 'Changelog', 'Security'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'DPA', 'Trust'] },
  ]
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
  )
}
