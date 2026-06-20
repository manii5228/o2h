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
        console.error(err);
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
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card stat-primary" lift>
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats?.projects?.active || 0}</div>
          <div className="stat-label">Active Projects</div>
        </Card>
        <Card className="stat-card stat-secondary" lift>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.tasks?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </Card>
        <Card className="stat-card stat-accent" lift>
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{stats?.tasks?.in_progress || 0}</div>
          <div className="stat-label">In Progress</div>
        </Card>
        <Card className="stat-card stat-bright" lift>
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats?.tasks?.overdue || 0}</div>
          <div className="stat-label">Overdue Tasks</div>
        </Card>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            {activity.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px' }}>No recent activity</p>
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
            <h3>Overdue Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          <div className="card-body">
            {overdue.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px' }}>🎉 No overdue tasks!</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due</th>
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
              <span style={{ fontSize: '0.85rem', color: 'var(--bright)', fontWeight: 700 }}>{stats?.tasks?.completed || 0}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats?.tasks?.total ? (stats.tasks.completed / stats.tasks.total * 100) : 0}%` }}></div>
            </div>
          </Card>
          <Card className="stat-card" lift>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Budget</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>Active</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--secondary)', fontSize: '1.5rem' }}>${Number(stats?.total_budget || 0).toLocaleString()}</div>
          </Card>
          <Card className="stat-card" lift>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Team Members</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--warm)', fontWeight: 700 }}>👥</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--warm)', fontSize: '1.5rem' }}>{stats?.total_users || 0}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
