// backend/services/rag.js
const cosmos = require('./cosmos');
const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
require('dotenv').config();

class RAGService {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
    this.searchClient = null;
    this.useSearch = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🧠 Inicializando RAG Service...');
    
    try {
      await cosmos.init();
      this.initSearch();
      
      const stats = await cosmos.estatisticas();
      console.log(`📊 RAG Service: ${stats.registros?.eventos || 0} eventos disponíveis`);
      console.log(`🔍 Azure Search: ${this.useSearch ? '✅ CONECTADO' : '⚠️ OFFLINE'}`);
      
      this.initialized = true;
      console.log('✅ RAG Service inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar RAG:', error.message);
      this.initialized = false;
    }
  }

  initSearch() {
    const indexName = process.env.AZURE_SEARCH_INDEX || 'profilesense';
    console.log(`🔍 RAG: inicializando Azure Search com índice: ${indexName}`);
    
    if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
      console.log('⚠️ Azure Search não configurado, usando apenas Cosmos DB');
      this.useSearch = false;
      return false;
    }

    try {
      this.searchClient = new SearchClient(
        process.env.AZURE_SEARCH_ENDPOINT,
        indexName,
        new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
      );
      this.useSearch = true;
      console.log(`✅ Azure AI Search inicializado (índice: ${indexName})`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Azure Search:', error.message);
      this.useSearch = false;
      return false;
    }
  }

  // ==================== BUSCAR HISTÓRICO (PRINCIPAL) ====================
  async buscarHistorico(userId, options = {}) {
    const { limit = 100, useSearch = true } = options;
    
    console.log(`🔍 RAG: buscando histórico para ${userId} (limit: ${limit})`);
    
    try {
      let historico = [];
      let fonte = 'cache';
      
      // PRIORIDADE: Azure Search
      if (useSearch && this.useSearch) {
        console.log(`🔍 Buscando no Azure Search...`);
        const searchResults = await this.buscarNoSearch(userId, limit);
        if (searchResults.length > 0) {
          historico = searchResults;
          fonte = 'azure-search';
          console.log(`✅ Azure Search: ${historico.length} registros encontrados`);
        } else {
          console.log(`⚠️ Azure Search retornou 0 registros`);
        }
      }
      
      // Fallback: Cosmos DB
      if (historico.length === 0 && cosmos && typeof cosmos.buscarHistorico === 'function') {
        console.log(`📦 Buscando no Cosmos DB...`);
        historico = await cosmos.buscarHistorico(userId, limit);
        fonte = cosmos.connected() ? 'cosmos' : 'cache';
        console.log(`📚 ${fonte}: ${historico.length} registros`);
      }
      
      const enriquecido = this.enriquecerHistorico(historico);
      
      return {
        success: true,
        userId,
        total: historico.length,
        historico: enriquecido,
        fonte: fonte,
        metadados: { timestamp: new Date().toISOString() }
      };
      
    } catch (error) {
      console.error('❌ Erro no RAG buscarHistorico:', error.message);
      return {
        success: false,
        userId,
        error: error.message,
        historico: { itens: [], padroes: {}, perfil: null }
      };
    }
  }

  // ==================== BUSCAR NO AZURE SEARCH ====================
  async buscarNoSearch(userId, limit = 20) {
    if (!this.searchClient) return [];
    
    try {
      // Busca TODOS os documentos, sem filtro de userId
      let searchOptions = {
        top: limit,
        includeTotalCount: true,
        select: [
          "id", "userId", "sessionId", "timestamp",
          "cognitiveState", "content"
        ],
        orderBy: ["timestamp desc"]
      };
      
      console.log(`🔍 Buscando no Azure Search (TODOS os usuários) - limit: ${limit}`);
      
      const searchResults = await this.searchClient.search('*', searchOptions);
      
      const results = [];
      for await (const result of searchResults.results) {
        const doc = result.document;
        results.push({
          id: doc.id,
          userId: doc.userId,
          sessionId: doc.sessionId,
          timestamp: doc.timestamp,
          cognitive: {
            state: doc.cognitiveState ? [doc.cognitiveState] : ['neutro'],
            score: { executivo: 0, contextual: 0, fonologico: 0 }
          },
          metrics: { wordCount: 0 },
          conteudo: doc.content || ''
        });
      }
      
      console.log(`📚 Azure Search: ${results.length} registros encontrados`);
      return results;
      
    } catch (error) {
      console.error('❌ Erro na busca do Azure Search:', error.message);
      return [];
    }
  }

  // ==================== BUSCAR CONTEXTO (RAG SEMÂNTICO) ====================
  async buscarContexto(query, userId = null, top = 5) {
    if (!this.useSearch) {
      console.log('⚠️ Azure Search não disponível, usando busca local');
      return this.buscarContextoLocal(query, userId, top);
    }

    try {
      const filter = userId ? `userId eq '${userId}'` : null;

      const searchResults = await this.searchClient.search(query, {
        filter: filter,
        top: top,
        includeTotalCount: true
      });

      const results = [];
      for await (const result of searchResults.results) {
        const doc = result.document;
        results.push({
          content: doc.content || doc.conteudo_legivel || JSON.stringify(doc),
          score: result.score,
          metadata: {
            classificacao: doc.cognitiveState || 'neutro',
            latencia: doc.latencia || 0,
            timestamp: doc.timestamp,
            userId: doc.userId
          }
        });
      }

      console.log(`📚 RAG Semântico: ${results.length} documentos relevantes encontrados`);
      return results;

    } catch (error) {
      console.error('❌ Erro no RAG semântico:', error.message);
      return [];
    }
  }

  // ==================== BUSCA LOCAL (FALLBACK) ====================
  async buscarContextoLocal(query, userId = null, top = 5) {
    console.log(`🔍 Busca local para: "${query}"`);
    
    let historico = [];
    if (userId) {
      const result = await this.buscarHistorico(userId, { limit: 50 });
      if (result.success) {
        historico = result.historico.itens || [];
      }
    }
    
    const palavras = query.toLowerCase().split(' ');
    const relevantes = historico.filter(item => {
      const conteudo = (item.conteudo || '').toLowerCase();
      const cognitiveState = (item.cognitive?.state?.[0] || '').toLowerCase();
      return palavras.some(p => conteudo.includes(p) || cognitiveState.includes(p));
    });
    
    return relevantes.slice(0, top).map(item => ({
      content: item.conteudo || '',
      score: 0.5,
      metadata: {
        classificacao: item.cognitive?.state?.[0] || 'neutro',
        timestamp: item.timestamp
      }
    }));
  }

  // ==================== BUSCAR CONTEXTO COGNITIVO ====================
  async buscarContextoCognitivo(dadosComportamentais, userId, top = 10) {
    const { latencia_media_ms, variacao_latencia, revisoes_texto } = dadosComportamentais || {};
    
    let query = '';
    if (latencia_media_ms > 300) query += 'latência alta ';
    if (variacao_latencia === 'alta') query += 'variação instável ';
    if (revisoes_texto > 5) query += 'muitas revisões ';
    
    if (!query) query = 'padrão comportamental';
    
    return this.buscarContexto(query, userId, top);
  }

  // ==================== ENRIQUECER QUERY COM RAG ====================
  async enriquecerComRAG(query, userId = null) {
    const contextos = await this.buscarContexto(query, userId, 5);
    
    if (contextos.length === 0) {
      return { query, contexto: null, enriquecido: false };
    }
    
    const contextoEnriquecido = contextos.map((ctx, i) => {
      return `[Documento ${i + 1}]: ${ctx.content.substring(0, 500)}\n(Métricas: ${ctx.metadata.classificacao || 'N/A'})`;
    }).join('\n\n');
    
    return {
      query,
      contexto: contextoEnriquecido,
      documentos_relevantes: contextos.length,
      enriquecido: true
    };
  }

  // ==================== ENRIQUECER HISTÓRICO ====================
  enriquecerHistorico(historico) {
    const padroes = {
      cargas: { executivo: 0, contextual: 0, fonologico: 0 },
      horariosAtividade: [],
      agentesUtilizados: new Map(),
      errosFoneticos: []
    };
    
    for (const item of historico) {
      if (item.cognitive?.state) {
        const estado = item.cognitive.state[0];
        if (padroes.cargas[estado] !== undefined) padroes.cargas[estado]++;
      }
      
      if (item.cognitive?.activeAgent) {
        const count = padroes.agentesUtilizados.get(item.cognitive.activeAgent) || 0;
        padroes.agentesUtilizados.set(item.cognitive.activeAgent, count + 1);
      }
      
      if (item.metrics?.errosFoneticos && item.metrics.errosFoneticos > 0) {
        padroes.errosFoneticos.push({
          quantidade: item.metrics.errosFoneticos,
          timestamp: item.timestamp
        });
      }
      
      if (item.timestamp) {
        const hora = new Date(item.timestamp).getHours();
        padroes.horariosAtividade.push(hora);
      }
    }
    
    const cargaPredominante = Object.entries(padroes.cargas)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutro';
    
    const perfil = {
      cargaPredominante,
      agenteMaisUsado: [...padroes.agentesUtilizados.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      horarioPico: this.calcularModa(padroes.horariosAtividade),
      taxaErrosFoneticos: historico.length > 0 ? padroes.errosFoneticos.length / historico.length : 0
    };
    
    return { itens: historico, padroes, perfil };
  }

  calcularModa(arr) {
    if (arr.length === 0) return null;
    const freq = {};
    arr.forEach(val => freq[val] = (freq[val] || 0) + 1);
    const moda = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return moda ? parseInt(moda[0]) : null;
  }

  // ==================== SALVAR INTERAÇÃO ====================
  async salvarInteracao(userId, dados) {
    console.log(`💾 RAG: salvando interação para ${userId}`);
    
    try {
      const item = {
        userId,
        sessionId: userId,
        timestamp: new Date().toISOString(),
        ...dados
      };
      
      if (cosmos && typeof cosmos.salvar === 'function') {
        const result = await cosmos.salvar('eventos', item);
        
        if (!this.cache.has(userId)) this.cache.set(userId, []);
        const cacheHistorico = this.cache.get(userId);
        cacheHistorico.unshift(item);
        this.cache.set(userId, cacheHistorico.slice(0, 100));
        
        return { success: true, id: result.id };
      }
      
      return { success: false, error: 'Cosmos não disponível' };
    } catch (error) {
      console.error('❌ Erro ao salvar interação:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ==================== ESTATÍSTICAS ====================
  async getEstatisticas() {
    try {
      const stats = await cosmos.estatisticas();
      return {
        status: this.initialized ? 'online' : 'offline',
        cacheSize: this.cache.size,
        searchDisponivel: this.useSearch,
        ...stats,
        rag: {
          initialized: this.initialized,
          searchConnected: this.useSearch,
          usersInCache: Array.from(this.cache.keys())
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
        cacheSize: this.cache.size,
        searchDisponivel: false
      };
    }
  }

  // ==================== REINDEXAR ====================
  async reindexar() {
    console.log('🔄 Reindexando dados para RAG...');
    this.cache.clear();
    return { success: true, message: 'Cache do RAG reiniciado' };
  }
}

module.exports = new RAGService();