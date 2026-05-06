// Lightweight wrapper around lucide for React
function Icon({ name, size = 16, strokeWidth = 1.75, className = '', style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = '';
    const svg = window.lucide.createElement(window.lucide.icons[toPascal(name)]);
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', strokeWidth);
      ref.current.appendChild(svg);
    }
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden />;
}

function toPascal(s) {
  return s.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

window.Icon = Icon;
