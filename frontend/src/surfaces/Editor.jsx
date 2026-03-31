// surfaces/Editor.jsx - Versão SIMPLIFICADA e FUNCIONAL
import React, { useEffect, useMemo, useRef, useState } from 'react'
import CognitiveInterventionCard from '../components/CognitiveInterventionCard'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const documentosBase = [
  {
    id: 1,
    nome: 'Planejamento de Aula',
    icone: '📘',
    conteudo: `# Planejamento de Aula\n\n## Objetivo\nDefinir atividades da semana.\n\n## Etapas\n- Introdução\n- Demonstração\n- Prática guiada\n- Encerramento`,
  },
  {
    id: 2,
    nome: 'Checklist - Desenvolvimento',
    icone: '✅',
    conteudo: `- [ ] Criar branch\n- [ ] Implementar endpoint\n- [ ] Criar componentes\n- [ ] Adicionar testes\n- [ ] Fazer code review\n- [ ] Fazer deploy staging`,
  },
  {
    id: 3,
    nome: 'Resumo Técnico - Arquitetura',
    icone: '📄',
    conteudo: `# Resumo Técnico\n\nArquitetura baseada em múltiplos agentes:\n- ProfileSense\n- FocusAgent\n- ContextAgent\n- PhonAgent\n- CalmGuard`,
  },
  {
    id: 4,
    nome: 'Template - Reunião',
    icone: '🎯',
    conteudo: `# Reunião\n\n## Pauta\n- Contexto\n- Pendências\n- Próximos passos`,
  },

]


// Função para detectar erros fonéticos
function detectarErrosFoneticos(texto) {
  const padroesErros = {
    'dazer': 'fazer', 'dizer': 'fazer', 'dazendo': 'fazendo', 'dazia': 'fazia',
    'documendo': 'documento', 'probremas': 'problemas', 'probrema': 'problema',
    'conecção': 'conexão', 'resouver': 'resolver', 'quastão': 'questão',
    'amamento': 'amanhã'
  }
  const errosEncontrados = []
  const palavras = texto.split(/\s+/)
  for (const palavra of palavras) {
    const limpa = palavra.toLowerCase().replace(/[.,!?;:]/g, '')
    if (padroesErros[limpa]) {
      errosEncontrados.push({ original: palavra, correcao: padroesErros[limpa] })
    }
  }
  return errosEncontrados
}

// Função para corrigir erros fonéticos
function corrigirErrosFoneticos(texto) {
  const padroesErros = {
    'dazer': 'fazer',
    'dizer': 'fazer',
    'dazendo': 'fazendo',
    'dazia': 'fazia',
    'dizendo': 'fazendo',
    'documendo': 'documento',
    'probremas': 'problemas',
    'probrema': 'problema',
    'conecção': 'conexão',
    'coneção': 'conexão',
    'resouver': 'resolver',
    'quastão': 'questão',
    'quastões': 'questões',
    'amamento': 'amanhã',
    'prequisar': 'pesquisar',
    'precisa': 'precisa',
    'trabalhando': 'trabalhando',
    'equipe': 'equipe',
    'finalizar': 'finalizar',
    // Adicionar mais erros comuns
    'conseguir': 'conseguir',
    'presisar': 'precisar',
    'tentando': 'tentando',
    'fazendo': 'fazendo'
  }

  let textoCorrigido = texto
  const correcoesAplicadas = []

  // Dividir em palavras para preservar maiúsculas
  const palavras = texto.split(/(\s+)/)

  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i]
    const palavraLower = palavra.toLowerCase().replace(/[.,!?;:]/g, '')

    if (padroesErros[palavraLower]) {
      // Preservar pontuação
      const pontuacao = palavra.match(/[.,!?;:]+$/) || ['']
      const palavraSemPontuacao = palavra.replace(/[.,!?;:]+$/, '')

      // Preservar maiúsculas
      let correcao = padroesErros[palavraLower]
      if (palavraSemPontuacao[0] === palavraSemPontuacao[0].toUpperCase() &&
        palavraSemPontuacao[0] !== palavraSemPontuacao[0].toLowerCase()) {
        correcao = correcao.charAt(0).toUpperCase() + correcao.slice(1)
      }

      // Adicionar pontuação de volta
      correcao += pontuacao[0]

      palavras[i] = correcao
      correcoesAplicadas.push({
        errado: palavra,
        correto: correcao,
        posicao: i
      })
    }
  }

  textoCorrigido = palavras.join('')

  return {
    texto: textoCorrigido,
    correcoes: correcoesAplicadas,
    total: correcoesAplicadas.length
  }
}

