const rag = require('../services/rag')

// 🧠 Classificação híbrida (REGRA + IA opcional)
async function classificar(dados = {}, userId = null) {
  try {
    console.log('🧠 ProfileSense: classificando com userId:', userId)

    // 🔹 1. Normalizar dados
    const latencia = dados.latencia_media_ms || 0
    const variacao = dados.variacao_latencia || 'normal'
    const revisoes = dados.revisoes_texto || 0
    const retornos = dados.retornos_secoes || false
    const abandono = dados.abandono_recorrente || false
    const tempo = dados.tempo_sessao_min || 0

    // 🔹 2. Score por tipo de carga
    let score = {
      executivo: 0,
      contextual: 0,
      fonologico: 0
    }

    // ⚡ EXECUTIVO (troca de foco / abandono)
    if (abandono) score.executivo += 2
    if (variacao === 'alta') score.executivo += 1
    if (tempo < 3) score.executivo += 1

    // 🧠 CONTEXTUAL (dificuldade de interpretação)
    if (latencia > 8000) score.contextual += 2
    if (retornos) score.contextual += 2
    if (revisoes > 2) score.contextual += 1

    // 🔤 FONOLÓGICO (leitura pesada)
    if (latencia > 6000) score.fonologico += 1
    if (revisoes > 3) score.fonologico += 2

    // 🔹 3. Histórico (RAG leve)
    if (userId) {
      const historico = await rag.buscarHistoricoUsuario(userId, 3)

      historico.forEach(h => {
        if (h.classificacao === 'contextual') score.contextual += 1
        if (h.classificacao === 'executivo') score.executivo += 1
        if (h.classificacao === 'fonologico') score.fonologico += 1
      })
    }

    // 🔹 4. Determinar estados ativos
    const estadosAtivos = Object.keys(score).filter(k => score[k] >= 3)

    const estadoFinal = estadosAtivos.length ? estadosAtivos : ['neutro']

    console.log('📊 Score:', score)
    console.log('📊 Estado final:', estadoFinal)

    return {
      estado: estadoFinal,
      score,
      confianca: calcularConfianca(score)
    }

  } catch (error) {
    console.error('❌ Erro ProfileSense:', error)

    return {
      estado: ['neutro'],
      score: {},
      confianca: 0.5
    }
  }
}

// 🔹 cálculo simples de confiança
function calcularConfianca(score) {
  const total = Object.values(score).reduce((a, b) => a + b, 0)
  if (total === 0) return 0.5
  return Math.min(1, total / 10)
}

module.exports = { classificar }