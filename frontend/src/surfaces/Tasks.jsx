import React, { useState } from 'react'
import DemoSimulator from '../components/DemoSimulator'

export default function Tasks({ showToast }) {
  const [tarefas, setTarefas] = useState([
    { id: 1, texto: 'Revisar documento de arquitetura', concluida: false, prioridade: 'alta' },
    { id: 2, texto: 'Responder e-mails pendentes', concluida: false, prioridade: 'media' },
    { id: 3, texto: 'Organizar backlog do sprint', concluida: false, prioridade: 'alta' },
    { id: 4, texto: 'Preparar apresentação para reunião', concluida: false, prioridade: 'media' },
    { id: 5, texto: 'Testar integração com backend', concluida: true, prioridade: 'baixa' },
  ])

  const [novaTarefa, setNovaTarefa] = useState('')
  const [filtro, setFiltro] = useState('todas')

  const toggleTarefa = (id) => {
    setTarefas(prev =>
      prev.map(t =>
        t.id === id ? { ...t, concluida: !t.concluida } : t
      )
    )
    showToast?.('✅ Tarefa atualizada!', 'success')
  }

  const adicionarTarefa = () => {
    if (!novaTarefa.trim()) return

    const nova = {
      id: Date.now(),
      texto: novaTarefa,
      concluida: false,
      prioridade: 'media'
    }

    setTarefas(prev => [nova, ...prev])
    setNovaTarefa('')
    showToast?.('📋 Tarefa adicionada!', 'success')
  }

  const excluirConcluidas = () => {
    setTarefas(prev => prev.filter(t => !t.concluida))
    showToast?.('🗑️ Tarefas concluídas removidas!', 'info')
  }

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtro === 'ativas') return !t.concluida
    if (filtro === 'concluidas') return t.concluida
    return true
  })

  const total = tarefas.length
  const concluidas = tarefas.filter(t => t.concluida).length
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

  const getPrioridadeCor = (prioridade) => {
    switch (prioridade) {
      case 'alta':
        return { bg: '#fee2e2', color: '#dc2626' }
      case 'media':
        return { bg: '#fef3c7', color: '#d97706' }
      default:
        return { bg: '#e0e7ff', color: '#4f46e5' }
    }
  }

  return (
    <div style={styles.page}>
      {/* 🧠 Demo CogniFlow */}
      <div style={styles.demoSection}>
        <DemoSimulator />
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>📋 Tarefas</h2>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${percentual}%` }} />
          </div>
          <span style={styles.progressText}>
            {concluidas}/{total} concluídas ({percentual}%)
          </span>
        </div>
      </div>

      {/* Nova tarefa */}
      <div style={styles.addTask}>
        <input
          type="text"
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionarTarefa()}
          placeholder="Adicionar nova tarefa..."
          style={styles.input}
        />
        <button onClick={adicionarTarefa} style={styles.addButton}>
          ➕ Adicionar
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <button
          onClick={() => setFiltro('todas')}
          style={{ ...styles.filterBtn, ...(filtro === 'todas' && styles.filterActive) }}
        >
          Todas ({total})
        </button>

        <button
          onClick={() => setFiltro('ativas')}
          style={{ ...styles.filterBtn, ...(filtro === 'ativas' && styles.filterActive) }}
        >
          Ativas ({total - concluidas})
        </button>

        <button
          onClick={() => setFiltro('concluidas')}
          style={{ ...styles.filterBtn, ...(filtro === 'concluidas' && styles.filterActive) }}
        >
          Concluídas ({concluidas})
        </button>

        {concluidas > 0 && (
          <button onClick={excluirConcluidas} style={styles.clearButton}>
            Limpar concluídas
          </button>
        )}
      </div>

      {/* Lista de tarefas */}
      <div style={styles.taskList}>
        {tarefasFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✅</span>
            <p>Nenhuma tarefa encontrada!</p>
          </div>
        ) : (
          tarefasFiltradas.map(tarefa => (
            <div
              key={tarefa.id}
              style={{ ...styles.task, ...(tarefa.concluida && styles.taskConcluida) }}
              onClick={() => toggleTarefa(tarefa.id)}
            >
              <div style={styles.taskCheck}>
                <div style={{ ...styles.checkbox, ...(tarefa.concluida && styles.checkboxChecked) }}>
                  {tarefa.concluida && '✓'}
                </div>
              </div>

              <div style={styles.taskContent}>
                <span style={{ ...styles.taskText, ...(tarefa.concluida && styles.taskTextConcluida) }}>
                  {tarefa.texto}
                </span>

                <span style={{ ...styles.prioridade, ...getPrioridadeCor(tarefa.prioridade) }}>
                  {tarefa.prioridade}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sugestão do FocusAgent */}
      {total - concluidas > 3 && (
        <div style={styles.suggestionCard}>
          <div style={styles.suggestionIcon}>⚡</div>
          <div style={styles.suggestionContent}>
            <strong>FocusAgent sugeriu:</strong>
            <p>
              Você tem {total - concluidas} tarefas pendentes. Que tal usar o FocusAgent
              para quebrar a maior em passos menores?
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('quickAction', { detail: 'focus' }))}
              style={styles.suggestionButton}
            >
              Usar FocusAgent
            </button>
          </div>
        </div>
      )}
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
  demoSection: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: 24,
    color: 'var(--ink)',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    background: 'var(--border)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--green)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 12,
    color: 'var(--ink3)',
    fontFamily: 'monospace',
  },
  addTask: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 220,
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--surface)',
    color: 'var(--ink)',
  },
  addButton: {
    padding: '10px 20px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  filters: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '6px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--ink2)',
  },
  filterActive: {
    background: 'var(--accent-s)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  clearButton: {
    padding: '6px 12px',
    background: 'var(--red-s)',
    border: '1px solid var(--red)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--red)',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  task: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px',
    background: 'var(--surface)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  taskConcluida: {
    opacity: 0.6,
  },
  taskCheck: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    border: '2px solid var(--border)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: 'white',
  },
  checkboxChecked: {
    background: 'var(--green)',
    borderColor: 'var(--green)',
  },
  taskContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskText: {
    fontSize: 14,
    color: 'var(--ink)',
  },
  taskTextConcluida: {
    textDecoration: 'line-through',
    color: 'var(--ink3)',
  },
  prioridade: {
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--ink3)',
  },
  emptyIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 12,
  },
  suggestionCard: {
    display: 'flex',
    gap: 12,
    padding: '16px',
    background: 'var(--accent-s)',
    borderRadius: 12,
    border: '1px solid rgba(43,92,230,.2)',
    marginTop: 20,
  },
  suggestionIcon: {
    fontSize: 24,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionButton: {
    marginTop: 8,
    padding: '6px 12px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
  },
}