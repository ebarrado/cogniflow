async function orquestrar({ estados, mensagem, agentes }) {
  const respostas = [];

  if (estados.includes('contextual') && agentes.context) {
    respostas.push(await agentes.context.analisar(mensagem));
  }

  if (estados.includes('executivo') && agentes.focus) {
    respostas.push(await agentes.focus.fragmentar(mensagem));
  }

  return {
    tipo: 'combinado',
    respostas
  };
}

module.exports = { orquestrar };