import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      zIndex: 9999,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div
          className="font-display"
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--x-color), var(--accent), var(--o-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          XTOE
        </div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading game...</p>
    </div>
  );
}
