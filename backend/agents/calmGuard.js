// backend/agents/calmGuard.js
const TERMOS_BLOQUEADOS = [
  // Palavras isoladas
  { regex: /\b(urgente|URGENTE)\b/g, replace: 'importante' },
  { regex: /\b(imediatamente|IMEDIATAMENTE)\b/g, replace: 'assim que puder' },
  { regex: /\b(erro|ERRADO|errado)\b/g, replace: 'ponto de ajuste' },
  { regex: /\b(falha|FALHA|falhou|FALHOU)\b/g, replace: 'dificuldade' },
  { regex: /\b(precisa|PRECISA)\b/g, replace: 'pode' },
  { regex: /\b(obrigatorio|OBRIGATORIO|obrigatório)\b/g, replace: 'recomendado' },
  { regex: /\b(incorreto|INCORRETO)\b/g, replace: 'pode ser ajustado' },
  
  // Frases completas
  { regex: /\b(você precisa|PRECISA)\b/gi, replace: 'uma sugestão é' },
  { regex: /\b(você deve|DEVE)\b/gi, replace: 'pode ser útil' },
  { regex: /\b(problema grave)\b/gi, replace: 'situação que merece atenção' },
  { regex: /\b(ansiedade|ANSIEDADE)\b/g, replace: 'desconforto' },
  
  // Termos de neurodiversidade
  { regex: /\b(autismo|AUTISMO)\b/g, replace: 'perfil de processamento contextual' },
  { regex: /\b(tdah|TDAH)\b/g, replace: 'perfil de carga executiva' },
  { regex: /\b(dislexia|DISLEXIA)\b/g, replace: 'perfil de carga fonológica' }
]

const EXPRESSOES_PRESSAO = [
  /faça isso agora/gi,
  /isso está errado/gi,
  /você falhou/gi,
  /não pode errar/gi,
  /precisa resolver hoje/gi,
  /terminar isso urgente/gi
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

async function validar(conteudo, agenteOrigem = 'sistema') {
  try {
    console.log(`🛡️ CalmGuard: validando saída de ${agenteOrigem}`)

    if (typeof conteudo === 'string') {
      const resultado = revisarTexto(conteudo)
      console.log(`📝 Original: "${conteudo}"`)
      console.log(`✅ Revisado: "${resultado.texto_revisado}"`)
      
      return {
        aprovado: resultado.tom.aprovado,
        problemas_encontrados: [],
        texto_validado: resultado.texto_revisado,
        nivel_acolhimento: resultado.tom.nivel === 'ok' ? 'alto' : 'medio'
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