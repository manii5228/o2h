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
  
  // Milestone modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
  
  // Member modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Edit project modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    priority: 'Medium',
    status: 'Active',
    rag_status: 'Green'
  });
  const [savingProject, setSavingProject] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes, msRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
        api.get(`/milestones/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMilestones(msRes.data);
      
      // Initialize edit form values
      setEditForm({
        name: projRes.data.name || '',
        description: projRes.data.description || '',
        start_date: projRes.data.start_date ? projRes.data.start_date.split('T')[0] : '',
        end_date: projRes.data.end_date ? projRes.data.end_date.split('T')[0] : '',
        budget: projRes.data.budget || '',
        priority: projRes.data.priority || 'Medium',
        status: projRes.data.status || 'Active',
        rag_status: projRes.data.rag_status || 'Green'
      });
    } catch (err) {
      addToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
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
      // Filter list so ONLY Team Leads are able to be added as project members
      setUsers(res.data.filter(u => u.role === 'TeamLead'));
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
      setSelectedUser('');
      addToast('Team Lead added as member', 'success');
    } catch (err) {
      addToast('Failed to add member', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      await api.put(`/projects/${id}`, editForm);
      addToast('Project updated successfully!', 'success');
      setShowEditModal(false);
      fetchProjectData();
    } catch (err) {
      addToast('Failed to update project', 'error');
    } finally {
      setSavingProject(false);
    }
  };

  if (loading) return <Loader />;
  if (!project) return <div style={{ padding: '24px', textAlign: 'center' }}>Project not found</div>;

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round(completedTasks / tasks.length * 100) : 0;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <Badge type={project.rag_status || 'Green'} />
            <Badge type={project.status || 'Active'} />
          </div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => setShowEditModal(true)}>Edit Project</Button>
          <Button onClick={() => navigate('/tasks?project_id=' + id)}>View Tasks</Button>
        </div>
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
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Project Specifications
              </h4>
              <div className="grid-2">
                <div><strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not scheduled'}</div>
                <div><strong>End Date:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not scheduled'}</div>
                <div><strong>Priority:</strong> <Badge type={project.priority || 'Medium'} /></div>
                <div><strong>Project Manager:</strong> {project.creator_name || 'N/A'}</div>
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
            <Card><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px' }}>No milestones scheduled yet</div></Card>
          ) : (
            milestones.map(ms => (
              <Card key={ms.id} style={{ marginBottom: '12px' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{ms.title}</h4>
                      {ms.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{ms.description}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge type={ms.status || 'Pending'} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Due: {ms.due_date ? new Date(ms.due_date).toLocaleDateString() : 'No deadline'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${ms.task_count > 0 ? (ms.completed_tasks / ms.task_count * 100) : 0}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{ms.completed_tasks}/{ms.task_count} tasks completed</span>
                  </div>
                </div>
              </Card>
            ))
          )}

          <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone" footer={
            <><Button variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancel</Button><Button onClick={addMilestone}>Add Milestone</Button></>
          }>
            <form onSubmit={addMilestone}>
              <div className="form-group">
                <label>Milestone Title</label>
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
            </form>
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
                      <h4 style={{ fontWeight: 600 }}>{member.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</p>
                      <Badge type={member.role} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Project Member (Team Leads Only)" size="sm" footer={
            <><Button variant="outline" onClick={() => setShowMemberModal(false)}>Cancel</Button><Button onClick={addMember}>Add Member</Button></>
          }>
            <div className="form-group">
              <label>Select Team Lead</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Choose a team lead...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </Modal>
        </>
      )}

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project Details" size="lg" footer={
        <><Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button><Button onClick={handleEditSubmit} loading={savingProject}>Save Changes</Button></>
      }>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={editForm.start_date} onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={editForm.end_date} onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget ($)</label>
              <input type="number" value={editForm.budget} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Project Status</label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="form-group">
              <label>RAG Status</label>
              <select value={editForm.rag_status} onChange={e => setEditForm({ ...editForm, rag_status: e.target.value })}>
                <option value="Green">Green</option>
                <option value="Amber">Amber</option>
                <option value="Red">Red</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
