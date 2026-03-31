import React, { useMemo, useState } from 'react'
import CognitiveStateIndicator from './CognitiveStateIndicator'

const demoStates = {
  neutro: {
    estado: ['neutro'],
    score: { executivo: 1, contextual: 1, fonologico: 0 },
    confianca: 0.52
  },
  executivo: {
    estado: ['executivo'],
    score: { executivo: 5, contextual: 1, fonologico: 1 },
    confianca: 0.78
  },
  contextual: {
    estado: ['contextual'],
    score: { executivo: 1, contextual: 6, fonologico: 1 },
    confianca: 0.84
  },
  fonologico: {
    estado: ['fonologico'],
    score: { executivo: 1, contextual: 2, fonologico: 5 },
    confianca: 0.76
  },
  comorbidade: {
    estado: ['executivo', 'contextual'],
    score: { executivo: 5, contextual: 5, fonologico: 1 },
    confianca: 0.91
  }
}

const demoMessages = {
  neutro: 'Segue a atualização do projeto. Quando puder, me avise se está tudo certo.',
  executivo: 'Tenho várias tarefas abertas e não sei por onde começar. Preciso quebrar isso em passos menores.',
  contextual: 'Recebi um e-mail curto e não entendi bem o que a pessoa espera que eu faça.',
  fonologico: 'Esse texto está difícil de acompanhar e estou relendo as mesmas partes várias vezes.',
  comorbidade: 'Recebi uma solicitação ambígua, fiquei travada para responder e ainda preciso organizar tudo em passos claros.'
}

export default function DemoSimulator() {
  const [scenario, setScenario] = useState('contextual')

  const selectedState = useMemo(() => demoStates[scenario], [scenario])
  const selectedMessage = useMemo(() => demoMessages[scenario], [scenario])

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 18 }}>Simulação de comportamento</h3>
        <p style={{ margin: '6px 0 0', color: '#666' }}>
          Use cenários prontos para demonstrar o CogniFlow.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['neutro', 'executivo', 'contextual', 'fonologico', 'comorbidade'].map((item) => (
          <button
            key={item}
            onClick={() => setScenario(item)}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: scenario === item ? '1px solid #111' : '1px solid #ddd',
              background: scenario === item ? '#111' : '#fff',
              color: scenario === item ? '#fff' : '#111',
              cursor: 'pointer'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: '#fafafa',
          border: '1px solid #eee'
        }}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Mensagem simulada</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{selectedMessage}</div>
      </div>

      <CognitiveStateIndicator estadoDetectado={selectedState} />
    </div>
  )
}