const express = require('express');
const router = express.Router();

const cosmos = require('../services/cosmos');
const profileSense = require('../agents/profileSense');

// 📥 EVENTOS - salvar um ou vários eventos
router.post('/eventos', async (req, res) => {
  try {
    const eventos = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of eventos) {
      await cosmos.salvar('eventos', ev);
    }

    res.json({
      success: true,
      count: eventos.length
    });
  } catch (e) {
    console.error('❌ Erro em POST /eventos:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

// 📤 EVENTOS - listar eventos
router.get('/eventos', async (req, res) => {
  try {
    const dados = await cosmos.listar('eventos');
    res.json(dados);
  } catch (e) {
    console.error('❌ Erro em GET /eventos:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

// 🧠 INSIGHTS
router.post('/insights', async (req, res) => {
  try {
    const userId = req.body.userId || req.body.sessionId || 'user-001';
    console.log('📥 Insight recebido para usuário:', userId);

    const dadosComportamentais = req.body.dados_comportamentais || {};

    const result = await profileSense.classificar(
      dadosComportamentais,
      userId
    );

    const registro = {
      ...req.body,
      resultado: result,
      userId,
      sessionId: req.body.sessionId || userId
    };

    await cosmos.salvar('insights', registro);

    res.json({
      success: true,
      classificacao: result
    });
  } catch (e) {
    console.error('❌ Erro em POST /insights:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

// 🔍 TESTE RAG
router.post('/test-rag', async (req, res) => {
  try {
    const rag = require('../services/rag');
    const { query, userId } = req.body;

    if (!query) {
      return res.status(400).json({
        erro: 'O campo "query" é obrigatório'
      });
    }

    const resultados = await rag.buscarContexto(query, userId || 'user-001', 5);

    res.json({
      success: true,
      query,
      resultados_encontrados: resultados.length,
      documentos: resultados
    });
  } catch (error) {
    console.error('❌ Erro em POST /test-rag:', error.message);
    res.status(500).json({ erro: error.message });
  }
});

// ❤️ HEALTH
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      cosmos: cosmos.connected() ? 'connected' : 'in-memory',
      eventos: await cosmos.contar('eventos'),
      insights: await cosmos.contar('insights')
    });
  } catch (e) {
    console.error('❌ Erro em GET /health:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

module.exports = router;