// Função de detecção de carga cognitiva
// Função de detecção de carga cognitiva (ajustada)
function detectarCarga({ conteudo, revisoes, scrollCount }) {
  const palavras = conteudo.trim() ? conteudo.trim().split(/\s+/).length : 0
  const texto = conteudo.toLowerCase()
  const score = {
    executivo: 0,
    contextual: 0,
    fonologico: 0
  }

  // 🔥 SÓ ATIVA SE TIVER CONTEÚDO SIGNIFICATIVO 🔥
  if (palavras < 5) {
    return { estado: ['neutro'], score, confianca: 0.5 }
  }

  // ==================== DETECÇÃO EXECUTIVA ====================
  // Só ativa se tiver elementos claros de tarefas
  const temListaNumerada = /^\d+\./m.test(conteudo)
  const temChecklist = texto.includes('- [ ]')
  const temTarefas = /\b(tarefa|fazer|preciso|entregar|implementar|desenvolver|criar|organizar|finalizar)\b/i.test(texto)
  const temPrazos = /\b(prazo|deadline|até|semana que vem|amanhã|hoje|entregar)\b/i.test(texto)

  // Só dá peso se realmente tiver tarefas
  if (temListaNumerada) score.executivo += 3
  if (temChecklist) score.executivo += 3
  if (temTarefas && palavras > 10) score.executivo += 2
  if (temPrazos) score.executivo += 2
  if (revisoes >= 3) score.executivo += 1
  if (scrollCount > 10) score.executivo += 1

  // ==================== DETECÇÃO CONTEXTUAL ====================
  const ambiguidades = [
    'quando puder', 'depois vemos', 'alguém', 'talvez', 'aquilo', 'isso',
    'me avisa', 'qualquer coisa', 'depois a gente', 'pode ser', 'mais tarde',
    'não sei', 'quem sabe', 'depois', 'quando der'
  ]

  let ambiguidadeCount = 0
  ambiguidades.forEach(amb => {
    if (texto.includes(amb)) {
      ambiguidadeCount++
      score.contextual += 2
    }
  })

  const perguntas = (conteudo.match(/\?/g) || []).length
  if (perguntas > 0) {
    score.contextual += perguntas * 2
  }

  if (/(ele|ela|isso|aquilo|aquele|aquela)/i.test(texto)) {
    score.contextual += 1
  }

  // ==================== DETECÇÃO FONOLÓGICA ====================
  // Erros fonéticos claros
  const errosFoneticosLista = [
    'dazer', 'dizer', 'dazendo', 'dazia', 'documendo', 'probremas',
    'probrema', 'conecção', 'coneção', 'resouver', 'quastão', 'amamento'
  ]

  let errosCount = 0
  errosFoneticosLista.forEach(erro => {
    const regex = new RegExp(`\\b${erro}\\b`, 'i')
    if (regex.test(texto)) {
      errosCount++
      score.fonologico += 2
    }
  })

  // Texto muito longo (mais de 200 palavras)
  if (palavras > 200) {
    score.fonologico += 2
  } else if (palavras > 100) {
    score.fonologico += 1
  }

  // Muitas revisões no mesmo parágrafo
  if (revisoes > 5 && palavras < 50) {
    score.fonologico += 1
  }

  // ==================== DETERMINAR ESTADO ====================
  let estado = ['neutro']

  // Só ativa se score for >= 2
  if (score.executivo >= 2) estado = ['executivo']
  else if (score.contextual >= 2) estado = ['contextual']
  else if (score.fonologico >= 2) estado = ['fonologico']

  // Verificar se tem múltiplos tipos ativos (todos com score >= 2)
  const tiposAtivos = []
  if (score.executivo >= 2) tiposAtivos.push('executivo')
  if (score.contextual >= 2) tiposAtivos.push('contextual')
  if (score.fonologico >= 2) tiposAtivos.push('fonologico')

  if (tiposAtivos.length >= 2) {
    estado = ['combinado']
  }

  // ==================== CALCULAR CONFIANÇA ====================
  const maior = Math.max(score.executivo, score.contextual, score.fonologico)
  let confianca = 0.5

  if (maior >= 2) {
    confianca = Math.min(0.95, 0.4 + (maior * 0.07))
  }

  console.log('📊 Scores:', score)
  console.log('📊 Estado:', estado)
  console.log('📊 Confiança:', confianca)
  console.log('📊 Erros detectados:', errosCount)

  return { estado, score, confianca }
}

function getJustificativa(carga, detection, errosFoneticos) {
  if (carga === 'executivo') return 'Estrutura de tarefas e organização identificada.'
  if (carga === 'contextual') return 'Informações implícitas ou ambíguas identificadas.'
  if (carga === 'fonologico') {
    if (errosFoneticos?.length > 0) return `${errosFoneticos.length} erro(s) fonético(s) detectado(s).`
    return 'Volume de texto significativo.'
  }
  return 'Monitoramento passivo.'
}

