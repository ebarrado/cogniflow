// components/CognitiveInterventionCard.jsx
export default function CognitiveInterventionCard({ 
  estadoDetectado, 
  onAction, 
  errosFoneticos = [], 
  agenteAtivo = null,
  justificativaAgente = null
}) {
  const { estado, confianca, score } = estadoDetectado
  const temErrosFoneticos = errosFoneticos && errosFoneticos.length > 0
  
  // Determinar agente principal (prioriza agenteAtivo)
  const agentePrincipal = agenteAtivo || estado[0] || 'neutro'
  
  const getAgentIcon = () => {
    if (agentePrincipal === 'FocusAgent') return '🎯'
    if (agentePrincipal === 'ContextAgent') return '🔍'
    if (agentePrincipal === 'PhonAgent') return '📖'
    return '🧠'
  }
  
  const getAgentName = () => {
    if (agentePrincipal === 'FocusAgent') return 'FocusAgent'
    if (agentePrincipal === 'ContextAgent') return 'ContextAgent'
    if (agentePrincipal === 'PhonAgent') return 'PhonAgent'
    return 'Monitorando'
  }
  
  const getActions = () => {
    // Priorizar o agente ativo
    if (agentePrincipal === 'FocusAgent') {
      return [
        { id: 'aplicar_focus', label: 'Aplicar Focus', icon: '🎯' },
        { id: 'ver_focus', label: 'Ver exemplo', icon: '👁️' },
      ]
    }
    
    if (agentePrincipal === 'ContextAgent') {
      return [
        { id: 'aplicar_contexto', label: 'Esclarecer contexto', icon: '🔍' },
        { id: 'gerar_resposta', label: 'Gerar resposta', icon: '💬' },
      ]
    }
    
    if (agentePrincipal === 'PhonAgent') {
      if (temErrosFoneticos) {
        return [
          { id: 'aplicar_correcao_fonetica', label: `Corrigir ${errosFoneticos.length} erro(s)`, icon: '✅' },
          { id: 'ver_correcoes', label: 'Ver sugestões', icon: '🔍' },
          { id: 'aplicar_leitura', label: 'Melhorar leitura', icon: '📖' },
        ]
      }
      return [
        { id: 'aplicar_leitura', label: 'Melhorar leitura', icon: '📖' },
        { id: 'prever_leitura', label: 'Prévia', icon: '👁️' },
      ]
    }
    
    // Fallback
    return [
      { id: 'aplicar_blend', label: 'Sugestão combinada', icon: '🔄' },
      { id: 'ver_blend', label: 'Ver proposta', icon: '👁️' },
    ]
  }
  
  const actions = getActions()
  
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>{getAgentIcon()}</span>
        <span style={styles.title}>{getAgentName()}</span>
      </div>
      
      <div style={styles.state}>
        <strong>Carga detectada:</strong> {estado.join(', ')}
        <div style={styles.confidence}>
          Confiança: {Math.round(confianca * 100)}%
        </div>
      </div>
      
      <div style={styles.scoreBox}>
        <div>Executivo: {score.executivo}</div>
        <div>Contextual: {score.contextual}</div>
        <div>Fonológico: {score.fonologico}</div>
      </div>

      {/* NOVO BOX DE TRANSPARÊNCIA (O "WHY") */}
      <div style={styles.explanationBox}>
        <div style={styles.explanationTitle}>
          <span style={{ marginRight: 4 }}>ⓘ</span> Por que esta sugestão?
        </div>
        <div style={styles.explanationText}>
          {justificativaAgente || "Análise baseada em padrões de interação capturados passivamente pelo ProfileSense."}
        </div>
      </div>
      
      {temErrosFoneticos && agentePrincipal !== 'FocusAgent' && agentePrincipal !== 'ContextAgent' && (
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>📖 Erros detectados:</div>
          <div style={styles.errorList}>
            {errosFoneticos.slice(0, 5).map((erro, i) => (
              <div key={i} style={styles.errorItem}>
                <span style={styles.errorOriginal}>"{erro.original}"</span>
                <span> → </span>
                <span style={styles.errorCorrecao}>"{erro.correcao}"</span>
              </div>
            ))}
            {errosFoneticos.length > 5 && (
              <div style={styles.errorMore}>... e mais {errosFoneticos.length - 5} erros</div>
            )}
          </div>
        </div>
      )}
      
      <div style={styles.actions}>
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            style={styles.actionBtn}
          >
            <span>{action.icon}</span> {action.label}
          </button>
        ))}
        <button
          onClick={() => onAction('ignorar')}
          style={styles.ignoreBtn}
        >
          Ignorar
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  state: {
    fontSize: 14,
    marginBottom: 12,
    padding: 8,
    background: '#f9fafb',
    borderRadius: 8,
  },
  confidence: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scoreBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    fontSize: 12,
    marginBottom: 12,
    padding: 8,
    background: '#f3f4f6',
    borderRadius: 8,
  },
  errorBox: {
    background: '#fef9e8',
    border: '1px solid #fdba74',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#b45309',
    marginBottom: 8,
  },
  errorList: {
    fontSize: 12,
  },
  errorItem: {
    padding: '4px 0',
    fontFamily: 'monospace',
  },
  errorOriginal: {
    color: '#dc2626',
    textDecoration: 'line-through',
  },
  errorCorrecao: {
    color: '#10b981',
    fontWeight: 500,
  },
  errorMore: {
    marginTop: 4,
    color: '#666',
    fontSize: 11,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  ignoreBtn: {
    padding: '8px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    color: '#dc2626',
  },
  explanationBox: {
    background: 'rgba(43, 92, 230, 0.05)', // azul bem clarinho
    borderLeft: '3px solid #2b5ce6',
    padding: '10px',
    borderRadius: '4px 8px 8px 4px',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2b5ce6',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center'
  },
  explanationText: {
    fontSize: 12,
    color: '#4a4640',
    lineHeight: 1.4,
    fontStyle: 'italic'
  },
}