// src/components/SuggestionChips.jsx
export default function SuggestionChips({ onSelect, cognitive }) {
  const suggestions = [
    { text: 'Dividir em partes menores', action: 'focus', icon: '⚡' },
    { text: 'Fazer pausa de 2min', action: 'pause', icon: '☕' },
    { text: 'Esclarecer o que fazer', action: 'context', icon: '❓' },
    { text: 'Ver histórico de hoje', action: 'history', icon: '📊' }
  ]

  if (cognitive?.carga === 'executiva') {
    suggestions.unshift({ text: 'Comece pela tarefa mais simples', action: 'focus', icon: '🎯' })
  }
  if (cognitive?.carga === 'contextual') {
    suggestions.unshift({ text: 'Posso esclarecer qualquer dúvida', action: 'context', icon: '💡' })
  }

  return (
    <div style={{
      background: 'var(--bg2)',
      borderRadius: 12,
      padding: '12px',
      marginBottom: 12
    }}>
      <div style={{ fontSize: '.7rem', color: 'var(--ink3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>💡</span> Sugestões para agora
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.action)}
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 20,
              fontSize: '.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'var(--accent-s)'}
            onMouseLeave={e => e.target.style.background = 'white'}
          >
            <span>{s.icon}</span> {s.text}
          </button>
        ))}
      </div>
    </div>
  )
}