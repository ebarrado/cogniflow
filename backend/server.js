// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

console.log('🚀 Iniciando servidor CogniFlow...');
console.log(`📅 ${new Date().toISOString()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 PORT: ${process.env.PORT || 3000}`);

// ==================== APP ====================
const app = express();
//const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 8080;
const frontendPath = path.join(__dirname, '../frontend/dist');

// ==================== SERVIÇOS ====================
let cosmos, rag, profileSenseService, foundry;

const serviceStatus = {
  cosmos: false,
  rag: false,
  profilesense: false,
  foundry: false
};

try {
  cosmos = require('./services/cosmos');
  serviceStatus.cosmos = true;
  console.log('✅ Cosmos carregado');
} catch (e) {
  console.warn('⚠️ Cosmos não disponível:', e.message);
  console.warn('   O servidor continuará em modo in-memory');
  cosmos = null;
}

try {
  rag = require('./services/rag');
  serviceStatus.rag = true;
  console.log('✅ RAG carregado');
} catch (e) {
  console.warn('⚠️ RAG não disponível:', e.message);
  rag = null;
}

try {
  profileSenseService = require('./services/profilesense');
  serviceStatus.profilesense = true;
  console.log('✅ ProfileSense carregado');
} catch (e) {
  console.warn('⚠️ ProfileSense não disponível:', e.message);
  profileSenseService = null;
}

try {
  foundry = require('./services/foundry');
  serviceStatus.foundry = true;
  console.log('✅ Foundry carregado');
} catch (e) {
  console.warn('⚠️ Foundry não disponível:', e.message);
  foundry = null;
}

// ==================== ROTAS IMPORTADAS ====================
const agents = require('./routes/agents');
const data = require('./routes/data');
const profileSenseRoutes = require('./routes/profilesense');

