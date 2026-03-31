const EXAMPLE_DOCS = [
  {
    titulo: '📚 Planejamento de aula',
    resumo: 'Modelo completo para estruturar aulas com objetivos, etapas e materiais.',
    conteudo: `# Planejamento de Aula - React Hooks

## Objetivo
Ensinar os conceitos fundamentais do React Hooks.

## Etapas
1. Introdução com exemplo prático
2. Explicação do useState
3. Demonstração do useEffect
4. Atividade em dupla
5. Fechamento com revisão

## Materiais
- VS Code
- Repositório base
- Slides de apoio`
  },
  {
    titulo: '✅ Checklist de tarefa',
    resumo: 'Estrutura passo a passo para dividir atividades complexas.',
    conteudo: `# Checklist: Desenvolvimento de Feature

## Preparação
- [ ] Revisar requisitos
- [ ] Validar APIs
- [ ] Criar branch

## Desenvolvimento
- [ ] Implementar endpoint
- [ ] Criar componentes
- [ ] Adicionar testes

## Entrega
- [ ] Code review
- [ ] Deploy staging
- [ ] Validação`
  },
  {
    titulo: '📄 Resumo técnico',
    resumo: 'Template para documentar decisões técnicas e arquitetura.',
    conteudo: `# Resumo Técnico: [Projeto]

## Contexto
Descrição do problema e necessidade.

## Decisão
Explicação da escolha técnica.

## Impacto
Benefícios e trade-offs.

## Próximos passos
Ações planejadas.`
  },
  {
    titulo: '🎯 Template reunião',
    resumo: 'Estrutura otimizada para reuniões de até 15 minutos.',
    conteudo: `# Daily Meeting - [Data]

## O que fiz ontem?
- 

## O que farei hoje?
- 

## Bloqueios?
- 

## Ações
- `
  }
]

export default function Examples({ onOpenEditorExample }) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>📁 Exemplos de Documentos</h2>
        <p style={styles.subtitle}>
          Modelos prontos para você usar. Clique em "Abrir" para começar a editar.
        </p>
      </div>

      <div style={styles.grid}>
        {EXAMPLE_DOCS.map((doc) => (
          <div key={doc.titulo} style={styles.card}>
            <div style={styles.cardIcon}>📄</div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{doc.titulo}</h3>
              <p style={styles.cardText}>{doc.resumo}</p>
              <button
                style={styles.button}
                onClick={() => onOpenEditorExample?.(doc)}
              >
                Abrir no editor →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.tipCard}>
        <span style={styles.tipIcon}>💡</span>
        <div>
          <strong>Dica:</strong> Use o FocusAgent para quebrar qualquer documento em tarefas menores!
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    flex: 1,
    padding: 24,
    background: 'var(--bg)',
    overflow: 'auto',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 24,
    color: 'var(--ink)',
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: 'var(--ink3)',
  },
  grid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    marginBottom: 24,
  },
  card: {
    display: 'flex',
    gap: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    transition: 'all 0.2s',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--ink)',
  },
  cardText: {
    margin: '0 0 12px 0',
    fontSize: 13,
    color: 'var(--ink2)',
    lineHeight: 1.5,
  },
  button: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--accent)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    color: 'var(--accent)',
    transition: 'all 0.2s',
  },
  tipCard: {
    display: 'flex',
    gap: 12,
    padding: '16px',
    background: 'var(--accent-s)',
    borderRadius: 12,
    border: '1px solid rgba(43,92,230,.2)',
    fontSize: 13,
    color: 'var(--accent)',
  },
  tipIcon: {
    fontSize: 20,
  },
}