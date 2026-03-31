import { useState } from 'react'

const CARGA_CONFIG = {
  executiva:  { bg: 'var(--red-s)',    color: 'var(--red)',    label: 'Executiva' },
  contextual: { bg: 'var(--purple-s)', color: 'var(--purple)', label: 'Contextual' },
  fonologica: { bg: 'var(--amber-s)',  color: 'var(--amber)',  label: 'Fonológica' },
  neutro:     { bg: 'var(--accent-s)', color: 'var(--accent)', label: 'Neutro' },
  mista:      { bg: 'var(--amber-s)',  color: 'var(--amber)',  label: 'Mista' },
}

// ── Seção colapsável ──────────────────────────────────────────────────────────
function Section({ label, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: 'var(--ink3)',
          flex: 1,
          fontFamily: 'var(--sans)',
        }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--mono)',
            padding: '1px 7px',
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'white',
            fontWeight: 700,
          }}>
            {badge}
          </span>
        )}
        <span style={{
          fontSize: 10,
          color: 'var(--ink3)',
          transition: 'transform .15s',
          display: 'inline-block',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>▾</span>
      </div>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

// ── Card de interpretação clicável ───────────────────────────────────────────
function InterpCard({ item, onSelect, isSelected }) {
  const [hovered, setHovered] = useState(false)
  const prob   = item.probabilidade || 0
  const isHigh = prob >= 50

  return (
    <div
      onClick={() => onSelect(item.resposta_sugerida || '')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        border: `1.5px solid ${isSelected ? 'var(--green)' : hovered ? 'var(--accent)' : 'var(--border)'}`,
        background: isSelected ? 'var(--green-s)' : hovered ? 'var(--accent-s)' : 'var(--surface)',
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'all .15s',
      }}
    >
      {/* Cabeçalho: badge de probabilidade + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 20,
          background: isHigh ? 'var(--accent-s)' : 'var(--bg3)',
          color: isHigh ? 'var(--accent)' : 'var(--ink3)',
          flexShrink: 0,
        }}>
          {prob}%
        </span>
        <span style={{
          fontSize: '.82rem',
          fontWeight: 600,
          color: 'var(--ink)',
          flex: 1,
          lineHeight: 1.3,
        }}>
          {item.titulo}
        </span>
        {isSelected && (
          <span style={{ fontSize: 12, color: 'var(--green)', flexShrink: 0 }}>✓</span>
        )}
      </div>

      {/* Descrição */}
      {item.descricao && (
        <p style={{
          fontSize: '.8rem',
          color: 'var(--ink2)',
          lineHeight: 1.6,
          margin: '0 0 8px',
        }}>
          {item.descricao}
        </p>
      )}

      {/* Resposta sugerida */}
      {item.resposta_sugerida && (
        <div style={{
          fontSize: '.78rem',
          color: isSelected ? 'var(--green)' : 'var(--accent)',
          fontStyle: 'italic',
          borderLeft: `2px solid ${isSelected ? 'var(--green)' : 'var(--accent)'}`,
          paddingLeft: 10,
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          "{item.resposta_sugerida}"
        </div>
      )}

      {/* CTA */}
      <div style={{
        fontSize: '.72rem',
        color: isSelected ? 'var(--green)' : 'var(--ink3)',
        fontFamily: 'var(--mono)',
        fontWeight: isSelected ? 600 : 400,
      }}>
        {isSelected ? '✓ Rascunho preenchido no editor' : '↳ clique para usar como rascunho'}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function InsightsPanel({
  visible,
  metrics = {},
  cognitive = {},
  mti = null,
  calmguard = null,
  interpretacoes = [],
  onInterpSelect,
}) {
  const [selectedRascunho, setSelectedRascunho] = useState(null)

  if (!visible) return null

  const {
    latencia = 0,
    revisoes = 0,
    palavras = 0,
    tempo    = '00:00',
  } = metrics

  const {
    carga        = 'neutro',
    confianca    = 0,
    agente       = 'Monitoramento Passivo',
    justificativa = '',
  } = cognitive

  const cfg      = CARGA_CONFIG[carga] || CARGA_CONFIG.neutro
  const confPct  = Math.round(confianca * 100)
  const hasAgent = agente !== 'Monitoramento Passivo' || carga !== 'neutro'

  const handleSelectInterp = (resposta) => {
    setSelectedRascunho(resposta)
    onInterpSelect?.(resposta)
  }

  return (
    <aside style={{
      width: 296,
      flexShrink: 0,
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '14px', // base para toda a aside
    }}>

      {/* ── Header fixo ── */}
      <div style={{
        padding: '13px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{ fontSize: 14, color: '#6d28d9' }}>◈</span>
        <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.01em' }}>
          Insights Cognitivos
        </span>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--green)',
          fontWeight: 600,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--green)',
            display: 'inline-block',
            animation: 'cfPulse 2s ease-in-out infinite',
          }} />
          AO VIVO
        </div>
      </div>

      {/* ── Estado cognitivo ── */}
      <Section label="Estado Cognitivo" defaultOpen={true}>
        <div style={{
          fontSize: '1rem',
          fontWeight: 700,
          fontFamily: 'var(--serif)',
          padding: '10px 14px',
          borderRadius: 8,
          textAlign: 'center',
          marginBottom: 12,
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.color}33`,
          transition: 'all .2s',
          letterSpacing: '-.01em',
        }}>
          {cfg.label}
        </div>

        {hasAgent && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: '.78rem', color: 'var(--ink3)' }}>Confiança</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--ink2)', fontWeight: 700 }}>
                {confPct}%
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${confPct}%`,
                background: cfg.color,
                borderRadius: 3,
                transition: 'width .5s ease',
              }} />
            </div>
          </>
        )}

        <div style={{
          padding: '10px 12px',
          background: 'var(--bg2)',
          borderRadius: 8,
          border: '1px solid var(--border)',
          lineHeight: 1.6,
        }}>
          <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: hasAgent && justificativa ? 5 : 0 }}>
            {agente}
          </div>
          {justificativa
            ? (
              <div style={{ fontSize: '.78rem', color: 'var(--ink2)', lineHeight: 1.65 }}>
                {justificativa}
              </div>
            )
            : (
              <div style={{ fontSize: '.78rem', color: 'var(--ink3)', fontStyle: 'italic' }}>
                Monitoramento passivo ativo
              </div>
            )
          }
        </div>
      </Section>

      {/* ── Interpretações do ContextAgent ── */}
      {interpretacoes.length > 0 && (
        <Section
          label="ContextAgent — Interpretações"
          defaultOpen={true}
          badge={interpretacoes.length}
        >
          <p style={{
            fontSize: '.8rem',
            color: 'var(--ink3)',
            marginBottom: 12,
            lineHeight: 1.6,
          }}>
            Clique em uma interpretação para usá-la como rascunho de resposta.
          </p>
          {interpretacoes.map((item, idx) => (
            <InterpCard
              key={idx}
              item={item}
              onSelect={handleSelectInterp}
              isSelected={selectedRascunho === (item.resposta_sugerida || '')}
            />
          ))}
        </Section>
      )}

      {/* ── CalmGuard ── */}
      {calmguard && (
        <Section label="CalmGuard" defaultOpen={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: '.78rem',
              fontWeight: 600,
              background: calmguard.aprovado ? 'var(--green-s)' : 'var(--amber-s)',
              color: calmguard.aprovado ? 'var(--green)' : 'var(--amber)',
            }}>
              {calmguard.aprovado ? '✓ Tom aprovado' : '⚠ Ajustado'}
            </span>
            {calmguard.nivel_acolhimento && (
              <span style={{ fontSize: '.76rem', color: 'var(--ink3)' }}>
                acolhimento: <strong style={{ color: 'var(--ink2)' }}>{calmguard.nivel_acolhimento}</strong>
              </span>
            )}
          </div>

          {calmguard.texto_original && calmguard.texto_validado && calmguard.texto_original !== calmguard.texto_validado && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: '.74rem', color: 'var(--ink3)', marginBottom: 4, fontWeight: 600 }}>Texto ajustado:</div>
              <div style={{
                fontSize: '.78rem',
                color: 'var(--ink2)',
                background: 'var(--bg2)',
                padding: '8px 10px',
                borderRadius: 6,
                borderLeft: '2px solid var(--green)',
                lineHeight: 1.6,
              }}>
                {calmguard.texto_validado}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── MTI ── */}
      {mti && (
        <Section label="Masking Tax Index" defaultOpen={true}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--ink)' }}>
              {mti.before}
            </span>
            <span style={{ color: 'var(--green)', fontSize: '1rem', fontWeight: 600 }}>→</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--green)' }}>
              {mti.after}
            </span>
          </div>
          <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${mti.after}%`,
              background: 'var(--green)',
              borderRadius: 3,
              transition: 'width .6s ease',
            }} />
          </div>
        </Section>
      )}

      {/* ── Métricas da sessão ── */}
      {(latencia > 0 || revisoes > 0 || palavras > 0) && (
        <Section label="Métricas da Sessão" defaultOpen={false}>
          {[
            { label: 'Latência média', val: latencia ? `${latencia}ms` : '—' },
            { label: 'Revisões',       val: String(revisoes || 0) },
            { label: 'Palavras',       val: String(palavras || 0) },
            { label: 'Tempo',          val: tempo || '00:00' },
          ].map(m => (
            <div key={m.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid rgba(216,212,204,.4)',
              fontSize: '.8rem',
            }}>
              <span style={{ color: 'var(--ink2)' }}>{m.label}</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontWeight: 600, fontSize: '.78rem' }}>
                {m.val}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* ── Estado vazio ── */}
      {!hasAgent && interpretacoes.length === 0 && !mti && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 28,
          color: 'var(--ink3)',
          gap: 12,
        }}>
          <span style={{ fontSize: '2rem', opacity: .15 }}>◈</span>
          <span style={{
            fontSize: '.8rem',
            textAlign: 'center',
            lineHeight: 1.75,
            color: 'var(--ink3)',
            maxWidth: 200,
          }}>
            Escreva no editor ou use "Analisar contexto" no Inbox para ver insights aqui
          </span>
        </div>
      )}

      <style>{`
        @keyframes cfPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .4; transform: scale(.7); }
        }
      `}</style>
    </aside>
  )
}