// ==================== MIDDLEWARES ====================
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  req.startTime = Date.now();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📥 [${req.requestId}] ${req.method} ${req.path}`);
  }

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📤 [${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
});

// ==================== ROTAS DE API ====================
app.get('/api/health', async (req, res) => {
  try {
    const stats = cosmos && typeof cosmos.estatisticas === 'function'
      ? await cosmos.estatisticas()
      : { modo: 'in-memory', registros: 0, cacheSize: 0 };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        mode: stats.modo || 'in-memory',
        connected: cosmos && typeof cosmos.connected === 'function' ? cosmos.connected() : false,
        registros: stats.registros || 0,
        cacheSize: stats.cacheSize || 0
      },
      services: serviceStatus,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: serviceStatus
    });
  }
});

app.get('/api/db-status', async (req, res) => {
  try {
    if (cosmos && typeof cosmos.estatisticas === 'function') {
      const stats = await cosmos.estatisticas();
      res.json({
        mode: stats.modo,
        connected: typeof cosmos.connected === 'function' ? cosmos.connected() : false,
        registros: stats.registros,
        cacheSize: stats.cacheSize,
        collections: stats.collections || [],
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        mode: 'in-memory',
        connected: false,
        registros: 0,
        timestamp: new Date().toISOString(),
        message: 'Cosmos DB service not available'
      });
    }
  } catch (error) {
    console.error('❌ DB status error:', error);
    res.status(500).json({
      mode: 'error',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/rag/historico/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId parameter is required'
      });
    }

    console.log(`🔍 RAG: buscando histórico para ${userId} (limit: ${limit}, offset: ${offset})`);

    if (!rag || typeof rag.buscarHistorico !== 'function') {
      return res.status(503).json({
        success: false,
        error: 'RAG service not available'
      });
    }

    const result = await rag.buscarHistorico(userId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch history'
      });
    }

    const historico = result.historico?.itens || [];
    const perfil = result.historico?.perfil || null;
    const fonte = result.fonte || 'cache';
    const total = result.historico?.total || historico.length;

    res.json({
      success: true,
      userId,
      total,
      returned: historico.length,
      offset: parseInt(offset, 10),
      historico,
      perfil,
      fonte,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no RAG:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/eventos', async (req, res) => {
  try {
    const evento = req.body;

    if (!evento || !evento.tipo) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }

    console.log(`📊 Evento recebido: ${evento.tipo}`);

    const enrichedEvent = {
      ...evento,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (cosmos && typeof cosmos.salvar === 'function') {
      await cosmos.salvar('eventos', enrichedEvent);
    } else {
      console.log('💾 Evento salvo em memória:', enrichedEvent);
    }

    res.json({
      success: true,
      message: 'Evento registrado com sucesso',
      eventId: enrichedEvent.id || null,
      timestamp: enrichedEvent.timestamp
    });
  } catch (error) {
    console.error('❌ Erro ao salvar evento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/eventos', async (req, res) => {
  try {
    const { limit = 50, offset = 0, tipo } = req.query;

    let eventos = [];
    let total = 0;

    if (cosmos && typeof cosmos.listar === 'function') {
      const result = await cosmos.listar('eventos', parseInt(limit, 10), parseInt(offset, 10));
      eventos = result.itens || result || [];
      total = result.total || eventos.length;

      if (tipo) {
        eventos = eventos.filter(e => e.tipo === tipo);
        total = eventos.length;
      }
    } else {
      console.log('⚠️ Cosmos DB not available, returning empty list');
    }

    res.json({
      success: true,
      total,
      returned: eventos.length,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      eventos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao listar eventos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rotas importadas
app.use('/api/agents', agents);
app.use('/api', data);
app.use('/api/profilesense', profileSenseRoutes);

// Informações da API
app.get('/api', (req, res) => {
  res.json({
    nome: 'CogniFlow API',
    versao: '1.0.0',
    status: 'online',
    ambiente: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentacao: `${req.protocol}://${req.get('host')}/api/docs`,
    endpoints: {
      health: { method: 'GET', path: '/api/health', description: 'Health check' },
      dbStatus: { method: 'GET', path: '/api/db-status', description: 'Database status' },
      agents: {
        focus: { method: 'POST', path: '/api/agents/focus', description: 'FocusAgent' },
        context: { method: 'POST', path: '/api/agents/context', description: 'ContextAgent' },
        phon: { method: 'POST', path: '/api/agents/phon', description: 'PhonAgent' },
        calmguard: { method: 'POST', path: '/api/agents/calmguard', description: 'CalmGuard' },
        notify: { method: 'POST', path: '/api/agents/notify', description: 'NotifyAgent' },
        blendit: { method: 'POST', path: '/api/agents/blendit', description: 'BlendIt' }
      }
    }
  });
});

// ==================== FRONTEND REACT ====================
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== 404 API ====================
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.requestId,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// ==================== GRACEFUL SHUTDOWN ====================
let server;

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
  }

  if (cosmos && typeof cosmos.close === 'function') {
    try {
      await cosmos.close();
      console.log('✅ Cosmos DB connection closed');
    } catch (error) {
      console.error('❌ Error closing Cosmos DB:', error);
    }
  }

  console.log('👋 Graceful shutdown completed');
  process.exit(0);
};

// ==================== START SERVER ====================
async function startServer() {
  try {
    console.log('\n🔄 Inicializando serviços...');

    if (cosmos && typeof cosmos.init === 'function') {
      await cosmos.init();
      console.log('✅ Cosmos DB inicializado');
    } else {
      console.log('⚠️ Cosmos DB não inicializado (modo in-memory)');
    }

    if (foundry && typeof foundry.initFoundry === 'function') {
      foundry.initFoundry();
      console.log('✅ Foundry inicializado');
    }

    if (rag && typeof rag.init === 'function') {
      await rag.init();
      console.log('✅ RAG inicializado');
    }

    if (profileSenseService && typeof profileSenseService.init === 'function') {
      await profileSenseService.init();
      console.log('✅ ProfileSense inicializado');
    }

    server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Servidor CogniFlow rodando em http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`📡 API:      http://localhost:${PORT}/api`);
      console.log(`❤️ Health:   http://localhost:${PORT}/api/health`);
      console.log('\n📊 Status dos Serviços:');
      Object.entries(serviceStatus).forEach(([service, status]) => {
        console.log(`   ${service}: ${status ? '✅' : '⚠️'}`);
      });
      console.log('\n');
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});