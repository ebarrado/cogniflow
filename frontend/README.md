# 🧠 CogniFlow - Assistente Cognitivo para Neurodiversidade

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org)
[![Azure](https://img.shields.io/badge/Azure-CosmosDB-orange.svg)](https://azure.microsoft.com)

## 📋 Sobre o Projeto

**CogniFlow** é um assistente inteligente desenvolvido para reduzir a sobrecarga cognitiva em pessoas neurodiversas (TDAH, dislexia, autismo). A plataforma utiliza múltiplos agentes de IA para detectar padrões de comportamento e oferecer intervenções personalizadas em tempo real.

### 🎯 Problema
Indivíduos neurodiversos frequentemente enfrentam:
- Dificuldade em organizar tarefas complexas
- Sobrecarga com textos longos e densos
- Ambiguidade em instruções e prazos
- Erros fonéticos e dificuldades de leitura
# 🧠 CogniFlow - Arquitetura de Agentes

## 📋 Visão Geral

O CogniFlow utiliza uma arquitetura multi-agentes especializados, cada um responsável por detectar e intervir em diferentes tipos de carga cognitiva. Os agentes trabalham em conjunto para oferecer uma experiência personalizada e acessível.

---

## 🤖 Agentes Cognitivos

### 1. 🎯 FocusAgent
**Especialidade:** Carga Executiva

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Listas de tarefas, prazos, checklists, itens numerados |
| **Detecta** | Sobrecarga organizacional, múltiplas tarefas, prazos apertados |
| **Intervenção** | Organiza tarefas em etapas menores, define prioridades, cria checklist |
| **Exemplo** | "Preciso entregar o projeto até sexta. Tarefas: 1. Arquitetura, 2. Backend, 3. Frontend" |

**Métricas detectadas:**
- Presença de checklist (`- [ ]`)
- Listas numeradas (`1.`, `2.`, `3.`)
- Palavras-chave: tarefa, fazer, entregar, prazo
- Revisões frequentes (>3)
- Scrolls excessivos (>5)

---

### 2. 🔍 ContextAgent
**Especialidade:** Carga Contextual

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Ambiguidade, perguntas, termos vagos, pronomes indefinidos |
| **Detecta** | Falta de clareza, instruções implícitas, comunicação vaga |
| **Intervenção** | Esclarece contexto, define prazos, identifica responsáveis |
| **Exemplo** | "Depois a gente vê isso" / "Alguém precisa fazer aquilo" |

**Métricas detectadas:**
- Termos ambíguos: quando puder, depois vemos, me avisa
- Perguntas sem contexto (`?`)
- Pronomes: ele, ela, isso, aquilo
- Tempo de resposta > 3000ms
- Releituras > 1

---

### 3. 📖 PhonAgent
**Especialidade:** Carga Fonológica

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Erros fonéticos, texto longo, parágrafos densos |
| **Detecta** | Dificuldade de leitura, trocas de letras, inversões silábicas |
| **Intervenção** | Corrige ortografia, formata texto, ativa leitura assistida |
| **Exemplo** | "Preciso dazer uma correção no documendo" |

**Correções fonéticas:**
| Erro | Correção |
|------|----------|
| dazer | fazer |
| documendo | documento |
| probremas | problemas |
| conecção | conexão |
| resouver | resolver |
| quastão | questão |

**Métricas detectadas:**
- Palavras > 80
- Parágrafos longos (>80 caracteres/linha)
- Texto denso (>12 palavras/linha)
- Erros fonéticos > 0

---

### 4. 🧠 ProfileSense
**Especialidade:** Perfil do Usuário

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Análise contínua do histórico de interações |
| **Detecta** | Padrões comportamentais, preferências, necessidades recorrentes |
| **Intervenção** | Personaliza intervenções baseadas no perfil do usuário |
| **Exemplo** | "Baseado no seu histórico, você costuma ter dificuldade com textos longos" |

**Perfis detectados:**
| Perfil | Característica | Agente Prioritário |
|--------|----------------|-------------------|
| 🎯 Foco em tarefas | Organiza tarefas, prazos | FocusAgent |
| 🔍 Necessita contexto | Perguntas, ambiguidade | ContextAgent |
| 📖 Dificuldade leitura | Erros fonéticos, texto longo | PhonAgent |
| ⚪ Perfil neutro | Sem padrão definido | BlendIt |

---

### 5. 🛡️ CalmGuard
**Especialidade:** Regulação Emocional

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Estresse, frustração, abandono de tarefa |
| **Detecta** | Sinais de sobrecarga emocional, pausas bruscas |
| **Intervenção** | Sugere pausas, exercícios de respiração, reorientação |
| **Exemplo** | "Percebi que você está há muito tempo na mesma tarefa. Que tal fazer uma pausa de 2 minutos?" |

**Métricas detectadas:**
- Abandono de tarefa (tempo > 120s com poucas palavras)
- Múltiplas revisões sem progresso
- Variação alta de comportamento
- Troca rápida de tarefas

---

### 6. 🔄 BlendIt
**Especialidade:** Intervenção Combinada

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Múltiplas cargas cognitivas simultâneas |
| **Detecta** | Combinação de carga executiva + fonológica + contextual |
| **Intervenção** | Combina estratégias de múltiplos agentes |
| **Exemplo** | "Vamos organizar as tarefas E melhorar a leitura do texto" |

**Combinações:**
| Combinação | Intervenção |
|------------|-------------|
| Executivo + Fonológico | Organizar tarefas + simplificar texto |
| Executivo + Contextual | Estruturar tarefas + esclarecer contexto |
| Contextual + Fonológico | Esclarecer contexto + corrigir erros |
| Todos os 3 | Plano de ação completo + leitura assistida |

---

### 7. 🔔 NotifyAgent
**Especialidade:** Notificações Inteligentes

| Propriedade | Descrição |
|-------------|-----------|
| **Ativação** | Momentos oportunos para intervenção |
| **Detecta** | Janelas de atenção, momentos de pausa |
| **Intervenção** | Envia notificações não intrusivas |
| **Exemplo** | "Posso ajudar a organizar suas tarefas quando estiver pronto" |

**Métricas detectadas:**
- Pausas na digitação (> 5s)
- Finalização de parágrafo
- Mudança de foco
- Horários de maior produtividade

---

## 📊 Fluxo de Decisão dos Agentes

```text
┌─────────────────┐
│ Editor React │
│ (Frontend) │
└────────┬────────┘
│
▼
┌─────────────────┐
│ ProfileSense │
│ Classificação │
└────────┬────────┘
│
┌────────────────────┼────────────────────┐
│ │ │
▼ ▼ ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ FocusAgent │ │ ContextAgent │ │ PhonAgent │
│ Score >= 1 │ │ Score >= 1 │ │ Score >= 1 │
└───────────────┘ └───────────────┘ └───────────────┘
│ │ │
└────────────────────┼────────────────────┘
│
┌────────┴────────┐
│ Múltiplos? │
└────────┬────────┘
│
┌──────────────┼──────────────┐
│ │ │
▼ ▼ ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│ BlendIt │ │ CalmGuard │ │ NotifyAgent│
│ Combinado │ │ Regulação │ │ Notificações│
└───────────┘ └───────────┘ └───────────┘
```

---

## 🎯 Scores e Limiares

### Fórmulas de Cálculo

**FocusAgent Score:**

* score = (temChecklist ? 2 : 0)

* (temListaNumerada ? 2 : 0)

* (temTarefas ? 2 : 0)

* (temPrazos ? 2 : 0)

* (revisoes >= 2 ? 1 : 0)

* (scrollCount > 5 ? 1 : 0)


**ContextAgent Score:**

* score = (temAmbiguidade ? 2 : 0)

* (temPerguntas > 1 ? 1 : 0)

* (temPronomesAmbiguos ? 1 : 0)

* (selecaoLonga ? 1 : 0)


**PhonAgent Score:**

* score = (textoLongo ? 1 : 0)

* (textoMuitoLongo ? 2 : 0)

* (paragrafosLongos ? 1 : 0)

* (textoDenso ? 1 : 0)

* (errosFoneticos ? errosFoneticos : 0)


### Limiares de Ativação

| Nível | Score | Ação |
|-------|-------|------|
| 🟢 Baixo | 0 | Monitoramento passivo |
| 🟡 Médio | 1-2 | Sugestão leve, card informativo |
| 🟠 Alto | 3-4 | Intervenção ativa, botão de ação |
| 🔴 Crítico | 5+ | Ação automática, alerta |

---

## 🔄 RAG - Retrieval-Augmented Generation

### Como o RAG Potencializa os Agentes


```text
┌─────────────────────────────────────────────────────────────┐
│ RAG - Fluxo de Dados │
├─────────────────────────────────────────────────────────────┤
│ │
│ Usuário │
│ │ │
│ ▼ │
│ Interação ──► Cosmos DB ──► Azure Search ──► Perfil │
│ │ │ │ │
│ │ ▼ ▼ │
│ │ Indexação Personalização │
│ │ │ │ │
│ └───────────────────────────┴──────────────┘ │
│ │ │
│ ▼ │
│ Agentes com Contexto │
│ │
└─────────────────────────────────────────────────────────────┘
```

### Benefícios do RAG

| Benefício | Descrição |
|-----------|-----------|
| **Histórico** | Intervenções baseadas em interações passadas |
| **Personalização** | Adaptação ao perfil individual do usuário |
| **Evolução** | Melhora contínua com mais dados |
| **Contexto** | Entende padrões de comportamento |

---

## 📈 Matriz de Responsabilidades

| Agente | Detecta | Intervém | Métricas Chave |
|--------|---------|----------|----------------|
| **FocusAgent** | Listas, tarefas, prazos | Organização, checklist | Score executivo |
| **ContextAgent** | Ambiguidade, perguntas | Esclarecimento | Score contextual |
| **PhonAgent** | Erros fonéticos, texto longo | Correção, leitura | Score fonológico |
| **ProfileSense** | Padrões comportamentais | Personalização | Histórico RAG |
| **CalmGuard** | Estresse, abandono | Pausas, respiração | Abandono, variação |
| **BlendIt** | Múltiplas cargas | Combinação | Scores combinados |
| **NotifyAgent** | Janelas de atenção | Notificações | Tempo, foco |

---

## 🧪 Exemplos de Ativação

### Exemplo 1: Carga Executiva (FocusAgent)

**Texto do usuário:**

```text
Preciso entregar o relatório até sexta. Também tenho que:

Revisar o código

Preparar apresentação

Responder emails

Agendar reunião
```

**Detecção:**
- temTarefas = true
- temLista = true
- temPrazos = true
- **Score executivo = 5**

**Intervenção:**
> 🎯 Detectei múltiplas tarefas com prazos. Posso ajudar a organizar por prioridade e criar um checklist?

---

### Exemplo 2: Carga Contextual (ContextAgent)

**Texto do usuário:**

```text
Alguém precisa resolver aquilo lá. Depois a gente vê o que fazer. Quando puder, me avisa.
```

**Detecção:**
- temAmbiguidade = true
- temPronomesAmbiguos = true
- **Score contextual = 3**

**Intervenção:**
> 🔍 Percebi informações ambíguas. Quer ajuda para esclarecer prazos, responsáveis e próximos passos?

---

### Exemplo 3: Carga Fonológica (PhonAgent)

**Texto do usuário:**

```text
Preciso dazer uma correção no documendo. O banco de dados está com probremas de conecção
```

**Detecção:**
- errosFoneticos = 3
- **Score fonológico = 3**

**Intervenção:**
> 📖 Detectei 3 erros de digitação. Quer que eu corrija? "dazer" → "fazer", "documendo" → "documento", "probremas" → "problemas"

---

### Exemplo 4: Múltiplas Cargas (BlendIt)

**Texto do usuário:**

```text
Preciso entregar o relatório. Vamos fazer aquilo depois. dazer correção no documendo.
```

**Detecção:**
- Score executivo = 2 (temPrazos)
- Score contextual = 2 (temAmbiguidade)
- Score fonológico = 2 (errosFoneticos)

**Intervenção:**
> 🔄 Percebi que você tem múltiplas necessidades: organização de tarefas, esclarecimento de contexto e correção de erros. Vou preparar uma intervenção combinada!

---

## 🏆 Conclusão

A arquitetura multi-agentes do CogniFlow oferece:

- ✅ **Detecção precisa** de diferentes tipos de carga cognitiva
- ✅ **Intervenções personalizadas** baseadas no perfil do usuário
- ✅ **Escalabilidade** com agentes especializados
- ✅ **Evolução contínua** através do RAG e histórico
- ✅ **Acessibilidade** focada em neurodiversidade

---

**CogniFlow - Reduzindo a carga cognitiva, potencializando mentes.** 🧠✨