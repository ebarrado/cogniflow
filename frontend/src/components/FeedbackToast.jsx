export default function FeedbackToast({ message, type = 'info', onClose }) {
  return (
    <div style={{ ...styles.toast, ...styles[type] }}>
      <span>{message}</span>
      <button onClick={onClose} style={styles.close}>✕</button>
    </div>
  )
}

const styles = {
  toast: {
    position: 'fixed',
    top: 84,
    right: 16,
    zIndex: 9999,
    minWidth: 260,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: 12,
    color: '#111827',
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 10px 30px rgba(0,0,0,.08)',
  },
  info: {},
  success: { borderColor: '#86efac' },
  warning: { borderColor: '#fcd34d' },
  cognitive: { borderColor: '#c4b5fd' },
  close: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
}