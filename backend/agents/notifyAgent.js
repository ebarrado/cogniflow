const foundry = require('../services/foundry')

const SYSTEM = `Você é o NotifyAgent do CogniFlow.
REGRA CARDINAL: nunca interrompe foco ativo (MTI > 60 = bloqueado).
Máximo 4 notificações por dia.
Responda APENAS em JSON:
{
  "deve_notificar": true | false,
  "janela_otima": "descrição da janela",
  "mensagem_titulo": "título máx 40 chars",
  "mensagem_corpo": "corpo máx 80 chars",
  "urgencia": 1 | 2 | 3 | 4,
  "adiar_minutos": número ou null,
  "motivo": "por que notificar ou não"
}
Urgência: 1=informativo | 2=sugestão | 3=oportuno | 4=importante. NUNCA use urgente.`

async function avaliar({ contexto, tarefasIgnoradas, horaAtual, historicoResponsividade, mtiAtual }) {
  if (mtiAtual && mtiAtual > 60) {
    return {
      deve_notificar: false,
      motivo: 'MTI elevado — foco ativo detectado pelo ProfileSense',
    }
  }
  // TODO: trocar por Foundry Agent quando AGENT_NOTIFY estiver configurado
  return chat(SYSTEM,
    `Contexto: ${contexto || 'usuário trabalhando'}
Tarefas ignoradas: ${JSON.stringify(tarefasIgnoradas || [])}
Hora: ${horaAtual || new Date().getHours()+'h'}
Responsividade: ${historicoResponsividade || 'desconhecido'}
MTI: ${mtiAtual || 0}`)
}

module.exports = { avaliar }