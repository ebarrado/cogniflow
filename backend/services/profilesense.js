const cosmos = require('./cosmos');
const rag = require('./rag');

// Cache em memória para fallback rápido
const historicoUsuarios = {};

class ProfileSenseService {
  constructor() {
    this.historicoUsuarios = {};
    this.inicializado = false;
  }

  async init() {
    if (this.inicializado) return;
    console.log('🧠 ProfileSense inicializado');
    this.inicializado = true;
  }

  async registrarInteracao(userId, dados) {
    console.log(`📝 ProfileSense: registrando interação para ${userId}`);
    
    // 1. Salvar em memória (cache rápido)
    if (!historicoUsuarios[userId]) {
      historicoUsuarios[userId] = [];
    }

    const interacao = {
      ...dados,
      timestamp: Date.now(),
      userId
    };

    historicoUsuarios[userId].push(interacao);
    
    // Manter só últimas 20 interações em memória
    historicoUsuarios[userId] = historicoUsuarios[userId].slice(-20);

    // 2. Salvar no Cosmos DB (persistência)
    try {
      await cosmos.salvar('eventos', {
        userId,
        tipo: 'interacao',
        ...dados,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Interação salva no Cosmos para ${userId}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao salvar no Cosmos: ${error.message}`);
    }

    // 3. Salvar no RAG service (para enriquecimento)
    try {
      await rag.salvarInteracao(userId, {
        tipo: 'interacao',
        ...dados
      });
    } catch (error) {
      console.warn(`⚠️ Erro ao salvar no RAG: ${error.message}`);
    }

    return interacao;
  }

  async classificar(userId, dadosAtuais = {}) {
    console.log(`🧠 ProfileSense: classificando usuário ${userId}`);
    
    // 1. Buscar histórico do Cosmos via RAG
    let historicoRAG = null;
    let score = {
      executivo: 0,
      contextual: 0,
      fonologico: 0
    };
    
    try {
      historicoRAG = await rag.buscarHistorico(userId, { limit: 30 });
      if (historicoRAG.success && historicoRAG.historico.length > 0) {
        console.log(`📚 RAG: ${historicoRAG.historico.length} registros encontrados`);
        
        // Analisar histórico do RAG
        for (const item of historicoRAG.historico.itens || []) {
          // Scores anteriores
          if (item.cognitive?.score) {
            score.executivo += item.cognitive.score.executivo || 0;
            score.contextual += item.cognitive.score.contextual || 0;
            score.fonologico += item.cognitive.score.fonologico || 0;
          }
          
          // Métricas diretas
          if (item.temListaTarefas) score.executivo += 1;
          if (item.temPrazos) score.executivo += 1;
          if (item.errosFoneticos) score.fonologico += Math.min(item.errosFoneticos, 3);
          if (item.textoLongo) score.fonologico += 1;
          if (item.temAmbiguidade) score.contextual += 1;
        }
        
        // Aplicar peso do perfil
        if (historicoRAG.historico.perfil?.cargaPredominante === 'executivo') {
          score.executivo += 2;
        } else if (historicoRAG.historico.perfil?.cargaPredominante === 'contextual') {
          score.contextual += 2;
        } else if (historicoRAG.historico.perfil?.cargaPredominante === 'fonologico') {
          score.fonologico += 2;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar RAG: ${error.message}`);
    }
    
    // 2. Buscar histórico em memória (fallback rápido)
    const historicoMemoria = historicoUsuarios[userId] || [];
    if (historicoMemoria.length > 0) {
      console.log(`📚 Memória: ${historicoMemoria.length} registros encontrados`);
      
      historicoMemoria.forEach(h => {
        // Métricas baseadas em tempo/resposta
        if (h.tempoResposta > 3000) score.contextual += 1;
        if (h.releituras > 1) score.contextual += 1;
        if (h.tamanhoTexto > 200) score.fonologico += 1;
        if (h.trocaRapidaTarefa) score.executivo += 1;
        if (h.latenciaAlta) score.executivo += 1;
        
        // Métricas baseadas em conteúdo
        if (h.temListaTarefas) score.executivo += 2;
        if (h.temPrazos) score.executivo += 2;
        if (h.temNumeracao) score.executivo += 1;
        if (h.temPerguntas) score.contextual += 1;
        if (h.temAmbiguidade) score.contextual += 2;
        if (h.textoLongo) score.fonologico += 1;
        if (h.errosFoneticos && h.errosFoneticos > 0) score.fonologico += Math.min(h.errosFoneticos, 3);
      });
    }
    
    // 3. Adicionar dados atuais (maior peso)
    if (dadosAtuais.temListaTarefas) score.executivo += 3;
    if (dadosAtuais.temPrazos) score.executivo += 3;
    if (dadosAtuais.temNumeracao) score.executivo += 2;
    if (dadosAtuais.temPerguntas) score.contextual += 2;
    if (dadosAtuais.temAmbiguidade) score.contextual += 3;
    if (dadosAtuais.textoLongo) score.fonologico += 2;
    if (dadosAtuais.errosFoneticos && dadosAtuais.errosFoneticos > 0) {
      score.fonologico += Math.min(dadosAtuais.errosFoneticos * 2, 5);
    }
    if (dadosAtuais.palavras > 100) score.fonologico += 1;
    if (dadosAtuais.revisoes > 3) score.executivo += 1;
    
    // Log para debug
    console.log('📊 Scores ProfileSense:');
    console.log(`   Executivo: ${score.executivo}`);
    console.log(`   Contextual: ${score.contextual}`);
    console.log(`   Fonológico: ${score.fonologico}`);
    
    // Determinar estado ativo (limiar >= 1)
    let estado = 'neutro';
    let agenteAtivo = null;
    let confianca = 0.5;
    
    if (score.executivo >= 1) {
      estado = 'executivo';
      agenteAtivo = 'FocusAgent';
      confianca = Math.min(0.95, 0.5 + score.executivo * 0.05);
      console.log(`✅ FocusAgent ativado (score: ${score.executivo})`);
    } 
    else if (score.contextual >= 1) {
      estado = 'contextual';
      agenteAtivo = 'ContextAgent';
      confianca = Math.min(0.95, 0.5 + score.contextual * 0.05);
      console.log(`✅ ContextAgent ativado (score: ${score.contextual})`);
    }
    else if (score.fonologico >= 1) {
      estado = 'fonologico';
      agenteAtivo = 'PhonAgent';
      confianca = Math.min(0.95, 0.5 + score.fonologico * 0.05);
      console.log(`✅ PhonAgent ativado (score: ${score.fonologico})`);
    }
    else {
      console.log(`⚪ Estado neutro`);
    }
    
    // Preparar justificativa
    const justificativa = this.gerarJustificativa(estado, score, dadosAtuais);
    
    // Salvar classificação no histórico
    const classificacao = {
      userId,
      timestamp: Date.now(),
      estado,
      score,
      confianca,
      agenteAtivo,
      justificativa,
      dadosAtuais: {
        palavras: dadosAtuais.palavras,
        errosFoneticos: dadosAtuais.errosFoneticos,
        temListaTarefas: dadosAtuais.temListaTarefas,
        temPrazos: dadosAtuais.temPrazos,
        temAmbiguidade: dadosAtuais.temAmbiguidade
      }
    };
    
    // Salvar classificação
    await this.registrarInteracao(userId, {
      tipo: 'classificacao',
      ...classificacao
    });
    
    return {
      estado: [estado],
      score,
      confianca,
      agenteAtivo,
      justificativa,
      perfil: historicoRAG?.success ? historicoRAG.historico.perfil : null,
      fonte: historicoRAG?.success && historicoRAG.historico.length > 0 ? 'rag' : 'memoria'
    };
  }
  
  gerarJustificativa(estado, score, dadosAtuais) {
    if (estado === 'executivo') {
      const motivos = [];
      if (dadosAtuais.temListaTarefas) motivos.push('lista de tarefas');
      if (dadosAtuais.temPrazos) motivos.push('prazos definidos');
      if (dadosAtuais.temNumeracao) motivos.push('itens numerados');
      if (score.executivo > 3) motivos.push('múltiplas tarefas');
      
      if (motivos.length > 0) {
        return `Carga executiva detectada: ${motivos.join(', ')}. ${dadosAtuais.palavras || ''} palavras, ${dadosAtuais.revisoes || 0} revisões.`;
      }
      return 'Estrutura de tarefas e organização identificada.';
    }
    
    if (estado === 'contextual') {
      const motivos = [];
      if (dadosAtuais.temAmbiguidade) motivos.push('termos ambíguos');
      if (dadosAtuais.temPerguntas) motivos.push('perguntas sem contexto');
      if (score.contextual > 2) motivos.push('múltiplas ambiguidades');
      
      if (motivos.length > 0) {
        return `Carga contextual detectada: ${motivos.join(', ')}. Necessário esclarecer objetivos e prazos.`;
      }
      return 'Informações implícitas ou ambíguas identificadas.';
    }
    
    if (estado === 'fonologico') {
      const motivos = [];
      if (dadosAtuais.errosFoneticos > 0) motivos.push(`${dadosAtuais.errosFoneticos} erro(s) fonético(s)`);
      if (dadosAtuais.textoLongo) motivos.push('texto extenso');
      if (dadosAtuais.palavras > 100) motivos.push(`${dadosAtuais.palavras} palavras`);
      
      if (motivos.length > 0) {
        return `Carga fonológica detectada: ${motivos.join(', ')}. Sugiro revisão ortográfica ou leitura assistida.`;
      }
      return 'Volume de texto significativo. Sugerir formatação para facilitar leitura.';
    }
    
    return 'Monitoramento passivo - sem sinais de sobrecarga detectados.';
  }
  
  async getPerfil(userId) {
    const historico = historicoUsuarios[userId] || [];
    
    if (historico.length === 0) {
      return null;
    }
    
    // Calcular perfil baseado no histórico
    const cargas = { executivo: 0, contextual: 0, fonologico: 0 };
    const agentesUsados = {};
    let totalInteracoes = 0;
    
    for (const item of historico) {
      if (item.estado) {
        cargas[item.estado] = (cargas[item.estado] || 0) + 1;
        totalInteracoes++;
      }
      if (item.agenteAtivo) {
        agentesUsados[item.agenteAtivo] = (agentesUsados[item.agenteAtivo] || 0) + 1;
      }
    }
    
    // Encontrar carga predominante
    let cargaPredominante = 'neutro';
    let maxCarga = 0;
    for (const [carga, valor] of Object.entries(cargas)) {
      if (valor > maxCarga) {
        maxCarga = valor;
        cargaPredominante = carga;
      }
    }
    
    return {
      userId,
      totalInteracoes,
      cargaPredominante,
      confianca: maxCarga / totalInteracoes || 0,
      agentesUsados,
      historicoRecente: historico.slice(-5)
    };
  }
  
  async reset(userId) {
    if (userId) {
      delete historicoUsuarios[userId];
      console.log(`🔄 Perfil resetado para ${userId}`);
    } else {
      Object.keys(historicoUsuarios).forEach(key => {
        delete historicoUsuarios[key];
      });
      console.log(`🔄 Todos os perfis resetados`);
    }
    return { success: true };
  }
}

module.exports = new ProfileSenseService();