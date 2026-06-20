import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const BugTracker = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ project_id: '', title: '', description: '', environment: '', steps_to_reproduce: '', expected_behavior: '', severity: 'Medium', assigned_to: '' });
  const [filter, setFilter] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchBugs = async () => {
    try {
      const [bugsRes, projRes, usersRes] = await Promise.all([
        api.get('/bugs'),
        api.get('/projects'),
        api.get('/auth/users')
      ]);
      setBugs(bugsRes.data);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      addToast('Failed to load bugs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBugs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bugs', form);
      addToast('Bug reported!', 'success');
      setShowModal(false);
      setForm({ project_id: '', title: '', description: '', environment: '', steps_to_reproduce: '', expected_behavior: '', severity: 'Medium', assigned_to: '' });
      fetchBugs();
    } catch (err) {
      addToast('Failed to report bug', 'error');
    }
  };

  const updateBugStatus = async (bugId, status) => {
    try {
      await api.put(`/bugs/${bugId}`, { status });
      setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status } : b));
      addToast('Bug status updated', 'success');
    } catch (err) {
      addToast('Failed to update bug', 'error');
    }
  };

  if (loading) return <Loader />;

  const filtered = filter ? bugs.filter(b => b.status === filter) : bugs;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bug Tracker</h1>
          <p className="page-subtitle">{bugs.length} bugs reported</p>
        </div>
        <Button onClick={() => setShowModal(true)}>🐛 Report Bug</Button>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge type="Open" text={`${bugs.filter(b => b.status === 'Open').length} Open`} />
          <Badge type="InProgress" text={`${bugs.filter(b => b.status === 'InProgress').length} In Progress`} />
          <Badge type="Resolved" text={`${bugs.filter(b => b.status === 'Resolved').length} Resolved`} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🐛" title="No bugs found" message="No bugs match your current filter. That's a good sign!" />
      ) : (
        <Card>
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Project</th><th>Severity</th><th>Status</th><th>Reporter</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(bug => (
                <tr key={bug.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{bug.title}</div>
                    {bug.environment && <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Env: {bug.environment}</div>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{bug.project_name}</td>
                  <td><Badge type={bug.severity} /></td>
                  <td><Badge type={bug.status} /></td>
                  <td>{bug.reporter_name}</td>
                  <td>
                    <select value={bug.status} onChange={e => updateBugStatus(bug.id, e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}>
                      <option value="Open">Open</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Bug" size="lg" footer={
        <><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>Report Bug</Button></>
      }>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} required>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="Brief bug title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Describe the bug..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <div className="form-group">
            <label>Environment</label>
            <input type="text" placeholder="e.g., Chrome 120, Windows 11" value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Steps to Reproduce</label>
            <textarea placeholder="1. Go to... 2. Click..." value={form.steps_to_reproduce} onChange={e => setForm({ ...form, steps_to_reproduce: e.target.value })}></textarea>
          </div>
          <div className="form-group">
            <label>Expected Behavior</label>
            <textarea placeholder="What should have happened..." value={form.expected_behavior} onChange={e => setForm({ ...form, expected_behavior: e.target.value })}></textarea>
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BugTracker;
