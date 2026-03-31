import { useState } from 'react'

const CARGA_COLORS = {
  executivo:  { bg: '#fff7ed', color: '#b45309', label: '🎯 Foco em Tarefas' },
  contextual: { bg: '#f5f3ff', color: '#6d28d9', label: '🔍 Contexto' },
  fonologico: { bg: '#ecfdf5', color: '#065f46', label: '📖 Leitura' },
  combinado:  { bg: '#fef3c7', color: '#92400e', label: '⚡ Combinado' },
  neutro:     { bg: 'var(--bg2)', color: 'var(--ink3)', label: '● Monitorando' },
}

export default function Topbar({
  surface,
  onOpenNewDocument,
  onTogglePanel,
  isSpeaking,
  onStopSpeech,
  cognitive = {},
}) {
  const carga = cognitive?.carga || 'neutro'
  const cfg = CARGA_COLORS[carga] || CARGA_COLORS.neutro
  const confianca = cognitive?.confianca ? Math.round(cognitive.confianca * 100) : null

  const surfaceLabel = {
    editor: 'Editor',
    inbox: 'Inbox',
    tasks: 'Tarefas',
    examples: 'Exemplos',
  }

  return (
    <header style={styles.bar}>
      {/* Left: brand */}
      <div style={styles.brand}>
        <div style={styles.logoMark}>CF</div>
        <span style={styles.brandName}>CogniFlow</span>
        <div style={styles.divider} />
        <span style={styles.surfaceLabel}>{surfaceLabel[surface] || 'Editor'}</span>
      </div>

      {/* Center: cognitive state badge */}
      {carga !== 'neutro' ? (
        <div style={{ ...styles.cogBadge, background: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}>
          <span style={styles.cogDot} />
          <span style={styles.cogLabel}>{cfg.label}</span>
          {confianca && (
            <span style={{ ...styles.cogConf, color: cfg.color + 'aa' }}>{confianca}%</span>
          )}
        </div>
      ) : (
        <div style={styles.cogNeutro}>
          <span style={styles.pulseRing} />
          <span style={styles.cogNeutroText}>Capturando comportamento</span>
        </div>
      )}

      {/* Right: actions */}
      <div style={styles.right}>
        {isSpeaking && onStopSpeech && (
          <button onClick={onStopSpeech} style={styles.stopVoiceBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
            Parar voz
          </button>
        )}

        <button onClick={onOpenNewDocument} style={styles.newDocBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Novo documento
        </button>

        <button onClick={onTogglePanel} style={styles.panelBtn} title="Alternar painel de insights">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M15 3v18"/>
          </svg>
        </button>

        <div style={styles.avatar}>US</div>
      </div>

      <style>{`
        @keyframes topbarPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.6); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </header>
  )
}

const styles = {
  bar: {
    height: 52,
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: 16,
    flexShrink: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 28,
    height: 28,
    background: 'var(--ink)',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--surface)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontFamily: 'var(--mono)',
  },
  brandName: {
    fontFamily: 'var(--serif)',
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
  },
  divider: {
    width: 1,
    height: 16,
    background: 'var(--border)',
  },
  surfaceLabel: {
    fontSize: '.72rem',
    fontFamily: 'var(--mono)',
    color: 'var(--ink3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  cogBadge: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 14px',
    borderRadius: 20,
    border: '1px solid',
    transition: 'all 0.3s ease',
  },
  cogDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'currentColor',
    display: 'inline-block',
    animation: 'topbarPulse 2s ease-in-out infinite',
  },
  cogLabel: {
    fontSize: '.78rem',
    fontWeight: 600,
    fontFamily: 'var(--sans)',
    letterSpacing: '-0.01em',
  },
  cogConf: {
    fontSize: '.7rem',
    fontFamily: 'var(--mono)',
    fontWeight: 600,
  },
  cogNeutro: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 14px',
    borderRadius: 20,
    background: 'var(--green-s)',
    border: '1px solid rgba(26,122,74,0.15)',
    position: 'relative',
  },
  pulseRing: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-block',
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: 'var(--green)',
      animation: 'ringPulse 1.5s ease-out infinite',
    },
  },
  cogNeutroText: {
    fontSize: '.72rem',
    fontFamily: 'var(--mono)',
    color: 'var(--green)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stopVoiceBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'var(--red-s)',
    color: 'var(--red)',
    border: '1px solid rgba(192,57,43,0.2)',
    borderRadius: 8,
    fontSize: '.73rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--mono)',
  },
  newDocBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    background: 'var(--ink)',
    color: 'var(--surface)',
    border: 'none',
    borderRadius: 8,
    fontSize: '.73rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--sans)',
    letterSpacing: '-0.01em',
    transition: 'opacity 0.15s',
  },
  panelBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--ink2)',
    transition: 'all 0.15s',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--ink)',
    color: 'var(--surface)',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
  },
}