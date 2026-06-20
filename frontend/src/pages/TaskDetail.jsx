import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, commentsRes] = await Promise.all([
          api.get(`/tasks/${id}`),
          api.get(`/comments/task/${id}`)
        ]);
        setTask(taskRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        addToast('Failed to load task', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/comments/task/${id}`, { content: commentText });
      const res = await api.get(`/comments/task/${id}`);
      setComments(res.data);
      setCommentText('');
      addToast('Comment added', 'success');
    } catch (err) {
      addToast('Failed to add comment', 'error');
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      setTask(prev => ({ ...prev, status }));
      addToast(`Status updated to ${status}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      addToast('Task deleted', 'success');
      navigate('/tasks');
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  if (loading) return <Loader />;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')} style={{ marginBottom: '8px' }}>← Back to Tasks</button>
          <h1 className="page-title">{task.title}</h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Badge type={task.status} />
            <Badge type={task.priority} />
            {task.project_name && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {task.project_name}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="danger" size="sm" onClick={deleteTask}>Delete</Button>
        </div>
      </div>

      <div className="tabs">
        {['details', 'comments', 'subtasks'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'comments' && `(${comments.length})`} {tab === 'subtasks' && `(${task.subtasks?.length || 0})`}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <Card>
            <div className="card-body">
              <h4 style={{ marginBottom: '16px' }}>Description</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{task.description || 'No description provided.'}</p>
            </div>
          </Card>
          <Card>
            <div className="card-body">
              <h4 style={{ marginBottom: '16px' }}>Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ marginBottom: '6px' }}>Status</label>
                  <select value={task.status} onChange={e => updateStatus(e.target.value)} style={{ width: '100%' }}>
                    {['Backlog', 'Todo', 'InProgress', 'Review', 'Done'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Assignee</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {task.assignee_name ? (
                      <><Avatar name={task.assignee_name} /><span>{task.assignee_name}</span></>
                    ) : <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>}
                  </div>
                </div>
                <div>
                  <label>Due Date</label>
                  <p>{task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}</p>
                </div>
                <div>
                  <label>Estimated Hours</label>
                  <p>{task.estimated_hours || 0}h</p>
                </div>
                <div>
                  <label>Created</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(task.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'comments' && (
        <Card>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <Avatar name={user?.name || 'User'} />
              <div style={{ flex: 1 }}>
                <textarea placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} style={{ marginBottom: '8px' }}></textarea>
                <Button size="sm" onClick={addComment} disabled={!commentText.trim()}>Post Comment</Button>
              </div>
            </div>
            <div className="comment-thread">
              {comments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px' }}>No comments yet. Start the conversation!</p>
              ) : comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <Avatar name={comment.user_name} size="sm" />
                  <div className="comment-body">
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'subtasks' && (
        <Card>
          <div className="card-body">
            {(!task.subtasks || task.subtasks.length === 0) ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px' }}>No subtasks</p>
            ) : task.subtasks.map(sub => (
              <div key={sub.id} className="checklist-item">
                <input type="checkbox" checked={sub.status === 'Done'} onChange={() => {
                  const newStatus = sub.status === 'Done' ? 'Todo' : 'Done';
                  api.patch(`/tasks/${sub.id}/status`, { status: newStatus }).then(() => {
                    setTask(prev => ({
                      ...prev,
                      subtasks: prev.subtasks.map(s => s.id === sub.id ? { ...s, status: newStatus } : s)
                    }));
                  });
                }} />
                <span className={sub.status === 'Done' ? 'done' : ''}>{sub.title}</span>
                <Badge type={sub.priority} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaskDetail;
