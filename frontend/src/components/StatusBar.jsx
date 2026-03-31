export default function StatusBar({ surface, sessionTime, events, cosmosStatus }) {
  return (
    <footer style={styles.bar}>
      <span>Surface: {surface}</span>
      <span>Sessão: {sessionTime}</span>
      <span>Eventos: {events}</span>
      <span>Cosmos: {cosmosStatus}</span>
    </footer>
  )
}

const styles = {
  bar: {
    height: 40,
    borderTop: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 16px',
    fontSize: 12,
    color: '#6b7280',
  },
}