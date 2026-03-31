const foundry = require('../services/foundry')
const { chat } = require('../services/openai')

const SYSTEM = `Você é o ContextAgent do CogniFlow.

Sua função é reduzir carga contextual em comunicações profissionais.

Analise a mensagem e responda somente com JSON válido.

Você deve:
1. Decodificar o que está implícito
2. Estruturar expectativas não declaradas
3. Identificar múltiplas interpretações plausíveis
4. Traduzir linguagem indireta, vaga ou figurada para linguagem explícita

Formato obrigatório:
{
  "justificativa": "Explicação técnica mas acolhedora do PORQUÊ esta análise está sendo feita (ex: Sugeri o esclarecimento pois a mensagem possui múltiplos caminhos de ação sem prazos definidos).",
  "ambiguidade_detectada": true,
  "nivel_ambiguidade": "baixo | medio | alto",
  "resumo_claro": "explicação curta e objetiva",
  "implicitos_detectados": ["item 1", "item 2"],
  "expectativas_estruturadas": {
    "acao_esperada": "string",
    "prazo": "string",
    "prioridade": "string",
    "dependencias": ["string"]
  },
  "interpretacoes": [
    {
      "probabilidade": 50,
      "titulo": "string",
      "descricao": "string",
      "sinais_textuais": ["string"],
      "resposta_sugerida": "string"
    }
  ],
  "traducao_linguagem_indireta": {
    "original": "string",
    "explicito": "string"
  },
  "risco_de_mal_entendido": "baixo | medio | alto",
  "resposta_segura_sugerida": "string"
}`

function limparMensagem(texto) {
  if (!texto) return ''
  return texto
    .replace(/\n{2,}/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000)
}

function fallbackAnalise(mensagem = '') {
  return {
    justificativa: "Análise baseada em padrões de comunicação inconclusiva detectados pelo ProfileSense.",
    ambiguidade_detectada: true,
    nivel_ambiguidade: 'medio',
    resumo_claro: 'A mensagem sugere uma expectativa de resposta, mas não deixa claros prazo, prioridade ou formato da entrega.',
    implicitos_detectados: [
      'Existe expectativa de retorno',
      'A ação esperada não está totalmente explícita'
    ],
    expectativas_estruturadas: {
      acao_esperada: 'Confirmar entendimento e alinhar próximos passos',
      prazo: 'Não declarado',
      prioridade: 'Incerta',
      dependencias: [
        'Esclarecer qual resultado é esperado'
      ]
    },
    interpretacoes: [
      {
        probabilidade: 60,
        titulo: 'Pedido de alinhamento',
        descricao: 'A pessoa parece querer confirmação antes de seguir.',
        sinais_textuais: [
          'pedido genérico',
          'falta de detalhamento'
        ],
        resposta_sugerida: 'Posso seguir, sim. Você pode me confirmar exatamente o que espera como retorno?'
      },
      {
        probabilidade: 40,
        titulo: 'Solicitação indireta',
        descricao: 'Pode haver uma expectativa de ação não dita de forma direta.',
        sinais_textuais: [
          'linguagem aberta',
          'instrução incompleta'
        ],
        resposta_sugerida: 'Claro. Para eu te ajudar da melhor forma, você pode me dizer o prazo e o formato esperado?'
      }
    ],
    traducao_linguagem_indireta: {
      original: mensagem || 'Mensagem recebida',
      explicito: 'Há uma solicitação que precisa ser confirmada com ação esperada, prazo e prioridade.'
    },
    risco_de_mal_entendido: 'medio',
    resposta_segura_sugerida: 'Entendi. Para eu te responder com precisão, você pode me confirmar a ação esperada e o prazo ideal?'
  }
}

async function analisar(mensagem, remetente = 'colega', contextoProfissional = 'empresa de tecnologia') {
  try {
    console.log(`🔍 ContextAgent: analisando mensagem de ${remetente}`)

    const mensagemLimpa = limparMensagem(mensagem)
    let resultado = null

    const prompt = `
Analise a seguinte mensagem profissional:

Mensagem: "${mensagemLimpa}"
Remetente: ${remetente}
Contexto: ${contextoProfissional}

Retorne somente JSON válido.
`

    if (process.env.AGENT_CONTEXT_MODEL) {
      console.log('🤖 ContextAgent: usando modelo do Foundry')
      resultado = await foundry.chamarAgente(
        process.env.AGENT_CONTEXT_MODEL,
        prompt,
        SYSTEM,
        { max_tokens: 900, temperature: 0.2 }
      )
    }

    if (!resultado) {
      console.log('⚠️ ContextAgent: usando fallback local')
      resultado = await chat(SYSTEM, prompt, 900)
    }

    return resultado || fallbackAnalise(mensagemLimpa)
  } catch (error) {
    console.error('❌ Erro ContextAgent:', error.message)
    return fallbackAnalise(mensagem)
  }
}

module.exports = { analisar }