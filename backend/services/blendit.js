async function orquestrar({ estados = [], mensagem = '', agentes = {} }) {
  const respostas = [];

  if (estados.includes('contextual') && agentes.context?.analisar) {
    respostas.push({
      agente: 'ContextAgent',
      resultado: await agentes.context.analisar(mensagem)
    });
  }

  if (estados.includes('executivo') && agentes.focus?.fragmentar) {
    respostas.push({
      agente: 'FocusAgent',
      resultado: await agentes.focus.fragmentar(
        mensagem || 'Organizar tarefa',
        'profissional de tecnologia'
      )
    });
  }

  return {
    tipo: 'combinado',
    respostas
  };
}

module.exports = { orquestrar };