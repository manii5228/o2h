import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '', budget: '', priority: 'Medium' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', form);
      addToast('Project created successfully!', 'success');
      setShowModal(false);
      setForm({ name: '', description: '', start_date: '', end_date: '', budget: '', priority: 'Medium' });
      fetchProjects();
    } catch (err) {
      addToast('Failed to create project', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects total</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Project</Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          } 
          title="No projects yet" 
          message="Create your first project to start tracking tasks and milestones." 
          actionText="Create Project" 
          onAction={() => setShowModal(true)} 
        />
      ) : (
        <div className="grid-3">
          {projects.map(project => (
            <Card key={project.id} className="project-card" lift onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="project-card-header">
                <h3 className="project-card-title">{project.name}</h3>
                <Badge type={project.rag_status || 'Green'} />
              </div>
              <p className="project-card-desc">{project.description || 'No description'}</p>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <span>Progress</span>
                  <span>{project.task_count > 0 ? Math.round(project.completed_tasks / project.task_count * 100) : 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.task_count > 0 ? (project.completed_tasks / project.task_count * 100) : 0}%` }}></div>
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-card-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {project.task_count || 0} tasks
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {project.member_count || 0}
                  </span>
                </div>
                <Badge type={project.status || 'Active'} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project" footer={
        <>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Create Project</Button>
        </>
      }>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="proj-name">Project Name</label>
            <input id="proj-name" type="text" placeholder="Enter project name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="proj-desc">Description</label>
            <textarea id="proj-desc" placeholder="Project description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-start">Start Date</label>
              <input id="proj-start" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="proj-end">End Date</label>
              <input id="proj-end" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-budget">Budget ($)</label>
              <input id="proj-budget" type="number" placeholder="0.00" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="proj-priority">Priority</label>
              <select id="proj-priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
