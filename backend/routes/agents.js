// backend/routes/agents.js
const express = require('express');
const router = express.Router();

// Importar agentes
const calmGuard    = require('../agents/calmGuard');
const contextAgent = require('../agents/contextAgent');

// ==================== CALMGUARD ====================
router.post('/calmguard', async (req, res) => {
  try {
    const { texto, agenteOrigem } = req.body;
    console.log(`🛡️ CalmGuard: validando texto de ${agenteOrigem}`);
    console.log(`📝 Texto original: "${texto}"`);

    const resultado = await calmGuard.validar(texto, agenteOrigem);

    console.log(`✅ Texto validado: "${resultado.texto_validado}"`);

    res.json({
      success: true,
      agent: 'CalmGuard',
      ...resultado,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// ==================== FOCUSAGENT ====================
router.post('/focus', async (req, res) => {
  try {
    const { tarefa } = req.body;
    console.log('🎯 FocusAgent chamado');

    res.json({
      success: true,
      agent: 'FocusAgent',
      intervencao: `## 📋 Tarefas organizadas\n\n1. ${tarefa || 'Definir objetivo'}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CONTEXTAGENT ====================
router.post('/context', async (req, res) => {
  try {
    const { mensagem, remetente, contextoProfissional } = req.body;
    console.log(`🔍 ContextAgent chamado — remetente: ${remetente}`);

    // 1️⃣ Chamar o motor de análise real
    const analise = await contextAgent.analisar(
      mensagem || '',
      remetente || 'colega',
      contextoProfissional || 'empresa de tecnologia'
    );

    // 2️⃣ Filtrar resposta_segura_sugerida pelo CalmGuard
    const calmRespostaPrincipal = await calmGuard.validar(
      analise.resposta_segura_sugerida || '',
      'ContextAgent'
    );

    // 3️⃣ Filtrar resposta_sugerida de cada interpretação pelo CalmGuard
    const interpretacoesValidadas = await Promise.all(
      (analise.interpretacoes || []).map(async (interp) => {
        const calmInterp = await calmGuard.validar(
          interp.resposta_sugerida || '',
          'ContextAgent'
        );
        return {
          ...interp,
          resposta_sugerida: calmInterp.texto_validado || interp.resposta_sugerida,
        };
      })
    );

    // 4️⃣ Montar resposta enriquecida
    res.json({
      success: true,
      agent: 'ContextAgent',

      // Campos da análise original
      ambiguidade_detectada:      analise.ambiguidade_detectada,
      nivel_ambiguidade:          analise.nivel_ambiguidade,
      resumo_claro:               analise.resumo_claro,
      implicitos_detectados:      analise.implicitos_detectados,
      expectativas_estruturadas:  analise.expectativas_estruturadas,
      risco_de_mal_entendido:     analise.risco_de_mal_entendido,
      traducao_linguagem_indireta: analise.traducao_linguagem_indireta,

      // Interpretações já filtradas pelo CalmGuard
      interpretacoes: interpretacoesValidadas,

      // Rascunho principal: texto seguro validado pelo CalmGuard
      resposta_segura_sugerida: calmRespostaPrincipal.texto_validado
        || analise.resposta_segura_sugerida,

      // Metadados do CalmGuard para o InsightsPanel
      calmguard: {
        aprovado:          calmRespostaPrincipal.aprovado,
        nivel_acolhimento: calmRespostaPrincipal.nivel_acolhimento,
        texto_original:    analise.resposta_segura_sugerida,
        texto_validado:    calmRespostaPrincipal.texto_validado,
      },

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ContextAgent route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PHONAGENT ====================
router.post('/phon', async (req, res) => {
  try {
    const { texto } = req.body;
    console.log('📖 PhonAgent chamado');
    let textoCorrigido = texto || '';
    textoCorrigido = textoCorrigido
      .replace(/dazer/gi, 'fazer')
      .replace(/documendo/gi, 'documento');

    res.json({
      success: true,
      agent: 'PhonAgent',
      textoCorrigido,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== NOTIFYAGENT ====================
router.post('/notify', async (req, res) => {
  try {
    const { tempoInativo } = req.body;
    console.log(`🔔 NotifyAgent chamado (inativo: ${tempoInativo}s)`);
    res.json({
      success: true,
      agent: 'NotifyAgent',
      deve_notificar: tempoInativo > 30,
      mensagem_titulo: '⏸️ Pausa detectada',
      mensagem_corpo: tempoInativo > 60 ? 'Quer retomar onde parou?' : 'Precisa de ajuda?',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BLENDIT ====================
router.post('/blendit', async (req, res) => {
  try {
    console.log('🔄 BlendIt chamado');
    res.json({
      success: true,
      agent: 'BlendIt',
      intervencao_final: 'Vamos organizar as tarefas juntos.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;