function transformarParaFocus(conteudo) {
  // Se não houver conteúdo, retorna template
  if (!conteudo.trim()) {
    return `## 📋 Tarefas organizadas\n\n### Passo a passo:\n1. Identificar objetivo principal\n2. Separar em etapas menores\n3. Definir prazo para cada etapa\n4. Executar uma etapa por vez\n5. Revisar resultado final\n\n### ✅ Checklist:\n- [ ] Objetivo definido\n- [ ] Etapas separadas\n- [ ] Prazos definidos\n- [ ] Execução iniciada\n- [ ] Revisão concluída`
  }

  // Tentar extrair tarefas de diferentes formatos
  let tarefas = []

  // Verificar se há lista numerada (1., 2., etc)
  const listaNumerada = conteudo.match(/^\d+\.\s*(.+)$/gm)
  if (listaNumerada) {
    tarefas = listaNumerada.map(item => item.replace(/^\d+\.\s*/, '').trim())
  }
  // Verificar se há checklist (- [ ] ou - )
  else if (conteudo.includes('- [ ]') || conteudo.includes('- ')) {
    const linhas = conteudo.split('\n')
    for (const linha of linhas) {
      let item = linha.replace(/^- \[ \]\s*/, '').replace(/^- /, '').trim()
      if (item && !item.startsWith('#')) {
        tarefas.push(item)
      }
    }
  }
  // Se não, quebrar por frases
  else {
    // Quebrar por pontos, vírgulas ou "e"
    let frases = conteudo.split(/[.,;]|\s+e\s+/).map(f => f.trim()).filter(f => f.length > 5)

    // Se tiver "e", quebrar também
    if (frases.length === 1 && conteudo.includes(' e ')) {
      frases = conteudo.split(/\s+e\s+/).map(f => f.trim())
    }

    // Se ainda tiver uma frase só, quebrar por palavras-chave
    if (frases.length === 1) {
      const palavrasChave = ['preciso', 'tenho que', 'vou', 'devo', 'preparar', 'fazer', 'entregar', 'revisar', 'criar', 'desenvolver']
      for (const chave of palavrasChave) {
        if (conteudo.toLowerCase().includes(chave)) {
          const partes = conteudo.split(new RegExp(`\\s+${chave}\\s+`, 'i'))
          if (partes.length > 1) {
            frases = []
            for (let i = 1; i < partes.length; i++) {
              frases.push(`${chave} ${partes[i]}`)
            }
            break
          }
        }
      }
    }

    // Se ainda tem frases, usar elas
    if (frases.length > 1) {
      tarefas = frases
    } else {
      // Último recurso: usar a frase inteira como uma tarefa
      tarefas = [conteudo.trim()]
    }
  }

  // Remover itens vazios e duplicados
  tarefas = [...new Set(tarefas.filter(t => t && t.length > 0))]

  // Se não conseguiu extrair tarefas, retorna template
  if (tarefas.length === 0) {
    return `## 📋 Tarefas organizadas\n\n### Passo a passo:\n1. Identificar objetivo principal\n2. Separar em etapas menores\n3. Definir prazo para cada etapa\n4. Executar uma etapa por vez\n5. Revisar resultado final\n\n### ✅ Checklist:\n- [ ] Objetivo definido\n- [ ] Etapas separadas\n- [ ] Prazos definidos\n- [ ] Execução iniciada\n- [ ] Revisão concluída`
  }

  // Construir resposta
  let resultado = `## 📋 Tarefas organizadas\n\n### Lista de tarefas:\n`
  tarefas.forEach((tarefa, i) => {
    resultado += `${i + 1}. ${tarefa}\n`
  })

  resultado += `\n### ✅ Checklist:\n`
  tarefas.forEach(tarefa => {
    resultado += `- [ ] ${tarefa}\n`
  })

  return resultado
}
function transformarParaContexto(conteudo) {
  // Se não houver conteúdo, retorna apenas o template
  if (!conteudo.trim()) {
    return `${conteudo}\n\n---\n## 📋 Esclarecimento\n\n**Ação esperada:** confirmar exatamente o que precisa ser feito\n**Prazo:** definir data limite\n**Responsável:** quem vai executar?`
  }

  // Detectar termos ambíguos
  const termosAmbiguos = {
    'quando puder': 'definir uma data específica',
    'depois': 'especificar quando (hoje, amanhã, até sexta)',
    'alguém': 'definir quem exatamente',
    'talvez': 'confirmar se é necessário ou não',
    'aquilo': 'especificar o que é "aquilo"',
    'isso': 'especificar o que é "isso"',
    'lá': 'especificar o local',
    'ver': 'definir qual ação concreta será tomada',
    'resolver': 'especificar qual problema será resolvido'
  }

  // Identificar ambiguidades no texto
  const ambiguidadesEncontradas = []
  const textoLower = conteudo.toLowerCase()

  for (const [termo, sugestao] of Object.entries(termosAmbiguos)) {
    if (textoLower.includes(termo)) {
      ambiguidadesEncontradas.push({ termo, sugestao })
    }
  }

  // Detectar perguntas
  const temPerguntas = conteudo.includes('?')

  // Extrair possíveis ações
  const acoesPossiveis = []
  const verbosAcao = ['fazer', 'entregar', 'resolver', 'criar', 'desenvolver', 'analisar', 'revisar', 'preparar']
  for (const verbo of verbosAcao) {
    const regex = new RegExp(`${verbo}\\s+([^.!?]+)`, 'i')
    const match = conteudo.match(regex)
    if (match) {
      acoesPossiveis.push(match[1].trim())
    }
  }

  // Gerar resultado
  let resultado = conteudo

  resultado += `\n\n---\n## 📋 Esclarecimento de contexto\n\n`

  // Adicionar seção de ambiguidades detectadas
  if (ambiguidadesEncontradas.length > 0) {
    resultado += `### 🔍 Ambiguidades detectadas:\n`
    for (const amb of ambiguidadesEncontradas) {
      resultado += `- "${amb.termo}" → ${amb.sugestao}\n`
    }
    resultado += `\n`
  }

  // Adicionar estrutura de esclarecimento
  resultado += `**Ação esperada:** ${acoesPossiveis.length > 0 ? `confirmar: ${acoesPossiveis[0]}` : 'definir claramente o que precisa ser feito'}\n`
  resultado += `**Prazo:** ${temPerguntas ? 'responder com uma data específica' : 'definir data limite'}\n`
  resultado += `**Prioridade:** (alta / média / baixa)\n`
  resultado += `**Responsável:** ${textoLower.includes('alguém') ? 'definir quem especificamente' : 'quem vai executar?'}\n\n`

  // Adicionar perguntas para esclarecer
  resultado += `### ❓ Perguntas para esclarecer:\n`
  resultado += `1. Qual é exatamente o resultado esperado?\n`
  if (temPerguntas) resultado += `2. Qual é a pergunta principal que precisa ser respondida?\n`
  else resultado += `2. Quando precisa estar pronto?\n`
  resultado += `3. Quem mais está envolvido?\n`
  resultado += `4. Há alguma dependência ou impedimento?\n`

  // Adicionar sugestão de resposta
  resultado += `\n### 💡 Sugestão de resposta:\n`
  if (temPerguntas) {
    resultado += `"Vou verificar e te retorno com uma resposta clara até [data/horário]. Posso confirmar o prazo ideal para você?"`
  } else if (ambiguidadesEncontradas.length > 0) {
    resultado += `"Para eu te ajudar da melhor forma, você pode me confirmar qual é exatamente a ação esperada e qual o prazo ideal?"`
  } else {
    resultado += `"Entendi. Vou preparar [ação] e te aviso até [data]. Combinado?"`
  }

  return resultado
}

function transformarParaLeitura(conteudo) {
  return conteudo.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n\n')
}

function transformarParaBlend(conteudo) {
  return `## 📋 Plano de ação\n\n1. Confirmar objetivo\n2. Separar em blocos curtos\n3. Validar prazo\n4. Executar uma etapa por vez\n\n---\n${conteudo}`
}

