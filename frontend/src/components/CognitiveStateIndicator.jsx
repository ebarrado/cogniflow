import React from 'react'

function getLabel(estados = []) {
  if (!estados || estados.length === 0) return 'Neutro'
  if (estados.length > 1) return 'Comorbidade detectada'
  if (estados.includes('executivo')) return 'Carga executiva'
  if (estados.includes('contextual')) return 'Carga contextual'
  if (estados.includes('fonologico')) return 'Carga fonológica'
  return 'Neutro'
}

function getDescription(estados = []) {
  if (!estados || estados.length === 0 || estados.includes('neutro')) {
    return 'Sem sinais fortes de sobrecarga no momento.'
  }

  if (estados.length > 1) {
    return 'Múltiplos sinais ativos. O sistema está combinando intervenções.'
  }

  if (estados.includes('executivo')) {
    return 'Sinais de sobrecarga em ritmo, foco e transição entre tarefas.'
  }

  if (estados.includes('contextual')) {
    return 'Sinais de custo elevado para interpretar instruções implícitas.'
  }

  if (estados.includes('fonologico')) {
    return 'Sinais de esforço elevado para leitura e processamento textual.'
  }

  return 'Estado não identificado.'
}

function getBadgeStyle(tipo) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid'
  }

  if (tipo === 'multi') {
    return { ...base, background: '#f6f0ff', color: '#6f42c1', borderColor: '#d9c8ff' }
  }

  if (tipo === 'executivo') {
    return { ...base, background: '#fff6e8', color: '#a15c00', borderColor: '#ffd79a' }
  }

  if (tipo === 'contextual') {
    return { ...base, background: '#eef6ff', color: '#0b5cab', borderColor: '#bddbff' }
  }

  if (tipo === 'fonologico') {
    return { ...base, background: '#eefbf3', color: '#18794e', borderColor: '#bce3cb' }
  }

  return { ...base, background: '#f4f4f5', color: '#52525b', borderColor: '#d4d4d8' }
}

function getPrimaryType(estados = []) {
  if (!estados || estados.length === 0 || estados.includes('neutro')) return 'neutro'
  if (estados.length > 1) return 'multi'
  return estados[0]
}

function ScoreBox({ label, value }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 12,
        background: '#fafafa'
      }}
    >
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

export default function CognitiveStateIndicator({ estadoDetectado }) {
  const estados = estadoDetectado?.estado || ['neutro']
  const score = estadoDetectado?.score || {}
  const confianca = estadoDetectado?.confianca ?? 0.5

  const primaryType = getPrimaryType(estados)
  const badgeStyle = getBadgeStyle(primaryType)

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
            Estado cognitivo atual
          </div>
          <div style={badgeStyle}>
            <span>🧠</span>
            <span>{getLabel(estados)}</span>
          </div>
        </div>

        <div style={{ minWidth: 140 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
            Confiança
          </div>
          <div style={{ height: 10, background: '#ececec', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.round(confianca * 100)}%`,
                height: '100%',
                background: '#111'
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {Math.round(confianca * 100)}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>
        {getDescription(estados)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        <ScoreBox label="Executivo" value={score.executivo || 0} />
        <ScoreBox label="Contextual" value={score.contextual || 0} />
        <ScoreBox label="Fonológico" value={score.fonologico || 0} />
      </div>
    </div>
  )
}