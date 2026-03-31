// backend/agents/calmGuard.js
const TERMOS_BLOQUEADOS = [
  { regex: /\burgente\b/gi, replace: 'importante' },
  { regex: /\bimediatamente\b/gi, replace: 'assim que puder' },
  { regex: /\berro\b/gi, replace: 'ponto de ajuste' },
  { regex: /\bfalha\b/gi, replace: 'dificuldade' },
  { regex: /\bproblema grave\b/gi, replace: 'situação que merece atenção' },
  { regex: /\bvoce precisa\b/gi, replace: 'uma sugestão é' },
  { regex: /\bvoce deve\b/gi, replace: 'pode ser útil' },
  { regex: /\bobrigatorio\b/gi, replace: 'recomendado' },
  { regex: /\bincorreto\b/gi, replace: 'pode ser ajustado' },
  { regex: /\bansiedade\b/gi, replace: 'desconforto' },
  { regex: /\bautismo\b/gi, replace: 'perfil de processamento contextual' },
  { regex: /\btdah\b/gi, replace: 'perfil de carga executiva' },
  { regex: /\bdislexia\b/gi, replace: 'perfil de carga fonológica' }
]

const EXPRESSOES_PRESSAO = [
  /faça isso agora/gi,
  /isso está errado/gi,
  /você falhou/gi,
  /não pode errar/gi,
  /precisa resolver hoje/gi
]

function normalizarTexto(texto = '') {
  let saida = texto

  for (const termo of TERMOS_BLOQUEADOS) {
    saida = saida.replace(termo.regex, termo.replace)
  }

  saida = saida
    .replace(/\s+/g, ' ')
    .replace(/\.\./g, '.')
    .trim()

  return saida
}

function validarTom(texto = '') {
  const textoLower = texto.toLowerCase()

  const agressivo =
    textoLower.includes('culpa') ||
    textoLower.includes('falhou') ||
    textoLower.includes('errado') ||
    textoLower.includes('imediatamente')

  return {
    aprovado: !agressivo,
    nivel: agressivo ? 'alerta' : 'ok'
  }
}

function prevenirAnsiedade(texto = '') {
  let saida = texto

  for (const padrao of EXPRESSOES_PRESSAO) {
    saida = saida.replace(padrao, 'vale seguir no seu ritmo com apoio do sistema')
  }

  return saida
}

function controlarLinguagem(texto = '') {
  return normalizarTexto(texto)
}

function revisarTexto(texto = '') {
  let saida = texto

  saida = prevenirAnsiedade(saida)
  saida = controlarLinguagem(saida)

  const tom = validarTom(saida)

  if (!tom.aprovado) {
    saida = controlarLinguagem(saida)
  }

  return {
    texto_original: texto,
    texto_revisado: saida,
    tom
  }
}

function revisarObjeto(obj) {
  if (!obj || typeof obj !== 'object') return obj

  const copia = JSON.parse(JSON.stringify(obj))

  if (typeof copia.recomendacao === 'string') {
    copia.recomendacao = revisarTexto(copia.recomendacao).texto_revisado
  }

  if (Array.isArray(copia.interpretacoes)) {
    copia.interpretacoes = copia.interpretacoes.map(item => {
      const novoItem = { ...item }

      if (typeof novoItem.descricao === 'string') {
        novoItem.descricao = revisarTexto(novoItem.descricao).texto_revisado
      }

      if (typeof novoItem.resposta_sugerida === 'string') {
        novoItem.resposta_sugerida = revisarTexto(novoItem.resposta_sugerida).texto_revisado
      }

      return novoItem
    })
  }

  if (typeof copia.texto === 'string') {
    copia.texto = revisarTexto(copia.texto).texto_revisado
  }

  return copia
}

async function validar(conteudo, agenteOrigem = 'sistema') {
  try {
    console.log(`🛡️ CalmGuard: validando saída de ${agenteOrigem}`)

    if (typeof conteudo === 'string') {
      const resultado = revisarTexto(conteudo)
      return {
        aprovado: resultado.tom.aprovado,
        problemas_encontrados: [],
        texto_validado: resultado.texto_revisado,
        nivel_acolhimento: resultado.tom.nivel === 'ok' ? 'alto' : 'medio'
      }
    }

    if (typeof conteudo === 'object') {
      const objetoRevisado = revisarObjeto(conteudo)
      return {
        aprovado: true,
        problemas_encontrados: [],
        texto_validado: JSON.stringify(objetoRevisado),
        nivel_acolhimento: 'alto'
      }
    }

    return {
      aprovado: true,
      problemas_encontrados: [],
      texto_validado: conteudo,
      nivel_acolhimento: 'medio'
    }
  } catch (error) {
    console.error('❌ Erro CalmGuard:', error.message)
    return {
      aprovado: true,
      problemas_encontrados: [],
      texto_validado: conteudo,
      nivel_acolhimento: 'medio'
    }
  }
}

module.exports = { validar }