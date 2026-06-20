import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Avatar from '../components/common/Avatar';
import { useToast } from '../components/common/Toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes, msRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?project_id=${id}`),
          api.get(`/milestones/project/${id}`)
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        setMilestones(msRes.data);
      } catch (err) {
        addToast('Failed to load project', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/milestones/project/${id}`, milestoneForm);
      const msRes = await api.get(`/milestones/project/${id}`);
      setMilestones(msRes.data);
      setShowMilestoneModal(false);
      setMilestoneForm({ title: '', description: '', due_date: '' });
      addToast('Milestone added', 'success');
    } catch (err) {
      addToast('Failed to add milestone', 'error');
    }
  };

  const openMemberModal = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setShowMemberModal(true);
    } catch (err) {
      addToast('Failed to load users', 'error');
    }
  };

  const addMember = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/projects/${id}/members`, { user_id: parseInt(selectedUser) });
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
      setShowMemberModal(false);
      addToast('Member added', 'success');
    } catch (err) {
      addToast('Failed to add member', 'error');
    }
  };

  if (loading) return <Loader />;
  if (!project) return <div>Project not found</div>;

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round(completedTasks / tasks.length * 100) : 0;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
            <Badge type={project.rag_status || 'Green'} />
            <Badge type={project.status || 'Active'} />
          </div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        <Button onClick={() => navigate('/tasks?project_id=' + id)}>View Tasks</Button>
      </div>

      <div className="tabs">
        {['overview', 'milestones', 'members'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <Card className="stat-card stat-primary" lift>
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </Card>
            <Card className="stat-card stat-bright" lift>
              <div className="stat-value">{completedTasks}</div>
              <div className="stat-label">Completed</div>
            </Card>
            <Card className="stat-card stat-accent" lift>
              <div className="stat-value">{progress}%</div>
              <div className="stat-label">Progress</div>
            </Card>
            <Card className="stat-card stat-secondary" lift>
              <div className="stat-value">${Number(project.budget || 0).toLocaleString()}</div>
              <div className="stat-label">Budget</div>
            </Card>
          </div>
          <Card>
            <div className="card-body">
              <h4 style={{ marginBottom: '16px' }}>Project Details</h4>
              <div className="grid-2">
                <div><strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</div>
                <div><strong>End Date:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}</div>
                <div><strong>Priority:</strong> <Badge type={project.priority || 'Medium'} /></div>
                <div><strong>Created by:</strong> {project.creator_name}</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'milestones' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={() => setShowMilestoneModal(true)}>+ Add Milestone</Button>
          </div>
          {milestones.length === 0 ? (
            <Card><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px' }}>No milestones yet</div></Card>
          ) : (
            milestones.map(ms => (
              <Card key={ms.id} style={{ marginBottom: '12px' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{ms.title}</h4>
                      {ms.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{ms.description}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge type={ms.status || 'Pending'} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {ms.due_date ? new Date(ms.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${ms.task_count > 0 ? (ms.completed_tasks / ms.task_count * 100) : 0}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{ms.completed_tasks}/{ms.task_count} tasks</span>
                  </div>
                </div>
              </Card>
            ))
          )}
          <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone" footer={
            <><Button variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancel</Button><Button onClick={addMilestone}>Add</Button></>
          }>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={milestoneForm.description} onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })}></textarea>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={milestoneForm.due_date} onChange={e => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })} />
            </div>
          </Modal>
        </>
      )}

      {activeTab === 'members' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={openMemberModal}>+ Add Member</Button>
          </div>
          {(project.members || []).length === 0 ? (
            <Card><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px' }}>No members added yet</div></Card>
          ) : (
            <div className="grid-3">
              {project.members.map(member => (
                <Card key={member.id} lift>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Avatar name={member.name} size="lg" />
                    <div>
                      <h4>{member.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</p>
                      <Badge type={member.role} text={member.role} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member" size="sm" footer={
            <><Button variant="outline" onClick={() => setShowMemberModal(false)}>Cancel</Button><Button onClick={addMember}>Add</Button></>
          }>
            <div className="form-group">
              <label>Select User</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Choose a user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProjectDetail;
