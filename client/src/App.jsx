import React, { useEffect, useState } from 'react';
import { apiGet } from './api.js';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/api/health')
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>React + Express template</h1>
      <p>Front-end: React (Vite). Back-end: Node.js + Express.</p>
      <section style={{ marginTop: '1rem' }}>
        <h2>API health</h2>
        {!health && !error && <p>Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
        {health && (
          <pre style={{ background: '#f6f8fa', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
{JSON.stringify(health, null, 2)}
          </pre>
        )}
      </section>
      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#555' }}>
        Update <code>VITE_API_BASE_URL</code> in <code>.env</code> if your API runs elsewhere.
      </footer>
    </div>
  );
}


