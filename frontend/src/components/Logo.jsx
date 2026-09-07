export default function Logo({ size = 20, showText = true, className = '' }) {
  return (
    <div className={`nav-brand ${className}`} style={{ fontSize: showText ? undefined : 0 }}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="9" cy="9" r="6.2" />
        <circle cx="15" cy="15" r="6.2" />
      </svg>
      {showText && <span>FairShare</span>}
    </div>
  );
}
