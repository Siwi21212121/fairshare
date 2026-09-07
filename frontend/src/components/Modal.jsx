export default function Modal({ open, onClose, title, children, width }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-box card" style={width ? { width } : undefined}>
        {title && (
          <div className="modal-head">
            <h3 style={{ fontSize: 17 }}>{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
