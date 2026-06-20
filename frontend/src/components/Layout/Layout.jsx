import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/time-tracking': 'Time Tracking',
  '/bugs': 'Bug Tracker',
  '/team': 'Team',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    if (location.pathname.startsWith('/tasks/')) return 'Task Details';
    return pageTitles[location.pathname] || 'ProjectHub';
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header title={getTitle()} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
