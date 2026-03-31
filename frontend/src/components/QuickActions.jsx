import { useState } from 'react'

const ACTIONS = [
  {
    id: 'focus',
    icon: '🎯',
    label: 'Organizar tarefas',
    description: 'Quebra em micro-passos',
    color: '#b45309',
    bg: '#fff7ed',
    border: 'rgba(180,83,9,0.2)',
  },
  {
    id: 'context',
    icon: '🔍',
    label: 'Esclarecer contexto',
    description: 'Torna o implícito explícito',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: 'rgba(109,40,217,0.2)',
  },
  {
    id: 'phon',
    icon: '📖',
    label: 'Ajustar leitura',
    description: 'Tipografia e áudio',
    color: '#065f46',
    bg: '#ecfdf5',
    border: 'rgba(6,95,70,0.2)',
  },
  {
    id: 'pause',
    icon: '☕',
    label: 'Sugerir pausa',
    description: '2 minutos de respiro',
    color: '#1a7a4a',
    bg: 'var(--green-s)',
    border: 'rgba(26,122,74,0.2)',
  },
]

export default function QuickActions({ onAction, cognitive, loading }) {
  const [hovered, setHovered] = useState(null)

  // Highlight agent most relevant to current cognitive state
  const activeAgent = cognitive?.carga
  const getIsRelevant = (id) => {
    if (!activeAgent || activeAgent === 'neutro') return false
    if (activeAgent === 'executivo' && id === 'focus') return true
    if (activeAgent === 'contextual' && id === 'context') return true
    if (activeAgent === 'fonologico' && id === 'phon') return true
    if (activeAgent === 'combinado') return id === 'focus' || id === 'context'
    return false
  }

  return (
    <div style={styles.wrap}>
      <span style={styles.label}>Agentes</span>
      <div style={styles.actions}>
        {ACTIONS.map((action) => {
          const isRelevant = getIsRelevant(action.id)
          const isHovered = hovered === action.id
          return (
            <button
              key={action.id}
              onClick={() => !loading && onAction(action.id)}
              disabled={loading}
              onMouseEnter={() => setHovered(action.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.btn,
                ...(isRelevant ? {
                  background: action.bg,
                  borderColor: action.border,
                  color: action.color,
                  boxShadow: `0 0 0 2px ${action.border}`,
                } : {}),
                ...(isHovered && !isRelevant ? {
                  background: action.bg,
                  borderColor: action.border,
                  color: action.color,
                } : {}),
                opacity: loading ? 0.5 : 1,
              }}
              title={action.description}
            >
              <span style={styles.btnIcon}>{action.icon}</span>
              <span style={styles.btnLabel}>{action.label}</span>
              {isRelevant && (
                <span style={{ ...styles.relevantDot, background: action.color }} />
              )}
            </button>
          )
        })}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  label: {
    fontSize: 9,
    fontFamily: 'var(--mono)',
    fontWeight: 700,
    color: 'var(--ink3)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 12px',
    border: '1px solid var(--border)',
    borderRadius: 20,
    background: 'var(--surface)',
    color: 'var(--ink2)',
    cursor: 'pointer',
    fontSize: '.75rem',
    fontFamily: 'var(--sans)',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    position: 'relative',
    letterSpacing: '-0.01em',
  },
  btnIcon: {
    fontSize: 14,
    lineHeight: 1,
  },
  btnLabel: {
    lineHeight: 1,
  },
  relevantDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: 2,
    animation: 'dotPulse 1.5s ease-in-out infinite',
  },
}