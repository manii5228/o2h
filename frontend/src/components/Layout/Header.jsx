import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';

const Header = ({ title, onMenuToggle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>☰</button>
        <h2 className="header-title">{title}</h2>
      </div>
      <div className="header-right">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." id="global-search" />
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode" id="theme-toggle">
          {isDark ? '☀️' : '🌙'}
        </button>
        <button className="notification-btn" id="notifications-btn">
          🔔
          <span className="notification-dot"></span>
        </button>
        <div className="user-menu" onClick={handleLogout} title="Logout">
          <Avatar name={user?.name || 'User'} />
        </div>
      </div>
    </header>
  );
};

export default Header;
