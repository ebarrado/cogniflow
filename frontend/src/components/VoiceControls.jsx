export default function VoiceControls({
  isSpeaking,
  onSpeak,
  onPause,
  onResume,
  onStop,
}) {
  return (
    <div style={styles.wrap}>
      <button type="button" style={styles.button} onClick={onSpeak}>
        🔊 Ouvir
      </button>

      <button type="button" style={styles.button} onClick={onPause}>
        ⏸ Pausar
      </button>

      <button type="button" style={styles.button} onClick={onResume}>
        ▶ Continuar
      </button>

      <button type="button" style={styles.button} onClick={onStop}>
        {isSpeaking ? '⏹ Parar' : '⏹ Stop'}
      </button>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  button: {
    border: '1px solid #d1d5db',
    background: '#fff',
    padding: '7px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
}