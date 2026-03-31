const examples = [
  { title: 'Planejamento de aula', description: 'Abrir um modelo de planejamento simples.' },
  { title: 'Resumo simples', description: 'Abrir um documento enxuto e objetivo.' },
  { title: 'Checklist de tarefa', description: 'Abrir um checklist para execução passo a passo.' },
]

export default function NewDocumentModal({ open, onClose, onCreate }) {
  if (!open) return null

  function handleAction(payload) {
    onCreate?.(payload)
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Novo documento</h2>
            <p style={styles.subtitle}>
              Escolha como deseja começar ou aplique uma ação inteligente no conteúdo atual.
            </p>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.sectionTitle}>Criar</div>
        <div style={styles.grid}>
          <button style={styles.card} onClick={() => handleAction({ acao: 'blank' })}>
            <div style={styles.icon}>📄</div>
            <div style={styles.cardTitle}>Documento em branco</div>
            <div style={styles.cardText}>Criar um novo documento vazio.</div>
          </button>

          <button style={styles.card} onClick={() => handleAction({ acao: 'voice' })}>
            <div style={styles.icon}>🔊</div>
            <div style={styles.cardTitle}>Leitura por voz</div>
            <div style={styles.cardText}>Ler o conteúdo atual em voz alta.</div>
          </button>

          <button style={styles.card} onClick={() => handleAction({ acao: 'summary' })}>
            <div style={styles.icon}>✨</div>
            <div style={styles.cardTitle}>Resumo / simplificação</div>
            <div style={styles.cardText}>Gerar uma versão mais simples e direta.</div>
          </button>

          <button style={styles.card} onClick={() => handleAction({ acao: 'steps' })}>
            <div style={styles.icon}>🧩</div>
            <div style={styles.cardTitle}>Transformar em passos</div>
            <div style={styles.cardText}>Quebrar o texto em microtarefas.</div>
          </button>

          <button style={styles.card} onClick={() => handleAction({ acao: 'tone' })}>
            <div style={styles.icon}>🛡</div>
            <div style={styles.cardTitle}>Validar tom</div>
            <div style={styles.cardText}>Ajustar acolhimento e clareza do texto.</div>
          </button>
        </div>

        <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Exemplos</div>
        <div style={styles.examplesGrid}>
          {examples.map((item, index) => (
            <button
              key={item.title}
              style={styles.exampleCard}
              onClick={() => handleAction({ acao: 'example', exampleIndex: index })}
            >
              <div style={styles.exampleTitle}>{item.title}</div>
              <div style={styles.exampleText}>{item.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 820,
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 20px 60px rgba(0,0,0,.18)',
    padding: 22,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.6,
  },
  closeButton: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  card: {
    textAlign: 'left',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    background: '#f9fafb',
    cursor: 'pointer',
  },
  icon: {
    fontSize: 26,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  examplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  },
  exampleCard: {
    textAlign: 'left',
    border: '1px solid #dbe4ff',
    background: '#f8fbff',
    borderRadius: 14,
    padding: 14,
    cursor: 'pointer',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.5,
  },
}