// backend/services/phon.js
const { OpenAI } = require('openai')
require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

class PhonService {
  constructor() {
    this.model = process.env.AGENT_PHON_MODEL || 'gpt-3.5-turbo'
  }

  // Dicionário de correções fonéticas (fallback)
  getCorrecoesBasicas() {
    return {
      // Trocas b/d
      'dazer': 'fazer',
      'dizer': 'fazer',
      'dazendo': 'fazendo',
      'dazia': 'fazia',
      'dizendo': 'fazendo',
      'daz': 'faz',
      
      // Trocas p/q
      'probremas': 'problemas',
      'probrema': 'problema',
      'prequisar': 'pesquisar',
      'prequisa': 'pesquisa',
      'probre': 'problema',
      
      // Trocas m/n
      'documendo': 'documento',
      'amamento': 'amanhã',
      'importamte': 'importante',
      'importamtes': 'importantes',
      
      // Erros de conexão
      'conecção': 'conexão',
      'coneção': 'conexão',
      'conecções': 'conexões',
      
      // Inversões
      'resouver': 'resolver',
      'resouverem': 'resolverem',
      'quastão': 'questão',
      'quastões': 'questões',
      'quastionar': 'questionar',
      'quastionario': 'questionário',
      
      // Erros comuns
      'preciso': 'preciso',
      'precisar': 'precisar',
      'trabalhando': 'trabalhando',
      'equipe': 'equipe',
      'finalizar': 'finalizar',
      'correção': 'correção',
      'corrigir': 'corrigir'
    }
  }

