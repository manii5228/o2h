import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/tasks')
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      addToast('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserWorkload = (userId) => {
    const userTasks = tasks.filter(t => t.assignee_id === userId && t.status !== 'Done');
    const taskCount = userTasks.length;
    let status = 'Green';
    let statusText = 'Available';

    if (taskCount >= 5) {
      status = 'Red';
      statusText = 'Overloaded';
    } else if (taskCount >= 3) {
      status = 'Amber';
      statusText = 'Busy';
    }

    return {
      count: taskCount,
      status,
      statusText,
      tasks: userTasks
    };
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Directory</h1>
          <p className="page-subtitle">Manage allocations, track workload, and view skills directory.</p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warm)' }}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          Workload Allocation Heatmap
        </h2>
        <div className="grid-3">
          {users.map(user => {
            const workload = getUserWorkload(user.id);
            return (
              <Card key={`workload-${user.id}`} className="stat-card" style={{ borderLeft: `4px solid var(--${workload.status === 'Green' ? 'bright-dark' : workload.status === 'Red' ? 'primary' : 'warm'})` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Avatar name={user.name} size="md" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{user.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.role}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Tasks:</span>
                  <span style={{ fontWeight: 700 }}>{workload.count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <Badge type={workload.status} text={workload.statusText} />
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div className="progress-bar" style={{ marginBottom: 0 }}>
                    <div className="progress-fill" style={{
                      width: `${Math.min((workload.count / 6) * 100, 100)}%`,
                      backgroundColor: `var(--${workload.status === 'Green' ? 'bright-dark' : workload.status === 'Red' ? 'primary' : 'warm'})`
                    }}></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Members List
        </h2>
        {users.length === 0 ? (
          <EmptyState 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            } 
            title="No members found" 
            message="Add members to invite them to this project tracker." 
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {users.map(user => {
              let skillsList = [];
              try {
                if (user.skills) {
                  skillsList = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
                }
              } catch (e) {
                skillsList = String(user.skills).split(',').map(s => s.trim());
              }

              return (
                <Card key={user.id} className="team-member-card">
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <Avatar name={user.name} size="lg" />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{user.name}</h3>
                        <Badge type={user.role} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          {user.email}
                        </span>
                        &bull;
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {user.phone || 'No phone'}
                        </span>
                        &bull;
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M9 12h6" /><path d="M9 8h6" /></svg>
                          {user.department || 'No department'}
                        </span>
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {skillsList.map((skill, idx) => (
                          <span key={idx} style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                          }}>
                            {skill}
                          </span>
                        ))}
                        {skillsList.length === 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
