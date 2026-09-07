export default function Button({
  children,
  variant = 'primary',
  size,
  block,
  loading,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'ghost' && 'btn-ghost',
    variant === 'danger' && 'btn-danger',
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : children}
    </button>
  );
}
