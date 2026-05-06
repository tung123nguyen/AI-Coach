// App router
function App() {
  const parseHash = () => {
    const h = window.location.hash.replace(/^#/, '');
    if (!h || h === 'home') return { route: 'home', params: {} };
    const [route, qs] = h.split('?');
    const params = {};
    if (qs) {
      qs.split('&').forEach(p => {
        const [k, v] = p.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { route, params };
  };

  const [state, setState] = React.useState(parseHash());

  React.useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [state.route]);

  const navigate = (route, params) => {
    let hash = '#' + route;
    if (params) {
      const qs = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      if (qs) hash += '?' + qs;
    }
    window.location.hash = hash;
  };

  if (state.route === 'practice') return <Practice navigate={navigate} />;
  if (state.route === 'chat') return <Chat navigate={navigate} params={state.params} />;
  return <Landing navigate={navigate} />;
}

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<App />);
