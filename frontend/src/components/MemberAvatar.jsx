export default function MemberAvatar({ member, size = 'md', selectable, selected, onClick, showLabel }) {
  const initial = member?.initial || member?.displayName?.charAt(0)?.toUpperCase() || '?';
  const classes = [
    'avatar',
    size === 'sm' && 'sm',
    selectable && 'selectable',
    selectable && selected && 'selected',
  ]
    .filter(Boolean)
    .join(' ');

  const circle = (
    <div className={classes} onClick={selectable ? onClick : undefined} title={member?.displayName}>
      {initial}
    </div>
  );

  if (!showLabel) return circle;

  return (
    <div className="avatar-with-label" onClick={selectable ? onClick : undefined} style={{ cursor: selectable ? 'pointer' : 'default' }}>
      {circle}
      <span>{member?.displayName}</span>
    </div>
  );
}
