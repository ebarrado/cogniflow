import { useState, useRef, useEffect } from 'react'

const BACKEND = 'http://localhost:3000'

const EMAILS = [
  { id:'vp',      de:'Rafael V. (VP Produto)', email:'rafael.v@empresa.com',  avatar:'RV', cor:'#6d28d9', assunto:'Roadmap — conversa rápida',          corpo:'Preciso conversar sobre o roadmap. Você tem 15 minutos hoje?',                                  hora:'14:32', lido:false },
  { id:'sprint',  de:'Maria C. (Tech Lead)',   email:'maria.c@empresa.com',   avatar:'MC', cor:'#1a7a4a', assunto:'Sprint review — precisamos alinhar', corpo:'Alguns pontos do sprint ficaram em aberto. Consegue olhar antes da reunião de amanhã?',       hora:'11:18', lido:false },
  { id:'onboard', de:'Lucas S. (RH)',          email:'lucas.s@empresa.com',   avatar:'LS', cor:'#b45309', assunto:'Onboarding — semana que vem',        corpo:'O João começa semana que vem. Você toparia participar de uma sessão de boas-vindas na terça?', hora:'09:05', lido:true  },
  { id:'pr47',    de:'Thiago N. (Eng)',        email:'thiago.n@empresa.com',  avatar:'TN', cor:'#2b5ce6', assunto:'PR #47 aprovada ✓',                  corpo:'Merge feito. Deploy em staging concluído com sucesso.',                                       hora:'Ter',   lido:true  },
]

// ---------------------------------------------------------------------------
// Extrai campos relevantes do JSON retornado pelo backend.
// Prioridade do rascunho: resposta_segura_sugerida (já validada pelo CalmGuard)
// ---------------------------------------------------------------------------
function extrairDados(data) {
  if (!data) return { interpretacoes: [], recomendacao: '', calmguard: null, rascunhoSugerido: '', justificativa: '' }

  const fonte = data.resultado || data.analise || data.data || data

  const interpretacoes = Array.isArray(fonte.interpretacoes) ? fonte.interpretacoes : []

  const respostaSegura = fonte.resposta_segura_sugerida || ''

  const melhorInterp = interpretacoes.reduce(
    (best, cur) => (cur.probabilidade > (best?.probabilidade ?? 0) ? cur : best),
    null
  )

  const rascunhoSugerido = respostaSegura || melhorInterp?.resposta_sugerida || ''

  const recomendacao = fonte.resumo_claro || fonte.recomendacao || ''

  const nivelAmb = fonte.nivel_ambiguidade  ? `Ambiguidade ${fonte.nivel_ambiguidade}` : ''
  const risco    = fonte.risco_de_mal_entendido ? `· risco ${fonte.risco_de_mal_entendido}` : ''
  const prazo    = fonte.expectativas_estruturadas?.prazo && fonte.expectativas_estruturadas.prazo !== 'Não declarado'
    ? `· prazo: ${fonte.expectativas_estruturadas.prazo}`
    : ''
  const acao     = fonte.expectativas_estruturadas?.acao_esperada
    ? `· ${fonte.expectativas_estruturadas.acao_esperada}`
    : ''

  const justificativa = [nivelAmb, risco, prazo, acao]
    .filter(Boolean)
    .join(' ') || recomendacao || 'Análise concluída.'

  const calmguard = data.calmguard || fonte.calmguard || null

  return { interpretacoes, recomendacao, calmguard, rascunhoSugerido, justificativa }
}

