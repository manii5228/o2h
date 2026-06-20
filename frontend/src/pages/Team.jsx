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
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>🔥 Workload Allocation Heatmap</h2>
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
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>👥 Members List</h2>
        {users.length === 0 ? (
          <EmptyState icon="👥" title="No members found" message="Add members to invite them to this project tracker." />
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
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        ✉️ {user.email} &bull; 📞 {user.phone || 'No phone'} &bull; 🏢 {user.department || 'No department'}
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
