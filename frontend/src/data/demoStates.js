export const demoStates = {
  neutro: {
    estado: ['neutro'],
    score: {
      executivo: 1,
      contextual: 1,
      fonologico: 0
    },
    confianca: 0.52
  },

  executivo: {
    estado: ['executivo'],
    score: {
      executivo: 5,
      contextual: 1,
      fonologico: 1
    },
    confianca: 0.78
  },

  contextual: {
    estado: ['contextual'],
    score: {
      executivo: 1,
      contextual: 6,
      fonologico: 1
    },
    confianca: 0.84
  },

  fonologico: {
    estado: ['fonologico'],
    score: {
      executivo: 1,
      contextual: 2,
      fonologico: 5
    },
    confianca: 0.76
  },

  comorbidade: {
    estado: ['executivo', 'contextual'],
    score: {
      executivo: 5,
      contextual: 5,
      fonologico: 1
    },
    confianca: 0.91
  }
}

export const demoMessages = {
  neutro: 'Segue a atualização do projeto. Quando puder, me avise se está tudo certo.',
  executivo: 'Tenho várias tarefas abertas e não sei por onde começar. Preciso quebrar isso em passos menores.',
  contextual: 'Recebi um e-mail curto e não entendi bem o que a pessoa espera que eu faça.',
  fonologico: 'Esse texto está difícil de acompanhar e estou relendo as mesmas partes várias vezes.',
  comorbidade: 'Recebi uma solicitação ambígua, fiquei travada para responder e ainda preciso organizar tudo em passos claros.'
}