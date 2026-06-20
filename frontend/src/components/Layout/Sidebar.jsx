import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const mainNav = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/projects', icon: '📁', label: 'Projects' },
    { to: '/tasks', icon: '✅', label: 'Tasks' },
  ];

  const manageNav = [
    { to: '/time-tracking', icon: '⏱️', label: 'Time Tracking' },
    { to: '/bugs', icon: '🐛', label: 'Bug Tracker' },
    { to: '/team', icon: '👥', label: 'Team' },
    { to: '/reports', icon: '📈', label: 'Reports' },
  ];

  const settingsNav = [
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">O2</div>
          <span className="brand-text">ProjectHub</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            {mainNav.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            {manageNav.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">System</div>
            {settingsNav.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            <div className="avatar avatar-sm" style={{ background: '#a91f23' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'white' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem' }}>{user?.role || 'Contributor'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