// ---------------------------------------------------------------------------
// Fallback local contextual — espelha a lógica do contextAgent.js no servidor
// ---------------------------------------------------------------------------
function buildFallback(emailId, remetente) {
  const isVP  = /VP|diretor|CEO/i.test(remetente)
  const isRH  = /RH|recursos humanos/i.test(remetente)
  const isEng = /eng|dev|tech|lead/i.test(remetente)

  if (isVP || emailId === 'vp') return {
    nivel_ambiguidade: 'alto',
    risco_de_mal_entendido: 'medio',
    resumo_claro: 'Pedido de VP com urgência implícita. Confirmar disponibilidade com horário é o caminho seguro.',
    expectativas_estruturadas: { acao_esperada: 'Confirmar disponibilidade com horário', prazo: 'Hoje', prioridade: 'alta' },
    interpretacoes: [
      { probabilidade: 55, titulo: 'Alinhamento estratégico', descricao: 'Quer alinhar direção ou prioridades antes de uma decisão.', resposta_sugerida: 'Claro, tenho disponibilidade. Qual horário funciona melhor para você hoje?' },
      { probabilidade: 30, titulo: 'Validação de entrega', descricao: 'Pode querer confirmar se algo no roadmap está no prazo.', resposta_sugerida: 'Posso sim. Prefere às 15h ou 16h? Posso me preparar com os dados do roadmap.' },
      { probabilidade: 15, titulo: 'Feedback informal', descricao: 'Uma conversa para compartilhar impressões ou reconhecer algo.', resposta_sugerida: 'Com prazer! Pode me confirmar o horário e se preciso levar alguma informação?' },
    ],
    resposta_segura_sugerida: 'Claro, posso conversar! Qual horário fica melhor para você hoje?',
  }

  if (isRH || emailId === 'onboard') return {
    nivel_ambiguidade: 'baixo',
    risco_de_mal_entendido: 'baixo',
    resumo_claro: 'Convite amigável e opcional para sessão de boas-vindas.',
    expectativas_estruturadas: { acao_esperada: 'Confirmar participação e horário', prazo: 'Antes da terça-feira', prioridade: 'baixa' },
    interpretacoes: [
      { probabilidade: 75, titulo: 'Convite de integração', descricao: 'Pedido direto e gentil de participação na recepção do novo colaborador.', resposta_sugerida: 'Com prazer! Posso participar na terça. Pode me confirmar o horário da sessão?' },
      { probabilidade: 25, titulo: 'Convite flexível', descricao: 'A palavra "toparia" indica que recusar é completamente aceitável.', resposta_sugerida: 'Adoraria participar, mas minha agenda na terça está bem cheia. Há outro horário possível?' },
    ],
    resposta_segura_sugerida: 'Com prazer! Estarei disponível na terça. Pode confirmar o horário da sessão?',
  }

  if (isEng || emailId === 'pr47') return {
    nivel_ambiguidade: 'baixo',
    risco_de_mal_entendido: 'baixo',
    resumo_claro: 'Atualização técnica direta sobre conclusão de PR e deploy em staging.',
    expectativas_estruturadas: { acao_esperada: 'Reconhecer a atualização', prazo: 'Não declarado', prioridade: 'baixa' },
    interpretacoes: [
      { probabilidade: 80, titulo: 'Update de status', descricao: 'Comunicação de rotina informando conclusão de etapa técnica.', resposta_sugerida: 'Recebido! Vou verificar o ambiente de staging em seguida.' },
      { probabilidade: 20, titulo: 'Solicitação implícita de revisão', descricao: 'Pode esperar que alguém valide o comportamento em staging.', resposta_sugerida: 'Ótimo! Vou dar uma olhada no staging hoje e retorno se encontrar algo.' },
    ],
    resposta_segura_sugerida: 'Recebido! Obrigado pela atualização. Vou verificar o staging em seguida.',
  }

  if (emailId === 'sprint') return {
    nivel_ambiguidade: 'medio',
    risco_de_mal_entendido: 'baixo',
    resumo_claro: 'Pedido de revisão de pontos abertos antes de uma reunião amanhã.',
    expectativas_estruturadas: { acao_esperada: 'Revisar pontos abertos antes da reunião', prazo: 'Antes da reunião de amanhã', prioridade: 'media' },
    interpretacoes: [
      { probabilidade: 60, titulo: 'Pontos em aberto', descricao: 'Há itens do sprint que precisam de revisão antes da reunião.', resposta_sugerida: 'Claro, consigo olhar hoje. Quais pontos são mais importantes?' },
      { probabilidade: 40, titulo: 'Alinhamento preventivo', descricao: 'Quer garantir que a reunião de amanhã flua bem sem surpresas.', resposta_sugerida: 'Vou revisar os itens abertos antes da reunião de amanhã.' },
    ],
    resposta_segura_sugerida: 'Pode contar comigo. Vou revisar os pontos hoje e deixo tudo alinhado para amanhã.',
  }

  return {
    nivel_ambiguidade: 'medio',
    risco_de_mal_entendido: 'medio',
    resumo_claro: 'Mensagem com expectativa de resposta. Ação esperada não está totalmente explícita.',
    expectativas_estruturadas: { acao_esperada: 'Confirmar entendimento', prazo: 'Em breve', prioridade: 'media' },
    interpretacoes: [
      { probabilidade: 60, titulo: 'Pedido de alinhamento', descricao: 'A pessoa quer confirmação de entendimento antes de prosseguir.', resposta_sugerida: 'Entendido! Pode me confirmar o que você precisa e qual o prazo ideal?' },
      { probabilidade: 40, titulo: 'Solicitação indireta', descricao: 'Pode haver uma expectativa de ação não dita de forma direta.', resposta_sugerida: 'Claro, posso ajudar. Qual o formato de entrega e quando você precisa?' },
    ],
    resposta_segura_sugerida: 'Entendido! Para te responder com precisão, pode me confirmar a ação esperada e o prazo ideal?',
  }
}

