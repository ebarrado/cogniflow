import React, { useState, useEffect } from 'react'

const NAV_ITEMS = [
  {
    id: 'editor',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    label: 'Editor',
  },
  {
    id: 'tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    label: 'Tarefas',
  },
  {
    id: 'inbox',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    ),
    label: 'Inbox',
    badge: 2,
  },
  {
    id: 'examples',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    label: 'Exemplos',
  },
]

export default function Sidebar({ surface, onSwitch }) {
  const [cosmosConnected, setCosmosConnected] = useState(false)
  const [totalDocumentos, setTotalDocumentos] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/db-status')
        const data = await response.json()
        setCosmosConnected(data.connected || false)
        const total = (data.registros?.eventos || 0) + (data.registros?.insights || 0)
        setTotalDocumentos(total)
      } catch {
        setCosmosConnected(false)
        setTotalDocumentos(0)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDbStatus()
    const interval = setInterval(fetchDbStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav style={styles.sidebar}>
      {/* Logo mark */}
      <div style={styles.logoArea}>
        <div style={styles.logoMark}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Nav items */}
      <div style={styles.navItems}>
        {NAV_ITEMS.map((item) => {
          const isActive = surface === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSwitch(item.id)}
              style={{
                ...styles.navBtn,
                ...(isActive ? styles.navBtnActive : {}),
              }}
              title={item.label}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(43,92,230,0.06)'
                  e.currentTarget.style.color = 'var(--ink)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--ink3)'
                }
              }}
            >
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
                {item.badge && (
                  <span style={styles.badge}>{item.badge}</span>
                )}
              </span>
              <span style={styles.navLabel}>{item.label}</span>

              {/* Active indicator */}
              {isActive && <span style={styles.activeBar} />}
            </button>
          )
        })}
      </div>

      {/* Bottom status */}
      <div style={styles.bottomArea}>
        <div style={styles.statusDot}>
          <span style={{
            ...styles.dot,
            background: cosmosConnected ? '#22c55e' : '#f97316',
          }} />
          <span style={styles.statusText}>
            {isLoading ? '…' : cosmosConnected ? 'Cloud' : 'Local'}
          </span>
        </div>
        <span style={styles.docsCount}>
          {totalDocumentos.toLocaleString('pt-BR')} docs
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </nav>
  )
}

const styles = {
  sidebar: {
    width: 72,
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    gap: 0,
    overflowY: 'auto',
  },
  logoArea: {
    marginBottom: 20,
    padding: '8px 0',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItems: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    padding: '0 8px',
  },
  navBtn: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '10px 6px',
    border: 'none',
    borderRadius: 10,
    background: 'transparent',
    color: 'var(--ink3)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.18s ease',
    minHeight: 60,
  },
  navBtnActive: {
    background: 'var(--accent-s)',
    color: 'var(--accent)',
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: 'var(--mono)',
    lineHeight: 1,
  },
  activeBar: {
    position: 'absolute',
    left: -8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 24,
    borderRadius: '0 3px 3px 0',
    background: 'var(--accent)',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    fontSize: 9,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--mono)',
  },
  bottomArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: '1px solid var(--border)',
    width: '100%',
    padding: '12px 8px 0',
  },
  statusDot: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'var(--mono)',
    color: 'var(--ink3)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  docsCount: {
    fontSize: 8,
    fontFamily: 'var(--mono)',
    color: 'var(--ink3)',
  },
}