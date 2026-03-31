// backend/services/cosmos.js
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

let container = null;
const mem = { 
  eventos: [], 
  insights: [],
  historico: {}
};

async function init() {
  console.log('🚀 Inicializando Cosmos DB...');
  console.log('USE_COSMOS:', process.env.USE_COSMOS);
  console.log('Endpoint:', process.env.COSMOS_ENDPOINT);
  console.log('Key:', process.env.COSMOS_KEY ? '✅ presente' : '❌ ausente');
  console.log('Database:', process.env.COSMOS_DATABASE);
  console.log('Container:', process.env.COSMOS_CONTAINER);

  if (process.env.USE_COSMOS !== 'true') {
    console.log('📦 Cosmos DB: modo in-memory');
    await carregarDadosDemo();
    return;
  }

  try {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });

    console.log('🔄 Testando conexão com Cosmos DB...');
    await client.getDatabaseAccount();
    console.log('✅ Conexão com Cosmos DB estabelecida!');

    const { database } = await client.databases.createIfNotExists({
      id: process.env.COSMOS_DATABASE || 'profilesense-db',
    });
    console.log('✅ Database:', database.id);

    const { container: c } = await database.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER || 'eventos',
      partitionKey: { paths: ['/sessionId'] },
    });
    console.log('✅ Container:', c.id);

    container = c;
    console.log('🎉 Cosmos DB configurado com sucesso em MODO CLOUD!');

    // Contar documentos
    const { resources } = await container.items.query("SELECT VALUE COUNT(1) FROM c").fetchAll();
    console.log(`📊 Documentos no Cosmos DB: ${resources[0] || 0}`);

  } catch (err) {
    console.error('❌ Erro ao conectar ao Cosmos DB:', err.message);
    console.log('📦 Fallback: modo in-memory');
    container = null;
    await carregarDadosDemo();
  }
}

async function carregarDadosDemo() {
  console.log('📦 Carregando dados de demonstração...');
  
  const exemplos = [
    {
      userId: 'user-001',
      sessionId: 'user-001',
      timestamp: new Date().toISOString(),
      tipoRegistro: 'eventos',
      cognitive: { state: ['executivo'], score: { executivo: 5, contextual: 0, fonologico: 0 } },
      metrics: { wordCount: 28 },
      conteudo: 'Projeto novo precisa ser entregue até semana que vem. Tarefas: 1. Criar arquitetura'
    },
    {
      userId: 'user-001',
      sessionId: 'user-001',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      tipoRegistro: 'eventos',
      cognitive: { state: ['executivo'], score: { executivo: 3, contextual: 0, fonologico: 0 } },
      metrics: { wordCount: 45 },
      conteudo: 'Preciso revisar o código e preparar apresentação'
    },
    {
      userId: 'user-001',
      sessionId: 'user-001',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      tipoRegistro: 'eventos',
      cognitive: { state: ['fonologico'], score: { executivo: 0, contextual: 0, fonologico: 3 } },
      metrics: { wordCount: 32, errosFoneticos: 2 },
      conteudo: 'Preciso dazer uma correção no documendo'
    },
    {
      userId: 'user-001',
      sessionId: 'user-001',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      tipoRegistro: 'eventos',
      cognitive: { state: ['contextual'], score: { executivo: 0, contextual: 3, fonologico: 0 } },
      metrics: { wordCount: 18 },
      conteudo: 'Alguém precisa resolver aquilo depois'
    }
  ];
  
  for (const exemplo of exemplos) {
    await salvarEmMemoria('eventos', exemplo);
  }
  
  console.log(`✅ ${exemplos.length} dados de exemplo carregados no cache`);
}

async function salvar(colecao, doc) {
  const sessionId = doc.sessionId || doc.userId || 'anonymous';

  const item = {
    ...doc,
    id: `${colecao}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tipoRegistro: colecao,
    sessionId,
    _ts: new Date().toISOString(),
  };

  if (container) {
    try {
      await container.items.create(item);
      console.log(`✅ ${colecao} salvo no Cosmos DB`);
      salvarEmMemoria(colecao, item);
    } catch (e) {
      console.warn('⚠️ Erro ao salvar no Cosmos:', e.message);
      salvarEmMemoria(colecao, item);
    }
  } else {
    salvarEmMemoria(colecao, item);
  }

  return item;
}

function salvarEmMemoria(colecao, item) {
  if (!mem[colecao]) {
    mem[colecao] = [];
  }
  mem[colecao].push(item);
  
  const userId = item.userId || item.sessionId;
  if (userId && userId !== 'anonymous') {
    if (!mem.historico[userId]) {
      mem.historico[userId] = [];
    }
    mem.historico[userId].unshift(item);
    mem.historico[userId] = mem.historico[userId].slice(0, 100);
  }
}

async function listar(colecao = 'eventos', limit = 100) {
  if (container) {
    try {
      const query = `SELECT * FROM c WHERE c.tipoRegistro = '${colecao}' ORDER BY c._ts DESC OFFSET 0 LIMIT ${limit}`;
      const { resources } = await container.items.query(query).fetchAll();
      return resources;
    } catch (err) {
      console.warn('⚠️ Erro ao listar:', err.message);
      return mem[colecao] || [];
    }
  }
  return (mem[colecao] || []).slice(0, limit);
}

async function contar(colecao = 'eventos') {
  if (container) {
    try {
      const query = `SELECT VALUE COUNT(1) FROM c WHERE c.tipoRegistro = '${colecao}'`;
      const { resources } = await container.items.query(query).fetchAll();
      return resources[0] || 0;
    } catch (err) {
      console.warn('⚠️ Erro ao contar:', err.message);
      return mem[colecao]?.length || 0;
    }
  }
  return mem[colecao]?.length || 0;
}

async function buscarHistorico(userId, limit = 100) {
  console.log(`🔍 Cosmos: buscando histórico para ${userId} (limit: ${limit})`);
  
  if (container) {
    try {
      // Buscar TODOS os documentos do usuário (eventos E insights)
      const query = `
        SELECT * FROM c 
        WHERE c.userId = '${userId}' OR c.sessionId = '${userId}'
        ORDER BY c._ts DESC 
        OFFSET 0 LIMIT ${limit}
      `;
      const { resources } = await container.items.query(query).fetchAll();
      console.log(`📚 Cosmos DB: ${resources.length} registros encontrados para ${userId}`);
      console.log(`   Tipos: eventos=${resources.filter(r => r.tipoRegistro === 'eventos').length}, insights=${resources.filter(r => r.tipoRegistro === 'insights').length}`);
      
      if (!mem.historico) mem.historico = {};
      mem.historico[userId] = resources;
      
      return resources;
    } catch (err) {
      console.warn('⚠️ Erro ao buscar histórico:', err.message);
      return [];
    }
  }
  
  return [];
}

async function estatisticas() {
  const stats = {
    modo: container ? 'cosmos' : 'in-memory',
    registros: {
      eventos: await contar('eventos'),
      insights: await contar('insights')
    },
    cacheSize: mem.historico ? Object.keys(mem.historico).length : 0
  };
  
  console.log(`📊 Stats: ${stats.modo} - ${stats.registros.eventos} eventos, ${stats.registros.insights} insights`);
  
  return stats;
}

function connected() {
  return !!container;
}

module.exports = {
  init,
  salvar,
  listar,
  contar,
  buscarHistorico,
  estatisticas,
  connected
};