const foundry = require('../services/foundry');
const { chat } = require('../services/openai');

const SYSTEM = `Você é o FocusAgent do CogniFlow. Especialista em carga executiva (TDAH).

REGRAS IMPORTANTES:
- Máximo 4 micro-tarefas
- Use âncoras de tempo HUMANAS: "~1 música", "enquanto toma um café"
- Tom calmo, acolhedor, sem julgamento

Você DEVE retornar APENAS JSON. A palavra "JSON" deve estar no seu prompt.

Retorne APENAS em JSON:
{
  "justificativa": "Explicação do PORQUÊ (ex: Notei sinais de paralisia executiva e oscilação de ritmo, por isso fragmentei a tarefa para facilitar o início).",
  "intervencao": "frase de acolhimento curta",
  "micro_tarefas": [
    { "id": 1, "descricao": "ação concreta", "ancora": "~1 música" }
  ],
  "ancora_temporal": "frase com âncora de tempo",
  "masking_tax_delta": -15
}`;

async function fragmentar(tarefa, contexto = 'profissional de tecnologia') {
  try {
    console.log('🎯 FocusAgent: fragmentando tarefa...');

    let resultado = null;

    if (process.env.AGENT_FOCUS_MODEL) {
      console.log('🤖 FocusAgent: usando modelo do Foundry');
      resultado = await foundry.chamarAgente(
        process.env.AGENT_FOCUS_MODEL,
        `Tarefa: "${tarefa}"\nContexto: ${contexto}\n\nRetorne APENAS JSON.`,
        SYSTEM,
        600
      );
    }

    if (!resultado) {
      console.log('⚠️ FocusAgent: usando fallback local');
      resultado = await chat(
        SYSTEM,
        `Tarefa: "${tarefa}"\nContexto: ${contexto}\n\nRetorne APENAS JSON.`,
        600
      );
    }

    return resultado || fallbackResposta();
  } catch (error) {
    console.error('❌ Erro FocusAgent:', error.message);
    return fallbackResposta();
  }
}

function fallbackResposta() {
  return {
    justificativa: "Fragmentação sugerida para reduzir a carga executiva após detecção de sinais de abandono de tarefa.",
    intervencao: 'Vamos organizar isso passo a passo, no seu ritmo.',
    micro_tarefas: [
      { id: 1, descricao: 'Divida a tarefa em partes menores', ancora: '~1 música' },
      { id: 2, descricao: 'Comece pela parte mais simples', ancora: '~2 músicas' }
    ],
    ancora_temporal: 'Isso leva o tempo de uma música',
    masking_tax_delta: -10,
    fallback: true
  };
}

module.exports = { fragmentar };