const { AzureOpenAI } = require('openai');
require('dotenv').config();

let client = null;
let initialized = false;
let defaultDeployment = null;

function initFoundry() {
  const endpoint = process.env.FOUNDRY_PROJECT_ENDPOINT || process.env.FOUNDRY_ENDPOINT;
  const apiKey = process.env.FOUNDRY_API_KEY;
  const deployment = process.env.FOUNDRY_DEPLOYMENT || 'gpt-4o';

  console.log('🔧 Inicializando Foundry...');
  console.log('   ENDPOINT:', endpoint ? '✓ presente' : '✗ ausente');
  console.log('   API KEY:', apiKey ? '✓ presente' : '✗ ausente');
  console.log('   DEPLOYMENT:', deployment ? `✓ ${deployment}` : '✗ ausente');

  if (!endpoint || !apiKey) {
    console.log('⚠️ Foundry não configurado (variáveis ausentes)');
    initialized = false;
    client = null;
    return false;
  }

  try {
    const cleanEndpoint = endpoint.replace(/\/$/, '');

    client = new AzureOpenAI({
      endpoint: cleanEndpoint,
      apiKey,
      apiVersion: '2024-08-01-preview',
      deployment
    });

    defaultDeployment = deployment;
    initialized = true;

    console.log(`✅ Foundry inicializado: ${cleanEndpoint}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Foundry:', error.message);
    initialized = false;
    client = null;
    return false;
  }
}

function tentarExtrairJSON(content) {
  if (!content) return null;
  if (typeof content === 'object') return content;

  try {
    return JSON.parse(content);
  } catch {}

  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}

  return null;
}

async function chamarAgente(modelOrDeployment, mensagem, systemPrompt = null, options = {}) {
  if (!initialized || !client) {
    console.error('❌ Foundry não inicializado');
    return null;
  }

  const deploymentToUse = modelOrDeployment || defaultDeployment;

  try {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: mensagem });

    const response = await client.chat.completions.create({
      model: deploymentToUse,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 800
    });

    const content = response?.choices?.[0]?.message?.content;
    return tentarExtrairJSON(content);
  } catch (error) {
    console.error('❌ Erro ao chamar Foundry:', error.message);
    return null;
  }
}

function getStatus() {
  return initialized && client !== null;
}

module.exports = {
  initFoundry,
  chamarAgente,
  getStatus
};