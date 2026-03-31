// src/components/Sparkline.jsx
import { useMemo } from 'react'

export default function Sparkline({ data = [], width = 220, height = 32 }) {
  const { points, hasData } = useMemo(() => {
    // 1. Verificar se data existe e é array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { points: null, hasData: false }
    }
    
    // 2. Filtrar apenas valores numéricos válidos
    const validData = data.filter(v => {
      const isNum = typeof v === 'number'
      const isValid = isNum && !isNaN(v) && isFinite(v) && v > 0
      return isValid
    })
    
    // 3. Se não há dados válidos
    if (validData.length === 0) {
      return { points: null, hasData: false }
    }
    
    // 4. Pegar últimos 40 valores
    const dataToShow = validData.slice(-40)
    
    // 5. Calcular valor máximo (evitar divisão por zero)
    const maxVal = Math.max(...dataToShow, 100)
    
    // 6. Calcular pontos
    let ptsArray = []
    for (let i = 0; i < dataToShow.length; i++) {
      const v = dataToShow[i]
      // X: posição proporcional no gráfico
      const x = (i / (dataToShow.length - 1)) * width
      // Y: altura proporcional ao valor
      let y = height - (Math.min(v, maxVal) / maxVal) * (height - 4) - 2
      // Garantir que Y está dentro dos limites
      y = Math.max(2, Math.min(height - 2, y))
      // Verificar se os valores são números válidos
      if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
        ptsArray.push(`${x},${y}`)
      }
    }
    
    // 7. Se não conseguiu gerar pontos válidos
    if (ptsArray.length === 0) {
      return { points: null, hasData: false }
    }
    
    return { points: ptsArray.join(' '), hasData: true }
  }, [data, width, height])
  
  // Se não há dados, mostra mensagem
  if (!hasData || !points) {
    return (
      <div style={{ 
        height: `${height}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--ink3)',
        fontSize: '.7rem',
        fontFamily: 'var(--mono)'
      }}>
        Aguardando dados...
      </div>
    )
  }
  
  // Construir pontos para o preenchimento
  const fillPoints = `0,${height} ${points} ${width},${height}`
  
  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      style={{ width: '100%', height: `${height}px` }} 
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline 
        points={points} 
        fill="none" 
        stroke="var(--accent)" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
      <polyline 
        points={fillPoints} 
        fill="url(#sparkGradient)" 
        stroke="none"
      />
    </svg>
  )
}