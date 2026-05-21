export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="error-screen">
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <button className="btn-primary" onClick={onRetry}>← Try Again</button>
    </div>
  )
}