  /**
   * Corrige erros fonéticos
   */
  async corrigirTexto(texto) {
    try {
      // Tenta usar IA primeiro
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua_chave_api_aqui') {
        const prompt = `
Você é um especialista em correção fonética para pessoas com dislexia.

Analise o texto abaixo e corrija os erros fonéticos, mantendo o contexto e significado original.

Texto: "${texto}"

Regras:
1. Corrija trocas comuns como b/d, p/q, m/n
2. Corrija inversões de sílabas (ex: "resouver" → "resolver", "quastão" → "questão")
3. Mantenha a estrutura original (parágrafos, pontuação)
4. Preserve nomes próprios e termos técnicos
5. Retorne apenas o texto corrigido, sem explicações

Texto corrigido:
`
        const response = await openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é um assistente especializado em correção fonética.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        const textoCorrigido = response.choices[0].message.content.trim()
        
        return {
          sucesso: true,
          textoCorrigido,
          correcoes: this.contarCorrecoes(texto, textoCorrigido),
          metodo: 'ia'
        }
      }
      
      // Fallback: usar dicionário básico
      const textoCorrigido = this.corrigirComDicionario(texto)
      const totalCorrecoes = this.contarCorrecoes(texto, textoCorrigido)
      
      return {
        sucesso: true,
        textoCorrigido,
        correcoes: totalCorrecoes,
        metodo: 'dicionario',
        aviso: totalCorrecoes > 0 ? `Corrigido ${totalCorrecoes} erro(s) usando dicionário básico` : 'Nenhuma correção necessária'
      }
    } catch (error) {
      console.error('Erro ao corrigir texto:', error)
      
      // Fallback: usar dicionário básico em caso de erro
      const textoCorrigido = this.corrigirComDicionario(texto)
      const totalCorrecoes = this.contarCorrecoes(texto, textoCorrigido)
      
      return {
        sucesso: true,
        textoCorrigido,
        correcoes: totalCorrecoes,
        metodo: 'dicionario',
        aviso: `Usando correção básica (${totalCorrecoes} correções)`
      }
    }
  }

  /**
   * Corrige texto usando dicionário
   */
  corrigirComDicionario(texto) {
    let textoCorrigido = texto
    const correcoes = this.getCorrecoesBasicas()
    const correcoesAplicadas = []
    
    for (const [errado, correto] of Object.entries(correcoes)) {
      const regex = new RegExp(`\\b${errado}\\b`, 'gi')
      if (regex.test(textoCorrigido)) {
        textoCorrigido = textoCorrigido.replace(regex, correto)
        correcoesAplicadas.push({ errado, correto })
      }
    }
    
    return textoCorrigido
  }

  /**
   * Conta número de correções
   */
  contarCorrecoes(original, corrigido) {
    const palavrasOriginal = original.toLowerCase().split(/\s+/)
    const palavrasCorrigido = corrigido.toLowerCase().split(/\s+/)
    
    let correcoes = 0
    for (let i = 0; i < Math.min(palavrasOriginal.length, palavrasCorrigido.length); i++) {
      if (palavrasOriginal[i] !== palavrasCorrigido[i]) {
        correcoes++
      }
    }
    
    return correcoes
  }

  /**
   * Lista todas as correções encontradas
   */
  listarCorrecoes(texto) {
    const correcoes = this.getCorrecoesBasicas()
    const palavras = texto.toLowerCase().split(/\s+/)
    const encontradas = []
    
    for (const palavra of palavras) {
      const limpa = palavra.replace(/[.,!?;:]/g, '')
      if (correcoes[limpa]) {
        encontradas.push({
          original: palavra,
          sugestao: correcoes[limpa],
          tipo: this.classificarErro(limpa, correcoes[limpa])
        })
      }
    }
    
    return encontradas
  }

  /**
   * Classifica o tipo de erro
   */
  classificarErro(original, correcao) {
    // Verificar troca de letras similares
    const trocasComuns = [
      { letras: ['b', 'd'], tipo: 'troca_b_d' },
      { letras: ['d', 'b'], tipo: 'troca_d_b' },
      { letras: ['p', 'q'], tipo: 'troca_p_q' },
      { letras: ['q', 'p'], tipo: 'troca_q_p' },
      { letras: ['m', 'n'], tipo: 'troca_m_n' },
      { letras: ['n', 'm'], tipo: 'troca_n_m' }
    ]
    
    for (let troca of trocasComuns) {
      if (original.includes(troca.letras[0]) && correcao.includes(troca.letras[1])) {
        return troca.tipo
      }
    }
    
    // Verificar inversão de sílabas
    const inversoes = ['ao', 'oa', 'ou', 'uo', 'ei', 'ie', 'ai', 'ia']
    for (let inv of inversoes) {
      if (original.includes(inv) && correcao.includes(inv.split('').reverse().join(''))) {
        return 'inversao_silabas'
      }
    }
    
    return 'erro_fonetico'
  }

  /**
   * Simplifica texto para facilitar leitura
   */
  async simplificarTexto(texto) {
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua_chave_api_aqui') {
        const prompt = `
Simplifique o seguinte texto para facilitar a leitura, especialmente para pessoas com dislexia:

Texto original: "${texto}"

Instruções:
1. Divida frases longas em frases mais curtas
2. Substitua palavras complexas por sinônimos mais simples quando possível
3. Adicione espaçamento entre parágrafos
4. Mantenha o significado original
5. Use linguagem clara e direta

Texto simplificado:
`
        const response = await openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é um assistente especializado em simplificação de textos para acessibilidade.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })

        return {
          sucesso: true,
          textoSimplificado: response.choices[0].message.content.trim(),
          metodo: 'ia'
        }
      }
      
      // Fallback: formatação básica
      const textoSimplificado = this.formatarBasico(texto)
      
      return {
        sucesso: true,
        textoSimplificado,
        metodo: 'basico',
        aviso: 'Usando formatação básica'
      }
    } catch (error) {
      console.error('Erro ao simplificar texto:', error)
      return {
        sucesso: false,
        erro: error.message
      }
    }
  }

  /**
   * Formatação básica do texto
   */
  formatarBasico(texto) {
    // Dividir em parágrafos menores
    let textoFormatado = texto
      .split('\n')
      .map(linha => {
        if (linha.length > 100) {
          const palavras = linha.split(' ')
          let novaLinha = ''
          let linhaAtual = ''
          
          for (const palavra of palavras) {
            if ((linhaAtual + ' ' + palavra).length <= 100) {
              linhaAtual += (linhaAtual ? ' ' : '') + palavra
            } else {
              novaLinha += (novaLinha ? '\n' : '') + linhaAtual
              linhaAtual = palavra
            }
          }
          if (linhaAtual) {
            novaLinha += (novaLinha ? '\n' : '') + linhaAtual
          }
          return novaLinha
        }
        return linha
      })
      .join('\n\n')
    
    return textoFormatado
  }

  /**
   * Analisa texto para detectar dificuldades de leitura
   */
  analisarTexto(texto) {
    const palavras = texto.split(/\s+/).filter(p => p.length > 0)
    const frases = texto.split(/[.!?]+/).filter(f => f.trim().length > 0)
    
    if (frases.length === 0) {
      return {
        sucesso: true,
        dificuldade: 'baixa',
        metricas: {
          totalPalavras: palavras.length,
          totalFrases: 0,
          palavrasPorFrase: 0,
          palavrasLongas: 0,
          palavrasMuitoLongas: 0,
          errosFoneticos: []
        },
        recomendacoes: []
      }
    }
    
    // Calcular métricas
    const palavrasPorFrase = palavras.length / frases.length
    const palavrasLongas = palavras.filter(p => p.length > 8).length
    const palavrasMuitoLongas = palavras.filter(p => p.length > 12).length
    
    // Detectar erros fonéticos
    const errosFoneticos = this.listarCorrecoes(texto)
    
    // Determinar dificuldade
    let dificuldade = 'baixa'
    let pontuacao = 0
    
    if (palavrasPorFrase > 20) pontuacao += 2
    else if (palavrasPorFrase > 15) pontuacao += 1
    
    if (palavrasLongas > palavras.length * 0.3) pontuacao += 2
    else if (palavrasLongas > palavras.length * 0.2) pontuacao += 1
    
    if (palavrasMuitoLongas > 5) pontuacao += 1
    
    if (errosFoneticos.length > 5) pontuacao += 2
    else if (errosFoneticos.length > 2) pontuacao += 1
    
    if (pontuacao >= 3) dificuldade = 'alta'
    else if (pontuacao >= 1) dificuldade = 'media'
    
    // Gerar recomendações
    const recomendacoes = []
    
    if (errosFoneticos.length > 0) {
      recomendacoes.push({
        tipo: 'corrigir',
        descricao: `${errosFoneticos.length} erro(s) fonético(s) detectado(s)`,
        acao: 'corrigir',
        detalhes: errosFoneticos.slice(0, 5)
      })
    }
    
    if (dificuldade === 'alta') {
      recomendacoes.push({
        tipo: 'simplificar',
        descricao: 'Texto muito complexo. Simplificar para facilitar leitura.',
        acao: 'simplificar'
      })
      recomendacoes.push({
        tipo: 'quebrar',
        descricao: 'Dividir em parágrafos menores',
        acao: 'quebrar_paragrafos'
      })
    }
    
    if (dificuldade === 'media') {
      recomendacoes.push({
        tipo: 'formatar',
        descricao: 'Melhorar formatação para leitura',
        acao: 'formatar'
      })
    }
    
    recomendacoes.push({
      tipo: 'leitura',
      descricao: 'Ativar leitura assistida',
      acao: 'leitura_assistida'
    })
    
    return {
      sucesso: true,
      dificuldade,
      metricas: {
        totalPalavras: palavras.length,
        totalFrases: frases.length,
        palavrasPorFrase: Math.round(palavrasPorFrase * 10) / 10,
        palavrasLongas,
        palavrasMuitoLongas,
        errosFoneticos: errosFoneticos.length
      },
      errosFoneticos: errosFoneticos.slice(0, 10),
      recomendacoes
    }
  }
}

module.exports = new PhonService()