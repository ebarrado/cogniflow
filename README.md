# CogniFlow

[![Azure](https://img.shields.io/badge/Azure-0089D6?style=flat&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)

## 🎥 Demo & Presentation

- 📊 [View Slides](./cogniflow-ai.pdf)
- 🎬 [Watch Demo Video](https://youtu.be/G1Daw0z2z1Q)

### Microsoft Innovation Challenge Hackathon — March 2026
**Challenge #3: Cognitive Load Reduction Assistant**

> *"The problem isn't that tasks are too complex. It's that neurodivergent professionals do two things simultaneously: they execute the work AND perform being neurotypical while working. These two activities compete for the same limited resource — working memory."*

---

## 💡 Problem & Vision

Neurodivergent professionals — especially those with late diagnoses of ADHD, autism, or dyslexia — spend between 30% and 40% of their working memory not on the tasks themselves, but on a parallel, invisible process: **simulating neurotypical behavior**.

This phenomenon, called the **Masking Tax**, is measurable, detectable through digital interaction patterns, and — crucially — mitigatable by properly architected AI systems.

Existing productivity tools treat cognitive load as a single variable and simplify everything indiscriminately, ignoring the science behind what actually drains focus. **No tool measures this cost. No tool addresses it.**

**CogniFlow** changes that.

---

## 🚀 Main Capabilities

- **Passive Behavioral Capture**
  Real-time keystroke latency, revision frequency, section returns, and abandonment signals — all captured without interrupting the user's workflow.

- **Masking Tax Index (MTI)**
  A proprietary metric calculated from behavioral proxies documented in neuropsychology literature. Ranges from 0 to 100. A falling index during a session is evidence of effectiveness.

- **Multi-Agent Intervention System**
  Seven specialized agents — each targeting a specific type of cognitive tax — coordinated by an intelligent orchestrator.

- **No Diagnosis Required**
  ProfileSense infers the current cognitive state from interaction patterns. No clinical label. No self-declaration. No form.

- **CalmGuard — Responsible AI by Architecture**
  Every output of every agent passes through CalmGuard before reaching the user. Anxiogenic, stigmatizing, or judgmental language is intercepted and rewritten.

---

## 🧠 Multi-Agent Architecture

```
Frontend (React + Vite)
    ↓
Backend (Node.js / Express)
    ↓
Azure AI Foundry (hub)
    ├── ProfileSense    → classifies active cognitive load type
    ├── FocusAgent      → executive load (ADHD) — micro-closures
    ├── PhonAgent       → phonological load (Dyslexia) — adaptive typography
    ├── ContextAgent    → contextual load (Autism) — making implicit explicit
    ├── BlendIt         → comorbidity orchestrator — resolves agent conflicts
    ├── CalmGuard       → Responsible AI structural layer
    └── NotifyAgent     → opportunity-window notifications
         ↓
    Azure Cosmos DB     — behavioral profile per session
    Azure AI Search     — semantic RAG over session history
```

### Agent Descriptions

- **ProfileSense — Cognitive Load Detector**
  Entry point for every interaction. Analyzes behavioral patterns silently. No labeling. No asking. Output: which intervention agent(s) to activate.

- **FocusAgent — Executive Load Specialist (ADHD)**
  Activated when executive load is dominant. Fragments tasks into micro-closures with concrete temporal anchors ("this takes the length of one song"). Based on Barkley's time agnosia and Sirois's dopaminergic micro-closures research.

- **PhonAgent — Phonological Load Specialist (Dyslexia)**
  Activated when phonological load is dominant. Adapts text presentation: adaptive typography per BDA guidelines, syllabic fragmentation, synchronized audio reading. Integrates Azure Immersive Reader natively.

- **ContextAgent — Contextual Load Specialist (Autism)**
  The most innovative agent. Makes implicit professional communication explicit: decodes unspoken expectations, signals ambiguous instructions with multiple plausible interpretations and probability scores.

- **BlendIt — Comorbidity Orchestrator**
  40–70% of autistic people have concurrent ADHD; 30–40% of dyslexics have ADHD. BlendIt resolves conflicts between agents before any output reaches the user — e.g., it will not activate FocusAgent's accelerated rhythm while PhonAgent needs reduced speed.

- **CalmGuard — Structural RAI**
  Responsible AI as architecture, not as a compliance checklist. Verifies: no anxiogenic language, autonomy preserved, no clinical references in the interface, calm and non-condescending tone. Generates an audit log of every intervention to Azure Monitor + App Insights.

- **NotifyAgent — Intelligent Notification System**
  Notifies in opportunity windows based on behavior — never on a fixed schedule. Cardinal rule: never interrupts active focus. Maximum 4 notifications/day.

---

## 📊 Masking Tax Index — The Core Metric

A proxy metric calculated from behavioral correlates documented in neuropsychology literature:

```
weights = {
  latency_score:       0.30,   # Barkley: latency ~ executive inhibition
  revision_frequency:  0.30,   # Hull et al.: self-monitoring ~ masking
  section_returns:     0.20,   # Baddeley: returns ~ phonological loop overload
  abandonment_signals: 0.20    # Sirois: abandonment ~ micro-closure failure
}
```

Scale: 0 to 100. **A falling index during a session = evidence of effectiveness.**

---

## 🎬 Demo — 4 Scenes

| Scene | Persona | Surface | Agent |
|-------|---------|---------|-------|
| 1 | Sofia, 34 — Senior Software Engineer (ADHD) | Text Editor | FocusAgent |
| 2 | Miguel, 29 — Backend Dev (Dyslexia) | Text Editor | PhonAgent |
| 3 | Ana, 31 — Product Manager (Autism) | Inbox | ContextAgent |
| 4 | Sofia — difficult day (mixed load) | Tasks | BlendIt + NotifyAgent |

---

## ☁️ Azure Services (10)

| # | Service | Role |
|---|---------|------|
| 1 | **Azure AI Foundry** | Central hub — orchestrates all 7 agents |
| 2 | **Azure OpenAI (GPT-4.1 mini)** | Core inference engine |
| 3 | **Azure AI Search** | RAG + behavioral index enrichment |
| 4 | **Azure Cosmos DB** | Behavioral profiles + session events |
| 5 | **Azure AI Content Safety** | CalmGuard real-time filtering |
| 6 | **Azure Notification Hubs** | Web push delivery via NotifyAgent |
| 7 | **Azure API Management** | API gateway + rate limiting |
| 8 | **Azure Key Vault** | Secure credentials & secrets management |
| 9 | **Azure Monitor** | RAI audit logs + intervention tracking |
| 10 | **Azure App Service** | Backend + PWA deployment |

---

## 📈 Expected Impact

| Metric | Baseline (without CogniFlow) | Target (with CogniFlow) |
|--------|------------------------------|-------------------------|
| MTI Score | 70-85 | 40-55 |
| Task Completion | 60% | 85% |
| Session Hesitations | 8-12 per hour | 2-4 per hour |
| User Satisfaction | N/A | 4.5/5 |

---

## 🛡️ Responsible AI

CalmGuard is the architectural equivalent of Responsible AI — not a compliance slide.

| Principle | Implementation |
|-----------|---------------|
| **Fairness** | Zero diagnosis fields. Works without formal diagnosis. Zero self-declaration eliminates selection bias. |
| **Reliability & Safety** | CalmGuard validates every output. No intervention without sufficient behavioral evidence. System makes no clinical diagnoses. |
| **Privacy & Security** | Key Vault for credentials. Behavioral data classified as sensitive health data. No use for training without consent. |
| **Inclusiveness** | Zero-friction onboarding. No "accessibility mode" selection. Complexity emerges as the profile is learned. |
| **Transparency** | Explanatory log of every intervention: pattern detected → agent activated → intervention → result measured. |
| **Accountability** | Every intervention is reversible. Undo = explicit negative feedback that feeds the profile. Granular opt-out. |

---

## 🧱 Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- ES Modules

**Backend**
- Node.js + Express
- Azure OpenAI SDK
- Azure Cosmos DB SDK

**Azure**
- Azure AI Foundry (Agents)
- Azure OpenAI (GPT-4o)
- Azure Cosmos DB
- Azure AI Search
- Azure AI Content Safety
- Azure App Service
----

## 💻 How to Run

### Backend

```bash
cd backend
cp .env.example .env
# Fill in Azure credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

> **Demo mode:** Click the **◈ Demo** button in the top bar to show/hide the Cognitive Insights panel during recording.

---

## 📁 Project Structure

```
cogniflow/
│
├── backend/
│   ├── agents/
│   │   ├── blendIt.js
│   │   ├── calmGuard.js
│   │   ├── contextAgent.js
│   │   ├── focusAgent.js
│   │   ├── notifyAgent.js
│   │   ├── photoAgent.js
│   │   └── profileSense.js
│   │
│   ├── routes/
│   │   ├── agents.js
│   │   ├── data.js
│   │   └── profilesense.js
│   │
│   ├── services/
│   │   ├── azure-search.js
│   │   ├── blendit.js
│   │   ├── calmguard.js
│   │   ├── cosmos.js
│   │   ├── foundry.js
│   │   ├── openai.js
│   │   ├── phon.js
│   │   ├── profilesense.js
│   │   └── rag.js
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   ├── capture/
│   │   │
│   │   ├── components/
│   │   │   ├── CognitiveInterventionCard.jsx
│   │   │   ├── CognitiveStateIndicator.jsx
│   │   │   ├── DemoSimulator.jsx
│   │   │   ├── FeedbackToast.jsx
│   │   │   ├── InsightsPanel.jsx
│   │   │   ├── NewDocumentModal.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Sparkline.jsx
│   │   │   ├── StatusBar.jsx
│   │   │   ├── SuggestionChips.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── VoiceControls.jsx
│   │   │
│   │   ├── config/
│   │   ├── constants/
│   │   ├── data/
│   │   │   └── demoStates.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useSpeechSynthesis.js
│   │   │
│   │   ├── mockData/
│   │   │
│   │   ├── services/
│   │   │   ├── agentService.js
│   │   │   └── speechService.js
│   │   │
│   │   ├── surfaces/
│   │   │   ├── Editor.jsx
│   │   │   ├── Examples.jsx
│   │   │   ├── Inbox.jsx
│   │   │   └── Tasks.jsx
│   │   │
│   │   ├── theme/
│   │   │   └── tokens.js
│   │   │
│   │   ├── types/
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── eslint.config.js
│   └── index.html
│
└── README.md
```


## 📊  Agent Decision Flow

```text
[React Editor]
      │
      ▼
[ProfileSense] ── Detects cognitive load type
      │
      ├──► Executive Load? ──► [FocusAgent]
      │
      ├──► Contextual Load? ──► [ContextAgent]
      │
      └──► Phonological Load? ──► [PhonAgent]
                    │
                    ▼
            [Multiple Agents Active?]
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   [BlendIt]  [CalmGuard]  [NotifyAgent]
   (Combine)  (Regulate)   (Notify)
```

---
## 📊 Agent Decision Flow

| Step | Component | Description |
|------|-----------|-------------|
| 1 | **React Editor** | User interacts with the frontend (typing, editing, scrolling) |
| 2 | **ProfileSense** | Analyzes behavioral patterns and classifies the dominant cognitive load type |
| 3 | **FocusAgent** | Activated when executive load score ≥ 1 (tasks, deadlines, organization) |
| 4 | **ContextAgent** | Activated when contextual load score ≥ 1 (ambiguity, vague language) |
| 5 | **PhonAgent** | Activated when phonological load score ≥ 1 (long texts, phonetic errors) |
| 6 | **Decision Point** | Checks if multiple agents are activated simultaneously |
| 7 | **BlendIt** | If multiple agents active → combines interventions |
| 8 | **CalmGuard** | Always active → filters language for emotional safety |
| 9 | **NotifyAgent** | Determines opportune moments to send notifications |

### Visual Flow

```text
[React Editor]
      │
      ▼
[ProfileSense] ── Classifies cognitive load
      │
      ├──► Score ≥ 1 ──► [FocusAgent]      (Executive Load)
      │
      ├──► Score ≥ 1 ──► [ContextAgent]    (Contextual Load)
      │
      └──► Score ≥ 1 ──► [PhonAgent]       (Phonological Load)
                    │
                    ▼
            [Multiple Agents?]
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   [BlendIt]   [CalmGuard]  [NotifyAgent]
   (Combine)   (Filter)     (Schedule)
```
---
## 🔄 RAG - Retrieval-Augmented Generation

### How RAG Enhances Agents

```text
┌─────────────────────────────────────────────────────────────┐
│ RAG - Data Flow                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User                                                        │
│ │                                                           │
│ ▼                                                           │
│ Interaction ──► Cosmos DB ──► Azure Search ──► Profile      │
│ │                  │              │              │          │
│ │                  ▼              ▼              │          │
│ │                  Indexing       Personalization│          │
│ │                                                 │         │
│ └─────────────────────────────────────────────────┘         │
│                     │                                       │
│                     ▼                                       │
│                Agents with Context                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```



## 🔭 Next Steps (Post-Hackathon)

- Integrate real email client via Microsoft Graph API (Outlook/Teams).
- Add PhonAgent with Azure AI Speech for synchronized audio reading.
- Deploy Azure Notification Hubs for native iOS and Android push notifications.
- Build user profile persistence with longitudinal MTI tracking across sessions.
- Validate Masking Tax Index calibration with neurodivergent professionals in real workplaces.

---

## 📚 Scientific References

- Baddeley, A. D., & Hitch, G. (1974). Working memory. *Psychology of Learning and Motivation*, Vol. 8.
- Barkley, R. A. (1997). *ADHD and the nature of self-control*. Guilford Press.
- Hull, L., Mandy, W., & Lai, M. C. (2017). Behavioral and cognitive sex/gender differences in autism. *Psychological Medicine*, 47(14).
- Pearson, A., & Rose, K. (2021). A conceptual analysis of autistic masking. *Autism in Adulthood*, 3(1).
- Sirois, F. M., & Pychyl, T. A. (2013). Procrastination and the priority of short-term mood regulation. *Social and Personality Psychology Compass*, 7(2).
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2).
- Fayyad, J. et al. (2024). Prevalence of adult ADHD. *World Psychiatry*.
- EY Neurodiversity Research (2023). *The Value of Neurodiversity*.

---

## 👥 Team

- **Letícia Batista Silva**  
  [![GitHub](https://img.shields.io/badge/GitHub-leticiabsilva03-181717?logo=github&logoColor=white)](https://github.com/leticiabsilva03)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-leticiabatistasilva-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/leticiabatistasilva/)

- **Erika Arias Barrado**  
  [![GitHub](https://img.shields.io/badge/GitHub-ebarrado-181717?logo=github&logoColor=white)](https://github.com/ebarrado)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-erika--arias--barrado-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/erika-arias-barrado/)

---

*Built for the **Microsoft Innovation Challenge Hackathon — March 2026**.*
*Challenge #3: Cognitive Load Reduction Assistant.*
