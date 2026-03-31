// backend/agents/phonAgent.js
const phonService = require('../services/phon')

class PhonAgent {
  constructor() {
    this.name = 'PhonAgent'
    this.version = '1.0.0'
    this.description = 'Agente especializado em correção fonética e leitura assistida'
  }

  async process(texto, options = {}) {
    try {
      const { action = 'analisar' } = options
      
      let result = {}
      
      switch (action) {
        case 'corrigir':
          result = await phonService.corrigirTexto(texto)
          break
        case 'simplificar':
          result = await phonService.simplificarTexto(texto)
          break
        case 'analisar':
        default:
          result = phonService.analisarTexto(texto)
          break
      }
      
      return {
        success: true,
        agent: this.name,
        ...result
      }
    } catch (error) {
      console.error('Erro no PhonAgent:', error)
      return {
        success: false,
        agent: this.name,
        error: error.message
      }
    }
  }
}

module.exports = new PhonAgent()