export default function Editor({ enviarMetricas, cognitive, setCognitive, showToast, isNewDocOpen, setIsNewDocOpen, onEvent }) {
  const [documentos] = useState(documentosBase)
  const [documentoAtual, setDocumentoAtual] = useState({ id: 'novo', nome: 'Novo documento', conteudoOriginal: '' })
  const [conteudo, setConteudo] = useState('')
  const [selecionado, setSelecionado] = useState('')
  const [mensagemSistema, setMensagemSistema] = useState('')
  const [paused, setPaused] = useState(false)
  const [revisoes, setRevisoes] = useState(0)
  const [scrollCount, setScrollCount] = useState(0)
  const [intervencaoPendente, setIntervencaoPendente] = useState(null)
  const [tempoSessaoSegundos, setTempoSessaoSegundos] = useState(0)
  const [agenteAtivo, setAgenteAtivo] = useState(null)
  const [errosFoneticos, setErrosFoneticos] = useState([])
  const [tempoInativo, setTempoInativo] = useState(0)
  const [ragStatus, setRagStatus] = useState(null)
  const [ragHistorico, setRagHistorico] = useState(null)
  const [ragPerfil, setRagPerfil] = useState(null)
  const [ragBuscando, setRagBuscando] = useState(false)
  const [estadoDetectado, setEstadoDetectado] = useState({ estado: ['neutro'], score: { executivo: 0, contextual: 0, fonologico: 0 }, confianca: 0.5 })

  const editorRef = useRef(null)
  const sessionStartRef = useRef(Date.now())
  const ultimoConteudoRef = useRef('')
  const {
    isSpeaking,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis()
  // ==================== FUNÇÕES DO CALMGUARD 🔥 ====================
  // COLOCAR AQUI! ⬇️⬇️⬇️
  // Dentro do componente Editor, após os estados
  const validarComCalmGuard = async (mensagem, agenteOrigem) => {
    try {
      const response = await fetch('http://localhost:3000/api/agents/calmguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: mensagem,
          agenteOrigem: agenteOrigem
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛡️ CalmGuard resposta:', data);
        return data.texto_validado;
      }
    } catch (error) {
      console.error('❌ CalmGuard erro:', error);
    }
    return mensagem;
  };


  const palavras = useMemo(() => conteudo.trim() ? conteudo.trim().split(/\s+/).length : 0, [conteudo])
  const caracteres = conteudo.length
  const minutosLeitura = Math.max(1, Math.ceil(palavras / 200))
  const latencia = useMemo(() => conteudo.trim() ? Math.max(80, Math.min(900, revisoes * 45 + scrollCount * 8 + palavras)) : 0, [conteudo, revisoes, scrollCount, palavras])
  const variacao = useMemo(() => {
    const intensidade = revisoes + scrollCount
    if (intensidade >= 12) return 'alta'
    if (intensidade >= 5) return 'média'
    return 'baixa'
  }, [revisoes, scrollCount])



  const capturarMetrica = async (tipo, dadosAdicionais = {}) => {
    if (!enviarMetricas) return
    const metrica = {
      tipo, timestamp: new Date().toISOString(), sessionTime: tempoSessaoSegundos,
      document: { id: documentoAtual.id, nome: documentoAtual.nome, wordCount: palavras, charCount: caracteres },
      metrics: { wordCount: palavras, charCount: caracteres, revisions: revisoes, scrollCount: scrollCount, latency: latencia, variation: variacao, readingTime: minutosLeitura },
      cognitive: { state: estadoDetectado.estado, score: estadoDetectado.score, confidence: estadoDetectado.confianca, activeAgent: agenteAtivo, errosFoneticos: errosFoneticos.length },
      temListaTarefas: /tarefa|fazer|preciso|entregar/i.test(conteudo),
      temPrazos: /prazo|deadline|até|amanhã/i.test(conteudo),
      ...dadosAdicionais
    }
    await enviarMetricas(metrica)
  }

  const buscarHistoricoRAG = async () => {
    setRagBuscando(true)
    setRagStatus('buscando')
    try {
      const res = await fetch('http://localhost:3000/api/rag/historico/user-001?limit=100')
      if (res.ok) {
        const data = await res.json()
        setRagHistorico(data)
        setRagStatus('sucesso')
        if (data.perfil) setRagPerfil(data.perfil)
        if (showToast) showToast(`📚 ${data.total} registros encontrados`, 'info')
      }
    } catch (error) {
      setRagStatus('erro')
    } finally {
      setRagBuscando(false)
    }
  }

  // TIMER DA SESSÃO - simplificado
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoSessaoSegundos(Math.floor((Date.now() - sessionStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // DETECTAR INATIVIDADE - simplificado
  useEffect(() => {
    let tempoInativoLocal = 0
    let ultimaAtividade = Date.now()
    let notificacaoEnviada = false

    const updateAtividade = () => {
      ultimaAtividade = Date.now()
      notificacaoEnviada = false
      tempoInativoLocal = 0
    }

    const atividades = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click']
    atividades.forEach(event => window.addEventListener(event, updateAtividade))
    if (editorRef.current) {
      editorRef.current.addEventListener('input', updateAtividade)
      editorRef.current.addEventListener('keydown', updateAtividade)
    }

    const interval = setInterval(() => {
      tempoInativoLocal = Math.floor((Date.now() - ultimaAtividade) / 1000)
      setTempoInativo(tempoInativoLocal)

      if (tempoInativoLocal > 30 && !notificacaoEnviada && !intervencaoPendente) {
        notificacaoEnviada = true
        setMensagemSistema(`⏸️ Você está inativo por ${tempoInativoLocal} segundos. Precisa de ajuda?`)
      }
    }, 5000)

    return () => {
      atividades.forEach(event => window.removeEventListener(event, updateAtividade))
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', updateAtividade)
        editorRef.current.removeEventListener('keydown', updateAtividade)
      }
      clearInterval(interval)
    }
  }, [intervencaoPendente])

  // DETECTAR MUDANÇAS COGNITIVAS
  useEffect(() => {
    const executarDetecao = async () => {
      const detection = detectarCarga({ conteudo, revisoes, scrollCount })
      const erros = detectarErrosFoneticos(conteudo)
      setErrosFoneticos(erros)

      const temExecutivo = detection.score.executivo >= 1
      const temContextual = detection.score.contextual >= 1
      const temFonologico = detection.score.fonologico >= 1 || erros.length >= 2


      // 🔥 NOVA LÓGICA: Identificar qual é o MAIOR score
      const scores = {
        executivo: detection.score.executivo,
        contextual: detection.score.contextual,
        fonologico: detection.score.fonologico
      }

      // Encontrar o score mais alto
      const maiorScore = Math.max(scores.executivo, scores.contextual, scores.fonologico)
      const tipoPrincipal = Object.keys(scores).find(key => scores[key] === maiorScore)

      // Verificar se há múltiplos tipos ativos (considerando apenas os que têm score >= 1)
      const tiposAtivos = [temExecutivo, temContextual, temFonologico].filter(Boolean).length

      let agente = null
      let cargaDetectada = 'neutro'
      let mensagemOriginal = ''

      // 🔥 REGRA: Se tem múltiplos tipos ativos E o segundo maior é próximo do maior (diferença <= 1), usa BlendIt
      const segundoMaior = Object.values(scores).sort((a, b) => b - a)[1] || 0
      const diferenca = maiorScore - segundoMaior

      if (tiposAtivos >= 2 && diferenca <= 1) {
        // Múltiplas cargas com intensidade similar
        agente = 'BlendIt'
        cargaDetectada = 'combinado'
        mensagemOriginal = '🔄 Detectei múltiplas necessidades. Quer ajuda combinada?'
      }
      // Se não, ativa o agente principal
      else if (tipoPrincipal === 'executivo') {
        agente = 'FocusAgent'
        cargaDetectada = 'executivo'
        mensagemOriginal = '🎯 Detectei que você está organizando tarefas. Posso ajudar a estruturar melhor?'
      }
      else if (tipoPrincipal === 'contextual') {
        agente = 'ContextAgent'
        cargaDetectada = 'contextual'
        mensagemOriginal = '🔍 Percebi algumas informações ambíguas. Quer ajuda para esclarecer o contexto?'
      }
      else if (tipoPrincipal === 'fonologico') {
        agente = 'PhonAgent'
        cargaDetectada = 'fonologico'
        if (erros.length >= 2) {
          mensagemOriginal = `📖 Detectei ${erros.length} erro(s) de digitação. Quer que eu corrija?`
        } else {
          mensagemOriginal = '📖 O texto está ficando longo. Posso ajudar a organizar para facilitar a leitura?'
        }
      }

      // Validar com CalmGuard
      if (mensagemOriginal && showToast && agente) {
        const mensagemSegura = await validarComCalmGuard(mensagemOriginal, agente)
        showToast(mensagemSegura, 'cognitive')
      }

      setEstadoDetectado({ ...detection, estado: [cargaDetectada] })
      setAgenteAtivo(agente)

      if (setCognitive && cargaDetectada !== cognitive?.carga) {
        setCognitive({
          carga: cargaDetectada,
          confianca: detection.confianca,
          agente: agente || 'Nenhum',
          justificativa: getJustificativa(cargaDetectada, detection, erros)
        })
      }
    }

    executarDetecao()
  }, [conteudo, revisoes, scrollCount])
  // ATUALIZAR REVISÕES
  useEffect(() => {
    if (ultimoConteudoRef.current !== conteudo && ultimoConteudoRef.current !== '') {
      setRevisoes(prev => prev + 1)
    }
    ultimoConteudoRef.current = conteudo
  }, [conteudo])

  // CAPTURAR SCROLL
  useEffect(() => {
    const handleScroll = () => setScrollCount(prev => prev + 1)
    if (editorRef.current) {
      editorRef.current.addEventListener('scroll', handleScroll)
      return () => editorRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Debounce para não notificar a cada tecla
    const timer = setTimeout(() => {
      const executarDetecao = async () => {
        const detection = detectarCarga({ conteudo, revisoes, scrollCount })
        const erros = detectarErrosFoneticos(conteudo)
        setErrosFoneticos(erros)

        const scores = detection.score
        const confianca = detection.confianca
        const estadoDetectado = detection.estado[0]

        let agente = null
        let mensagemOriginal = ''
        let cargaDetectada = 'neutro'

        // Só mostra notificação se realmente detectou algo relevante
        if (estadoDetectado === 'executivo') {
          agente = 'FocusAgent'
          cargaDetectada = 'executivo'
          mensagemOriginal = '🎯 Detectei que você está organizando tarefas. Posso ajudar a estruturar melhor?'
        }
        else if (estadoDetectado === 'contextual') {
          agente = 'ContextAgent'
          cargaDetectada = 'contextual'
          mensagemOriginal = '🔍 Percebi algumas informações ambíguas. Quer ajuda para esclarecer o contexto?'
        }
        else if (estadoDetectado === 'fonologico') {
          agente = 'PhonAgent'
          cargaDetectada = 'fonologico'
          if (erros.length >= 2) {
            mensagemOriginal = `📖 Detectei ${erros.length} erro(s) de digitação. Quer que eu corrija?`
          } else {
            mensagemOriginal = '📖 O texto está ficando longo. Posso ajudar a organizar para facilitar a leitura?'
          }
        }
        else if (estadoDetectado === 'combinado') {
          agente = 'BlendIt'
          cargaDetectada = 'combinado'
          mensagemOriginal = '🔄 Detectei múltiplas necessidades. Quer ajuda combinada?'
        }

        // Só mostra toast se tiver um agente ativo
        if (mensagemOriginal && showToast && agente) {
          const mensagemSegura = await validarComCalmGuard(mensagemOriginal, agente)
          showToast(mensagemSegura, 'cognitive')
        }

        setEstadoDetectado({ ...detection, estado: [cargaDetectada] })
        setAgenteAtivo(agente)

        if (setCognitive && cargaDetectada !== cognitive?.carga) {
          setCognitive({
            carga: cargaDetectada,
            confianca: confianca,
            agente: agente || 'Nenhum',
            justificativa: getJustificativa(cargaDetectada, detection, erros)
          })
        }
      }

      executarDetecao()
    }, 1000) // Espera 1 segundo após parar de digitar

    return () => clearTimeout(timer)
  }, [conteudo, revisoes, scrollCount]) // Dependências


  useEffect(() => {
    if (isNewDocOpen) {
      setDocumentoAtual({ id: `novo_${Date.now()}`, nome: 'Novo documento', conteudoOriginal: '' })
      setConteudo('')
      setRevisoes(0)
      setScrollCount(0)
      setErrosFoneticos([])
      setIsNewDocOpen(false)
      if (showToast) showToast('Novo documento criado!', 'success')
    }
  }, [isNewDocOpen])

  async function abrirDocumento(doc) {
    setDocumentoAtual({ id: doc.id, nome: doc.nome, conteudoOriginal: doc.conteudo })
    setConteudo(doc.conteudo)
    setIntervencaoPendente(null)
    setMensagemSistema(`📂 Documento "${doc.nome}" aberto.`)
    if (showToast) showToast(`Documento "${doc.nome}" aberto`, 'success')
  }

  function novoDocumento() {
    setDocumentoAtual({ id: `novo_${Date.now()}`, nome: 'Novo documento', conteudoOriginal: '' })
    setConteudo('')
    setIntervencaoPendente(null)
    setMensagemSistema('📄 Novo documento criado.')
    setRevisoes(0)
    setScrollCount(0)
    setErrosFoneticos([])
    if (showToast) showToast('Novo documento criado!', 'success')
  }

  async function aplicarIntervencao() {
    if (!intervencaoPendente) return
    setConteudo(intervencaoPendente.novoConteudo)
    setMensagemSistema(`✅ Intervenção aplicada: ${intervencaoPendente.titulo}.`)
    setIntervencaoPendente(null)
    if (showToast) showToast(`Intervenção aplicada`, 'success')
  }

  async function rejeitarIntervencao() {
    setMensagemSistema('Tudo bem. Nenhuma alteração foi aplicada.')
    setIntervencaoPendente(null)
  }

  async function restaurarOriginal() {
    setConteudo(documentoAtual.conteudoOriginal || '')
    setIntervencaoPendente(null)
    setMensagemSistema('↩️ Documento restaurado.')
    if (showToast) showToast('Documento restaurado', 'info')
  }

  async function aplicarCorrecaoFonetica() {
    // Usar a função de correção local
    const { texto: textoCorrigido, correcoes, total } = corrigirErrosFoneticos(conteudo)

    if (total === 0) {
      showToast('Nenhum erro fonético detectado!', 'info')
      return
    }

    // Mostrar preview das correções
    let preview = `🔍 Encontrei ${total} erro(s) fonético(s):\n\n`
    correcoes.slice(0, 5).forEach(c => {
      preview += `• "${c.errado}" → "${c.correto}"\n`
    })
    if (correcoes.length > 5) {
      preview += `\n... e mais ${correcoes.length - 5} correções`
    }
    preview += `\n\nDeseja aplicar estas correções?`

    setMensagemSistema(preview)

    setIntervencaoPendente({
      tipo: 'fonologico',
      titulo: `Corrigir ${total} erro(s) fonético(s)`,
      novoConteudo: textoCorrigido,
      detalhes: {
        correcoes: correcoes,
        total: total
      }
    })
  }

  async function handleIntervention(actionId) {
    await capturarMetrica('intervention', {
      event: 'intervention_suggested',
      action_id: actionId,
      cognitive_state: estadoDetectado.estado,
      active_agent: agenteAtivo,
      session_duration_seconds: tempoSessaoSegundos,
      erros_foneticos: errosFoneticos.length
    })

    // ==================== FOCUSAGENT ====================
    if (actionId === 'aplicar_focus') {
      try {
        // Chamar o FocusAgent no backend
        const response = await fetch('http://localhost:3000/api/agents/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tarefa: conteudo,
            contexto: 'documento atual'
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🎯 FocusAgent response:', data)

          // Extrair a intervenção do FocusAgent
          let novoConteudo = data.intervencao || data.texto || transformarParaFocus(conteudo)

          setIntervencaoPendente({
            tipo: 'focus',
            titulo: 'Organizar tarefas e prazos',
            novoConteudo: novoConteudo,
            detalhes: {
              micro_tarefas: data.micro_tarefas,
              ancora_temporal: data.ancora_temporal
            }
          })
          setMensagemSistema('💡 Sugestão do FocusAgent pronta. Confirme se deseja aplicar.')
        } else {
          // Fallback local
          setIntervencaoPendente({
            tipo: 'focus',
            titulo: 'Organizar tarefas e prazos',
            novoConteudo: transformarParaFocus(conteudo)
          })
          setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
        }
      } catch (error) {
        console.error('❌ Erro ao chamar FocusAgent:', error)
        // Fallback local
        setIntervencaoPendente({
          tipo: 'focus',
          titulo: 'Organizar tarefas e prazos',
          novoConteudo: transformarParaFocus(conteudo)
        })
        setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
      }
      return
    }

    // ==================== CONTEXTAGENT ====================
    if (actionId === 'aplicar_contexto') {
      try {
        const response = await fetch('http://localhost:3000/api/agents/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto: conteudo,
            contexto: 'comunicação profissional'
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🔍 ContextAgent response:', data)

          let novoConteudo = `${conteudo}\n\n---\n${data.resumo_claro || data.resposta_segura_sugerida || transformarParaContexto(conteudo)}`

          setIntervencaoPendente({
            tipo: 'contexto',
            titulo: 'Tornar instruções mais explícitas',
            novoConteudo: novoConteudo
          })
          setMensagemSistema('💡 Sugestão do ContextAgent pronta. Confirme se deseja aplicar.')
        } else {
          setIntervencaoPendente({
            tipo: 'contexto',
            titulo: 'Tornar instruções mais explícitas',
            novoConteudo: transformarParaContexto(conteudo)
          })
          setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
        }
      } catch (error) {
        console.error('❌ Erro ao chamar ContextAgent:', error)
        setIntervencaoPendente({
          tipo: 'contexto',
          titulo: 'Tornar instruções mais explícitas',
          novoConteudo: transformarParaContexto(conteudo)
        })
        setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
      }
      return
    }

    // ==================== PHONAGENT (LEITURA) ====================
    if (actionId === 'aplicar_leitura') {
      try {
        const response = await fetch('http://localhost:3000/api/agents/phon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto: conteudo,
            acao: 'corrigir'
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📖 PhonAgent response:', data)

          setIntervencaoPendente({
            tipo: 'fonologico',
            titulo: 'Melhorar leitura do conteúdo',
            novoConteudo: data.textoCorrigido || transformarParaLeitura(conteudo)
          })
          setMensagemSistema('💡 Sugestão do PhonAgent pronta. Confirme se deseja aplicar.')
        } else {
          setIntervencaoPendente({
            tipo: 'fonologico',
            titulo: 'Melhorar leitura do conteúdo',
            novoConteudo: transformarParaLeitura(conteudo)
          })
          setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
        }
      } catch (error) {
        console.error('❌ Erro ao chamar PhonAgent:', error)
        setIntervencaoPendente({
          tipo: 'fonologico',
          titulo: 'Melhorar leitura do conteúdo',
          novoConteudo: transformarParaLeitura(conteudo)
        })
        setMensagemSistema('💡 Sugestão pronta (modo offline). Confirme se deseja aplicar.')
      }
      return
    }

    // ==================== CORREÇÃO FONÉTICA (LOCAL) ====================
    if (actionId === 'aplicar_correcao_fonetica') {
      await aplicarCorrecaoFonetica()
      return
    }

    // ==================== VER CORREÇÕES ====================
    if (actionId === 'ver_correcoes') {
      if (errosFoneticos.length > 0) {
        let mensagem = `🔍 Sugestões de correção (${errosFoneticos.length}):\n\n`
        errosFoneticos.slice(0, 10).forEach(e => {
          mensagem += `• "${e.original}" → "${e.correcao}"\n`
        })
        if (errosFoneticos.length > 10) {
          mensagem += `\n... e mais ${errosFoneticos.length - 10} erros`
        }
        mensagem += '\n\nClique em "Corrigir erros" para corrigir automaticamente.'
        setMensagemSistema(mensagem)
      } else {
        setMensagemSistema('✅ Nenhum erro fonético detectado!')
      }
      return
    }

    // ==================== VER FOCUS ====================
    if (actionId === 'ver_focus') {
      setMensagemSistema('💡 Exemplo: dividir a atividade em microetapas com ordem clara e prazos definidos.')
      return
    }

    // ==================== GERAR RESPOSTA ====================
    if (actionId === 'gerar_resposta') {
      const respostaSugerida = '✅ Resposta segura sugerida: "Posso seguir, sim. Você pode me confirmar o prazo e o resultado esperado?"'
      setMensagemSistema(respostaSugerida)
      if (showToast) showToast('Resposta sugerida gerada!', 'success')
      return
    }

    // ==================== PREVER LEITURA ====================
    if (actionId === 'prever_leitura') {
      setMensagemSistema('💡 Prévia: mais espaçamento, blocos menores e leitura em voz alta.')
      return
    }

    // ==================== BLEND ====================
    if (actionId === 'aplicar_blend') {
      setIntervencaoPendente({
        tipo: 'blend',
        titulo: 'Aplicar intervenção combinada',
        novoConteudo: transformarParaBlend(conteudo),
      })
      setMensagemSistema('💡 Sugestão combinada pronta. Confirme se deseja aplicar.')
      return
    }

    if (actionId === 'ver_blend') {
      setMensagemSistema('💡 Proposta: dividir em etapas e tornar instruções mais explícitas.')
      return
    }

    // ==================== IGNORAR ====================
    if (actionId === 'ignorar') {
      setIntervencaoPendente(null)
      setMensagemSistema('Tudo bem. Nenhuma alteração foi aplicada.')
    }
  }
  return (
    <div style={styles.page}>
      <div style={styles.center}>
        <div style={styles.toolbar}>
          <select style={styles.select} defaultValue="DM Sans">
            <option>DM Sans</option>
            <option>Arial</option>
            <option>Verdana</option>
          </select>
          <select style={styles.select} defaultValue="14">
            <option>12</option>
            <option>14</option>
            <option>16</option>
            <option>18</option>
          </select>
          <button style={styles.toolBtn}><strong>B</strong></button>
          <button style={styles.toolBtn}><em>I</em></button>
          <button style={styles.toolBtn}><u>U</u></button>

          {/* 🔥 BOTÃO DO CALMGUARD - COLE AQUI 🔥 */}
          <button
            style={styles.testBtn}
            onClick={async () => {
              if (!conteudo) {
                setMensagemSistema('📝 Digite algo no editor para testar o CalmGuard');
                return;
              }
              const resultado = await validarComCalmGuard(conteudo, 'Editor');
              setMensagemSistema(`🛡️ Texto validado: "${resultado.substring(0, 100)}..."`);
              if (showToast) showToast('Texto validado!', 'success');
            }}
            title="Validar texto atual"
          >
            🛡️ Validar
          </button>

          {agenteAtivo && (
            <div style={agenteAtivo === 'PhonAgent' && errosFoneticos.length > 0 ? styles.agentBadgePhon : styles.agentBadge}>
              <span style={styles.agentIcon}>
                {agenteAtivo === 'FocusAgent' && '🎯'}
                {agenteAtivo === 'ContextAgent' && '🔍'}
                {agenteAtivo === 'PhonAgent' && '📖'}
              </span>
              <span style={styles.agentText}>
                {agenteAtivo}
                {errosFoneticos.length > 0 && ` (${errosFoneticos.length} erros)`}
              </span>
            </div>
          )}

          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>
            {palavras} palavras
          </div>
        </div>

        <div style={styles.templates}>
          <div style={styles.templatesHeader}><div style={styles.templatesTitle}>📁 Documentos prontos</div><button style={styles.newDocBtn} onClick={novoDocumento}>+ Novo</button></div>
          <div style={styles.templateRow}>{documentos.map(doc => (<button key={doc.id} style={styles.templateBtn} onClick={() => abrirDocumento(doc)}><span>{doc.icone}</span><span>{doc.nome}</span></button>))}</div>
        </div>

        <div style={styles.currentDocBar}><strong>Documento:</strong> {documentoAtual.nome}</div>
        {mensagemSistema && <div style={styles.feedbackBox}>{mensagemSistema}</div>}

        {intervencaoPendente && (
          <div style={styles.pendingCard}>
            <div style={styles.pendingTitle}>Sugestão</div>
            <div style={styles.pendingText}>{intervencaoPendente.titulo}</div>
            <div style={styles.pendingActions}>
              <button style={styles.applyBtn} onClick={aplicarIntervencao}>Aplicar</button>
              <button style={styles.secondaryBtn} onClick={rejeitarIntervencao}>Agora não</button>
              <button style={styles.secondaryBtn} onClick={restaurarOriginal}>Restaurar</button>
            </div>
          </div>
        )}

        <div style={styles.editorWrap}>
          <textarea ref={editorRef} value={conteudo} onChange={(e) => setConteudo(e.target.value)} onScroll={() => setScrollCount(prev => prev + 1)} style={styles.editor} placeholder="Comece a escrever..." />
        </div>

        <div style={styles.voiceButtons}>
          <button
            style={styles.voiceBtn}
            onClick={() => {
              if (selecionado && selecionado.trim()) {
                // Se tem texto selecionado, lê o selecionado
                speak(selecionado)
                if (showToast) showToast('🔊 Lendo texto selecionado...', 'info')
              } else if (conteudo && conteudo.trim()) {
                // Se não, lê todo o conteúdo
                speak(conteudo)
                if (showToast) showToast('🔊 Lendo documento...', 'info')
              } else {
                if (showToast) showToast('📝 Nenhum texto para ler', 'warning')
              }
            }}
            disabled={isSpeaking}
          >
            🔊 Ouvir
          </button>

          <button
            style={styles.voiceBtn}
            onClick={() => {
              if (isSpeaking) {
                pause()
                if (showToast) showToast('⏸ Leitura pausada', 'info')
              } else {
                resume()
                if (showToast) showToast('▶ Leitura retomada', 'info')
              }
            }}
            disabled={!isSpeaking && !window.speechSynthesis?.paused}
          >
            {isSpeaking ? '⏸ Pausar' : (window.speechSynthesis?.paused ? '▶ Continuar' : '⏸ Pausar')}
          </button>

          <button
            style={styles.voiceBtn}
            onClick={() => {
              stop()
              if (showToast) showToast('⏹ Leitura interrompida', 'info')
            }}
            disabled={!isSpeaking && !window.speechSynthesis?.speaking}
          >
            ⏹ Stop
          </button>
        </div>
        <div style={styles.meta}>
          {isSpeaking && (
            <span style={{ color: '#10b981', marginLeft: 12, animation: 'pulse 1s infinite' }}>
              🔊 Lendo...
            </span>
          )}
          {tempoInativo > 30 && (
            <span style={{ color: tempoInativo > 60 ? '#ef4444' : '#f59e0b', marginLeft: 12, animation: 'pulse 1s infinite' }}>
              ⏸️ Inativo por {tempoInativo}s
            </span>
          )}
          <span>{palavras} palavras • {caracteres} caracteres • {minutosLeitura} min</span>
          {errosFoneticos.length > 0 && (
            <span style={{ color: '#b45309' }}>⚠️ {errosFoneticos.length} erro(s)</span>
          )}
          {ragStatus === 'sucesso' && (
            <span style={{ color: '#10b981' }}>📚 Histórico</span>
          )}
        </div>
      </div>

      <aside style={styles.rightPanel}>
        <div style={styles.sideCard}>
          <CognitiveInterventionCard estadoDetectado={estadoDetectado} onAction={handleIntervention} errosFoneticos={errosFoneticos} agenteAtivo={agenteAtivo} />
        </div>

        <div style={styles.sideCard}>
          <div style={styles.sideTitle}>🔍 Histórico</div>
          <div style={styles.infoBoxRag}>
            <strong>Status:</strong> {ragStatus === 'sucesso' ? `✅ ${ragHistorico?.total || 0} registros` : ragStatus === 'buscando' ? '⏳ Buscando...' : '📊 Aguardando'}
          </div>
          {ragHistorico?.fonte && <div style={styles.infoBoxRag}><strong>Fonte:</strong> {ragHistorico.fonte === 'azure-search' ? '🔍 Azure Search' : '☁️ Cosmos DB'}</div>}
          {ragPerfil?.cargaPredominante && ragPerfil.cargaPredominante !== 'neutro' && (
            <div style={styles.infoBoxRag}><strong>Perfil:</strong> {ragPerfil.cargaPredominante === 'executivo' && '🎯 Foco em tarefas'}</div>
          )}
          <button onClick={buscarHistoricoRAG} style={styles.ragButton} disabled={ragBuscando}>{ragBuscando ? '🔄...' : '🔍 Buscar'}</button>
        </div>

        {errosFoneticos.length > 0 && (
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>📖 Correções</div>
            <div style={styles.errorList}>{errosFoneticos.slice(0, 5).map((e, i) => (<div key={i} style={styles.errorItem}>"{e.original}" → "{e.correcao}"</div>))}</div>
            <button style={styles.corrigirBtn} onClick={() => handleIntervention('aplicar_correcao_fonetica')}>✅ Corrigir</button>
          </div>
        )}

        <div style={styles.sideCard}>
          <div style={styles.sideTitle}>📊 Métricas</div>
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}><div style={styles.metricLabel}>Palavras</div><div style={styles.metricValue}>{palavras}</div></div>
            <div style={styles.metricItem}><div style={styles.metricLabel}>Tempo</div><div style={styles.metricValue}>{String(Math.floor(tempoSessaoSegundos / 60)).padStart(2, '0')}:{String(tempoSessaoSegundos % 60).padStart(2, '0')}</div></div>
            <div style={styles.metricItem}><div style={styles.metricLabel}>Revisões</div><div style={styles.metricValue}>{revisoes}</div></div>
            <div style={styles.metricItem}><div style={styles.metricLabel}>Scrolls</div><div style={styles.metricValue}>{scrollCount}</div></div>
            <div style={styles.metricItem}><div style={styles.metricLabel}>Carga</div><div style={styles.metricValue}>
              {estadoDetectado.estado[0] === 'executivo' && '🎯 Executivo'}
              {estadoDetectado.estado[0] === 'contextual' && '🔍 Contextual'}
              {estadoDetectado.estado[0] === 'fonologico' && '📖 Fonológico'}
            </div></div>
          </div>
        </div>

        <div style={styles.sideCard}>
          <div style={styles.sideTitle}>🎯 Scores</div>
          <div><span>FocusAgent:</span> {estadoDetectado.score.executivo}</div>
          <div><span>ContextAgent:</span> {estadoDetectado.score.contextual}</div>
          <div><span>PhonAgent:</span> {estadoDetectado.score.fonologico}</div>
        </div>
      </aside>
    </div>
  )
}

const styles = {
  testBtn: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 12,
    marginLeft: 8,
    transition: 'all 0.2s',
  },
  page: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: '100%', padding: 16, background: '#f6f4ef', overflow: 'auto' },
  center: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '10px 12px' },
  select: { border: '1px solid #ddd', borderRadius: 8, padding: '6px 8px' },
  toolBtn: { border: '1px solid #ddd', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' },
  agentBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#eef2ff', borderRadius: 20, fontSize: 12 },
  agentBadgePhon: { background: '#fef3e8', border: '1px solid #fdba74' },
  agentIcon: { fontSize: 14 }, agentText: { color: '#1e40af' },
  templates: { background: '#fff', border: '1px solid #d9e2ff', borderRadius: 14, padding: 14 },
  templatesHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  templatesTitle: { fontWeight: 700 }, templateRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  templateBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontSize: 13 },
  newDocBtn: { border: '1px solid #ddd', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 },
  currentDocBar: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', fontSize: 14 },
  feedbackBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 },
  pendingCard: { background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  pendingTitle: { fontWeight: 700 }, pendingText: { fontSize: 14 },
  pendingActions: { display: 'flex', gap: 8 },
  applyBtn: { background: '#111', color: '#fff', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, border: 'none' },
  secondaryBtn: { border: '1px solid #ddd', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' },
  editorWrap: { flex: 1, minHeight: 420, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 },
  editor: { width: '100%', minHeight: 420, border: 'none', outline: 'none', resize: 'none', fontSize: 18, lineHeight: 1.7, fontFamily: 'DM Sans, Arial, sans-serif' },
  bottomBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  voiceButtons: { display: 'flex', gap: 8 }, voiceBtn: { border: '1px solid #ddd', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' },
  meta: { fontSize: 12, color: '#666', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' },
  sideCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  sideTitle: { fontWeight: 700, fontSize: 15 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  metricItem: { background: '#fafafa', border: '1px solid #ececec', borderRadius: 10, padding: '8px 10px' },
  metricLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: 600 },
  infoBoxRag: { background: '#fafafa', borderRadius: 12, padding: '10px 12px', fontSize: 13 },
  ragButton: { background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', marginTop: 4 },
  errorList: { fontSize: 12, maxHeight: 120, overflow: 'auto' },
  errorItem: { padding: '4px 0', fontFamily: 'monospace' },
  corrigirBtn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }
}