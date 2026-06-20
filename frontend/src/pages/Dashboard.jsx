import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, overdueRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
          api.get('/dashboard/overdue')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setOverdue(overdueRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="page-subtitle">Workspace overview and portfolio performance metrics.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card stat-secondary" lift>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-value">{stats?.projects?.active || 0}</div>
          <div className="stat-label">Active Projects</div>
        </Card>

        <Card className="stat-card stat-primary" lift>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-value">{stats?.tasks?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </Card>

        <Card className="stat-card stat-accent" lift>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>
          <div className="stat-value">{stats?.tasks?.in_progress || 0}</div>
          <div className="stat-label">In Progress</div>
        </Card>

        <Card className="stat-card stat-bright" lift>
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-value">{stats?.tasks?.overdue || 0}</div>
          <div className="stat-label">Overdue Tasks</div>
        </Card>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Recent Activity
            </h3>
          </div>
          <div className="card-body">
            {activity.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px' }}>No recent activity logged</p>
            ) : (
              activity.slice(0, 10).map(item => (
                <div key={item.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{item.user_name}</strong> {item.action}
                      {item.details && <span style={{ color: 'var(--text-secondary)' }}> — {item.details.substring(0, 50)}</span>}
                    </div>
                    <div className="activity-time">{formatTime(item.created_at)}{item.project_name && ` · ${item.project_name}`}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Overdue Tasks
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          <div className="card-body">
            {overdue.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px' }}>No overdue tasks currently</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.slice(0, 8).map(task => (
                    <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{task.project_name}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{new Date(task.due_date).toLocaleDateString()}</td>
                      <td><Badge type={task.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div className="grid-3">
          <Card className="stat-card" lift>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tasks Completed</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--bright-dark)', fontWeight: 700 }}>
                {stats?.tasks?.completed || 0} / {stats?.tasks?.total || 0}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats?.tasks?.total ? (stats.tasks.completed / stats.tasks.total * 100) : 0}%` }}></div>
            </div>
          </Card>
          <Card className="stat-card" lift>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Budget Portfolio</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>Active</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--secondary)', fontSize: '1.5rem' }}>${Number(stats?.total_budget || 0).toLocaleString()}</div>
          </Card>
          <Card className="stat-card" lift>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Team Directory</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--warm)', fontWeight: 700 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
            </div>
            <div className="stat-value" style={{ color: 'var(--warm)', fontSize: '1.5rem' }}>{stats?.total_users || 0} members</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