// ---------------------------------------------------------------------------
// Componente: rascunho editável
// ---------------------------------------------------------------------------
function RascunhoResposta({ texto, justificativa, onChange, onEnviar, onDescartar, enviado }) {
  if (!texto && !enviado) return null

  if (enviado) return (
    <div style={{ margin: '12px 24px 16px', padding: '10px 16px', background: 'var(--green-s)', border: '1px solid rgba(26,122,74,.2)', borderRadius: 8, fontSize: '.82rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      ✓ Resposta enviada — bom trabalho.
    </div>
  )

  return (
    <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
      <div style={{ fontSize: '.7rem', fontFamily: 'var(--mono)', color: '#6d28d9', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>◈</span> Rascunho sugerido pelo ContextAgent — edite como quiser
      </div>

      {justificativa && (
        <div style={{
          fontSize: '.74rem', color: 'var(--ink3)', marginBottom: 8,
          padding: '5px 10px', background: 'var(--bg2)', borderRadius: 5,
          borderLeft: '2px solid var(--accent)', lineHeight: 1.55,
        }}>
          💡 {justificativa}
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid rgba(109,40,217,.3)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(26,24,20,.06)' }}>
        <textarea
          value={texto}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', minHeight: 80, padding: '12px 14px', fontFamily: 'var(--sans)', fontSize: '.88rem', lineHeight: 1.7, color: 'var(--ink)', border: 'none', outline: 'none', resize: 'none', background: 'transparent', caretColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <button onClick={onEnviar} style={{ padding: '5px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer' }}>↩ Enviar resposta</button>
          <button onClick={onDescartar} style={{ padding: '5px 12px', background: 'transparent', color: 'var(--ink3)', border: 'none', fontSize: '.75rem', cursor: 'pointer' }}>Descartar</button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function Inbox({
  setCognitive,
  setInterpretacoes,
  setCalmguard,
  showToast,
  // ← prop vinda do App, atualizada pelo InsightsPanel ao clicar numa interpretação
  rascunho: rascunhoProp,
  setRascunho: setRascunhoGlobal,
}) {
  const [emails, setEmails]             = useState(EMAILS)
  const [emailAtivo, setEmailAtivo]     = useState(null)
  const [loading, setLoading]           = useState(false)
  const [analiseDone, setAnaliseDone]   = useState(false)
  const [hesitacao, setHesitacao]       = useState(false)
  const [rascunho, setRascunhoLocal]    = useState('')
  const [rascunhoJust, setRascunhoJust] = useState('')
  const [enviado, setEnviado]           = useState(false)
  const [filtro, setFiltro]             = useState('Todos')
  const hesTimer                        = useRef(null)
  // Guarda o último valor definido internamente para não re-sincronizar o próprio eco
  const rascunhoInterno                 = useRef('')

  const emailAtual      = emails.find(e => e.id === emailAtivo)
  const naoLidas        = emails.filter(e => !e.lido).length
  const emailsFiltrados = filtro === 'Não lidos' ? emails.filter(e => !e.lido) : emails

  // ─── Sincroniza quando o InsightsPanel clica numa interpretação ────────────
  // rascunhoProp muda → InsightsPanel selecionou uma resposta → preenche editor
  useEffect(() => {
    if (!rascunhoProp || !emailAtivo) return
    if (rascunhoProp === rascunhoInterno.current) return // eco do próprio set
    setRascunhoLocal(rascunhoProp)
    setEnviado(false)
    setRascunhoJust('') // justificativa fica no painel ao clicar via lateral
  }, [rascunhoProp, emailAtivo])

  const limparPainel = () => {
    setCognitive?.({})
    setInterpretacoes?.([])
    setCalmguard?.(null)
    setRascunhoJust('')
  }

  const abrirEmail = (id) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, lido: true } : e))
    setEmailAtivo(id)
    setHesitacao(false)
    setRascunhoLocal('')
    rascunhoInterno.current = ''
    setRascunhoGlobal?.('')
    setEnviado(false)
    setAnaliseDone(false)
    clearTimeout(hesTimer.current)
    limparPainel()

    if (id === 'vp') {
      hesTimer.current = setTimeout(() => setHesitacao(true), 3000)
    }
  }

  // ─── Chama o backend (/context → contextAgent.analisar → CalmGuard) ────────
  const chamarContextAgent = async () => {
    if (!emailAtual || loading) return
    setLoading(true)
    setAnaliseDone(false)

    try {
      const res = await fetch(`${BACKEND}/api/agents/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem:             emailAtual.corpo || '',
          remetente:            emailAtual.de   || 'colega',
          contextoProfissional: 'empresa de tecnologia',
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      console.log('🔍 ContextAgent response:', JSON.stringify(raw, null, 2))

      const { interpretacoes, recomendacao, calmguard, rascunhoSugerido, justificativa } = extrairDados(raw)

      setCognitive?.({
        carga:         'contextual',
        confianca:     0.88,
        agente:        'ContextAgent',
        justificativa: justificativa || recomendacao || 'Análise concluída.',
      })
      setInterpretacoes?.(interpretacoes)
      if (calmguard) setCalmguard?.(calmguard)

      if (rascunhoSugerido) {
        rascunhoInterno.current = rascunhoSugerido
        setRascunhoLocal(rascunhoSugerido)
        setRascunhoGlobal?.(rascunhoSugerido)
        setRascunhoJust(justificativa)
        setEnviado(false)
      }

      setAnaliseDone(true)
      setHesitacao(false)
      showToast?.('◈ ContextAgent — interpretações no painel lateral', 'cognitive')

    } catch (err) {
      console.warn('⚠️ Backend offline:', err.message)

      const fallback = buildFallback(emailAtivo, emailAtual?.de || '')
      const { interpretacoes, rascunhoSugerido, justificativa } = extrairDados(fallback)

      setCognitive?.({
        carga:         'contextual',
        confianca:     0.72,
        agente:        'ContextAgent (offline)',
        justificativa: justificativa || fallback.resumo_claro || 'Análise local aplicada.',
      })
      setInterpretacoes?.(interpretacoes)
      setCalmguard?.({
        aprovado:          true,
        nivel_acolhimento: 'alto',
        texto_original:    fallback.resposta_segura_sugerida,
        texto_validado:    fallback.resposta_segura_sugerida,
      })

      if (rascunhoSugerido) {
        rascunhoInterno.current = rascunhoSugerido
        setRascunhoLocal(rascunhoSugerido)
        setRascunhoGlobal?.(rascunhoSugerido)
        setRascunhoJust(justificativa)
        setEnviado(false)
      }

      setAnaliseDone(true)
      setHesitacao(false)
      showToast?.('◈ ContextAgent offline — análise local aplicada', 'warning')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{ height: 40, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6, flexShrink: 0 }}>
        {['↩', '↪', '📁', '🗑'].map(icon => (
          <button key={icon}
            style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: 'var(--ink2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >{icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        {naoLidas > 0 && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--amber)', padding: '2px 8px', background: 'var(--amber-s)', borderRadius: 10 }}>
            {naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}
          </span>
        )}
        <button onClick={chamarContextAgent} disabled={!emailAtivo || loading}
          style={{ padding: '5px 12px', background: !emailAtivo ? 'var(--bg3)' : '#6d28d9', color: !emailAtivo ? 'var(--ink3)' : '#fff', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: !emailAtivo ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all .15s' }}>
          {loading ? '⏳' : '◈'} Analisar contexto
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ height: 38, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', padding: '0 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 32, borderRadius: '6px 6px 0 0', border: '1px solid var(--border)', borderBottom: 'none', background: 'var(--surface)', fontSize: '.77rem', color: 'var(--ink)', fontWeight: 500, position: 'relative', bottom: -1 }}>
          <span style={{ fontSize: 11 }}>✉</span> Inbox
          {naoLidas > 0 && <span style={{ background: 'var(--accent)', color: 'white', fontSize: 8, fontFamily: 'var(--mono)', padding: '1px 5px', borderRadius: 10, fontWeight: 600 }}>{naoLidas}</span>}
          <span style={{ fontSize: 10, opacity: .4, marginLeft: 2 }}>×</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Lista */}
        <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            {['Todos', 'Não lidos'].map(f => (
              <div key={f} onClick={() => setFiltro(f)}
                style={{ padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 500, cursor: 'pointer', color: filtro === f ? 'var(--accent)' : 'var(--ink3)', background: filtro === f ? 'var(--accent-s)' : 'transparent', border: `1px solid ${filtro === f ? 'rgba(43,92,230,.2)' : 'var(--border)'}`, transition: 'all .12s' }}>
                {f}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {emailsFiltrados.map(e => (
              <div key={e.id} onClick={() => abrirEmail(e.id)}
                style={{ padding: '12px 16px', borderBottom: '1px solid rgba(216,212,204,.5)', cursor: 'pointer', background: emailAtivo === e.id ? 'var(--accent-s)' : 'transparent', position: 'relative', transition: 'background .12s' }}
                onMouseEnter={ev => { if (emailAtivo !== e.id) ev.currentTarget.style.background = 'var(--bg)' }}
                onMouseLeave={ev => { if (emailAtivo !== e.id) ev.currentTarget.style.background = 'transparent' }}
              >
                {!e.lido && <div style={{ position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'white', flexShrink: 0 }}>{e.avatar}</div>
                  <span style={{ fontSize: '.78rem', fontWeight: e.lido ? 400 : 600, flex: 1, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.de}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink3)', flexShrink: 0 }}>{e.hora}</span>
                </div>
                <div style={{ fontSize: '.76rem', fontWeight: e.lido ? 400 : 600, color: e.lido ? 'var(--ink2)' : 'var(--ink)', marginBottom: 2, paddingLeft: 36 }}>{e.assunto}</div>
                <div style={{ fontSize: '.73rem', color: 'var(--ink3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: 36 }}>{e.corpo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leitura */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
          {!emailAtual ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)', gap: 10 }}>
              <div style={{ fontSize: '2.5rem', opacity: .2 }}>✉</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.78rem' }}>Selecione uma mensagem</div>
              <div style={{ fontSize: '.72rem', opacity: .6, textAlign: 'center', maxWidth: 220, lineHeight: 1.6 }}>
                Use "Analisar contexto" para ver interpretações no painel lateral
              </div>
            </div>
          ) : (
            <>
              {hesitacao && (
                <div style={{ padding: '8px 24px', background: 'var(--amber-s)', borderBottom: '1px solid rgba(180,83,9,.15)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '.75rem', color: 'var(--amber)', fontWeight: 500, flexShrink: 0 }}>
                  <span>⏸</span>
                  <span>Hesitação detectada — clique para ver as interpretações</span>
                  <button onClick={chamarContextAgent} style={{ marginLeft: 'auto', padding: '3px 10px', background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 5, fontSize: '.72rem', cursor: 'pointer', fontWeight: 500 }}>Analisar agora</button>
                </div>
              )}

              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 14, lineHeight: 1.3 }}>{emailAtual.assunto}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: emailAtual.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', flexShrink: 0 }}>{emailAtual.avatar}</div>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>{emailAtual.de}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '.68rem', color: 'var(--ink3)' }}>{emailAtual.email}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {analiseDone && !loading && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'var(--green-s)', border: '1px solid rgba(26,122,74,.2)', fontSize: '.7rem', fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                        ✓ Ver painel →
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--ink3)' }}>Hoje, {emailAtual.hora}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                  <button onClick={chamarContextAgent} disabled={loading}
                    style={{ padding: '6px 14px', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'var(--bg3)' : '#6d28d9', color: loading ? 'var(--ink3)' : 'white', border: 'none', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {loading
                      ? <><span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #999', borderTopColor: 'transparent', animation: 'spin .6s linear infinite', display: 'inline-block' }} /> Analisando…</>
                      : <>◈ Analisar com ContextAgent</>
                    }
                  </button>
                  <button style={{ padding: '6px 12px', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--border)' }}>↩ Responder</button>
                  <button style={{ padding: '6px 12px', borderRadius: 6, fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--border)' }}>📁 Arquivar</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 16px', fontSize: '.92rem', lineHeight: 1.85, color: 'var(--ink2)' }}>
                {emailAtual.corpo}
              </div>

              <RascunhoResposta
                texto={rascunho}
                justificativa={rascunhoJust}
                onChange={setRascunhoLocal}
                onEnviar={() => {
                  setEnviado(true)
                  setRascunhoLocal('')
                  setRascunhoGlobal?.('')
                  rascunhoInterno.current = ''
                  setRascunhoJust('')
                }}
                onDescartar={() => {
                  setRascunhoLocal('')
                  setRascunhoGlobal?.('')
                  rascunhoInterno.current = ''
                  setRascunhoJust('')
                }}
                enviado={enviado}
              />
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}