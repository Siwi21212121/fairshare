import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  splits: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.5c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="side-brand">
        <Logo showText={false} size={17} />
        <span>FairShare</span>
      </div>
      <NavLink to="/dashboard" className={({ isActive }) => `side-item ${isActive ? 'active' : ''}`} onClick={onNavigate}>
        {icons.dashboard}
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/my-splits" className={({ isActive }) => `side-item ${isActive ? 'active' : ''}`} onClick={onNavigate}>
        {icons.splits}
        <span>My Splits</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `side-item ${isActive ? 'active' : ''}`} onClick={onNavigate}>
        {icons.history}
        <span>History</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `side-item ${isActive ? 'active' : ''}`} onClick={onNavigate}>
        {icons.settings}
        <span>Settings</span>
      </NavLink>
      <button
        className="btn btn-primary side-new"
        onClick={() => {
          onNavigate?.();
          navigate('/new-split');
        }}
      >
        {icons.add} New Split
      </button>
      <div className="side-spacer" />
      <div className="side-user">
        <b>{user?.name}</b>
        {user?.email}
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mobile-topbar">
        <div className="side-brand">
          <Logo showText size={17} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)} aria-label="Open menu">
          {icons.menu}
        </button>
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? 'open' : ''}`}>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
}
