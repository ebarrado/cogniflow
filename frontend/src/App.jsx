import { useState, useEffect, useRef } from 'react'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import Editor from './surfaces/Editor'
import Inbox from './surfaces/Inbox'
import Tasks from './surfaces/Tasks'
import Examples from './surfaces/Examples'
import FeedbackToast from './components/FeedbackToast'
import QuickActions from './components/QuickActions'
import InsightsPanel from './components/InsightsPanel'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'

const BACKEND = 'http://localhost:3000/api'

export default function App() {
  const [surface, setSurface] = useState('editor')
  const [panelVisible, setPanelVisible] = useState(true)
  const [sessionTime, setSessionTime] = useState('00:00')
  const [events, setEvents] = useState(0)
  const [cosmosStatus, setCosmosStatus] = useState('verificando…')
  const [insight, setInsight] = useState(null)

  const [cognitive, setCognitive] = useState({})
  const [metrics, setMetrics] = useState({})
  const [mti, setMti] = useState(null)
  const [calmguard, setCalmguard] = useState(null)
  const [interpretacoes, setInterpretacoes] = useState([])
  const [historicoMTI, setHistoricoMTI] = useState([])
  const [rascunho, setRascunho] = useState('')
  const [isNewDocOpen, setIsNewDocOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [quickActionLoading, setQuickActionLoading] = useState(false)

  const startTime = useRef(Date.now())

  const { isSpeaking, speak, pause, resume, stop } = useSpeechSynthesis()

  // ⏱️ Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
      const mm = Math.floor(elapsed / 60).toString().padStart(2, '0')
      const ss = (elapsed % 60).toString().padStart(2, '0')
      setSessionTime(`${mm}:${ss}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 📡 Enviar métricas
  async function enviarMetricas(metricas) {
    try {
      const response = await fetch(`${BACKEND}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'user-001',
          tipo: metricas.tipo || 'metrica',
          ...metricas,
        }),
      })
      if (response.ok) {
        setEvents((e) => e + 1)
        setMetrics(metricas)
      }
    } catch (e) {
      console.error('❌ Erro crítico:', e)
    }
  }

  async function chamarBlendIt(classificacao, dados) {
    try {
      const res = await fetch(`http://localhost:3000/api/agents/blendit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classificacao,
          dados,
          tarefa: 'atividade atual',
          mensagem: 'contexto atual',
        }),
      })
      if (!res.ok) return
      const data = await res.json()
      setCognitive({
        carga: classificacao?.tipo || 'neutro',
        confianca: classificacao?.confianca || 0,
        agente: data?.prioridade || 'BlendIt',
        justificativa: data?.intervencao_final || '',
      })
      showToast(data?.intervencao_final, 'cognitive')
    } catch (e) {
      console.warn('BlendIt indisponível:', e)
    }
  }

  const showToast = (message, type = 'info') => {
    if (!message) return
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const playConfetti = () => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2b5ce6', '#1a7a4a', '#b45309', '#6d28d9'],
        })
      }).catch(() => {})
    }
  }

  const handleQuickAction = async (agent) => {
    setQuickActionLoading(true)
    showToast(`🔄 Chamando ${agent}...`, 'info')

    try {
      switch (agent) {
        case 'focus': {
          const res = await fetch(`http://localhost:3000/api/agents/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tarefa: 'tarefa atual', contexto: 'tecnologia' }),
          })
          if (res.ok) {
            const data = await res.json()
            showToast(`✨ ${data?.intervencao || 'Vamos organizar!'}`, 'success')
            setCognitive({
              carga: 'executivo',
              confianca: 0.75,
              agente: 'FocusAgent',
              justificativa: data?.intervencao || '',
            })
          }
          break
        }
        case 'context':
          showToast('🔍 Analisando contexto...', 'cognitive')
          setCognitive({
            carga: 'contextual',
            confianca: 0.85,
            agente: 'ContextAgent',
            justificativa: 'Analisando ambiguidades na comunicação',
          })
          break
        case 'phon':
          showToast('📖 Ajustando leitura...', 'info')
          setCognitive({
            carga: 'fonologico',
            confianca: 0.8,
            agente: 'PhonAgent',
            justificativa: 'Ajustando espaçamento e fonte',
          })
          break
        case 'pause':
          showToast('☕ Sugiro uma pausa de 2 minutos', 'warning')
          playConfetti()
          break
        default:
          showToast('🧠 Analisando padrões cognitivos...', 'cognitive')
      }
    } catch (error) {
      console.error('Erro na ação rápida:', error)
      showToast('❌ Erro ao processar ação', 'warning')
    } finally {
      setQuickActionLoading(false)
    }
  }

  useEffect(() => {
    const handleQuickActionEvent = (e) => handleQuickAction(e.detail)
    window.addEventListener('quickAction', handleQuickActionEvent)
    return () => window.removeEventListener('quickAction', handleQuickActionEvent)
  }, [])

  // ❤️ Health check backend
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BACKEND}/health`)
        const data = await res.json()
        if (data.database) {
          const mode = data.database.mode
          const connected = data.database.connected
          const totalDocs = (data.database.registros?.eventos || 0) + (data.database.registros?.insights || 0)
          if (mode === 'cosmos' && connected) {
            setCosmosStatus(`✅ Cosmos DB (${totalDocs.toLocaleString()} docs)`)
          } else if (mode === 'cosmos') {
            setCosmosStatus('⚠️ Cosmos DB (modo leitura)')
          } else {
            setCosmosStatus('📦 Modo Local (in-memory)')
          }
        } else {
          setCosmosStatus(data.cosmos === 'connected' ? '✅ Cosmos DB' : '📦 Modo Local')
        }
      } catch {
        setCosmosStatus('❌ Offline')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // 📂 Abrir exemplo no editor
  const openExampleInEditor = (doc) => {
    localStorage.setItem('cogniflow_open_doc', JSON.stringify({ titulo: doc.titulo, conteudo: doc.conteudo }))
    setSurface('editor')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cogniflow:open-example', { detail: { titulo: doc.titulo, conteudo: doc.conteudo } }))
    }, 50)
  }

  // 📦 Props globais
  const surfaceProps = {
    panelVisible,
    onEvent: () => setEvents((e) => e + 1),
    enviarMetricas,
    insight,
    setInsight,
    cognitive,
    setCognitive,
    showToast,
    setMetrics,
    setMti,
    setCalmguard,
    setInterpretacoes,
    isNewDocOpen,
    setIsNewDocOpen,
    isSpeaking,
    speak,
    pause,
    resume,
    stop,
    rascunho,
    setRascunho,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      <Topbar
        surface={surface}
        onOpenNewDocument={() => setIsNewDocOpen(true)}
        onTogglePanel={() => setPanelVisible((v) => !v)}
        isSpeaking={isSpeaking}
        onStopSpeech={stop}
        cognitive={cognitive}
      />

      {toast && (
        <FeedbackToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <QuickActions
        onAction={handleQuickAction}
        cognitive={cognitive}
        loading={quickActionLoading}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar surface={surface} onSwitch={setSurface} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {surface === 'editor' && <Editor {...surfaceProps} />}
          {surface === 'inbox' && <Inbox {...surfaceProps} />}
          {surface === 'tasks' && <Tasks {...surfaceProps} />}
          {surface === 'examples' && <Examples onOpenEditorExample={openExampleInEditor} />}
        </main>

        <InsightsPanel
          visible={panelVisible}
          metrics={metrics}
          cognitive={cognitive}
          mti={mti}
          calmguard={calmguard}
          interpretacoes={interpretacoes}
          onInterpSelect={setRascunho}
          historicoMTI={historicoMTI}
        />
      </div>

      <StatusBar
        surface={surface}
        sessionTime={sessionTime}
        events={events}
        cosmosStatus={cosmosStatus}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}