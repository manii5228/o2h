import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import Card from '../components/common/Card';
import { useToast } from '../components/common/Toast';

const STATUSES = ['Backlog', 'Todo', 'InProgress', 'Review', 'Done'];
const STATUS_COLORS = { Backlog: '#8b92a8', Todo: '#0080c7', InProgress: '#c9503d', Review: '#22346c', Done: '#27bcd1' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project_id: '', assignee_id: '', priority: 'Medium', status: 'Todo', due_date: '', estimated_hours: '' });
  const [saving, setSaving] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchTasks = async () => {
    try {
      const projectId = searchParams.get('project_id');
      const url = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
      const [tasksRes, projRes, usersRes] = await Promise.all([
        api.get(url),
        api.get('/projects'),
        api.get('/auth/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_id) { addToast('Please select a project', 'warning'); return; }
    setSaving(true);
    try {
      await api.post('/tasks', form);
      addToast('Task created!', 'success');
      setShowModal(false);
      setForm({ title: '', description: '', project_id: '', assignee_id: '', priority: 'Medium', status: 'Todo', due_date: '', estimated_hours: '' });
      fetchTasks();
    } catch (err) {
      addToast('Failed to create task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, status) => {
    e.currentTarget.classList.remove('drag-over');
    if (!draggedTask || draggedTask.status === status) return;
    try {
      await api.patch(`/tasks/${draggedTask.id}/status`, { status });
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? { ...t, status } : t));
      addToast(`Moved to ${status}`, 'success');
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  if (loading) return <Loader />;

  const getDaysText = (dueDate) => {
    if (!dueDate) return '';
    const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="view-toggle">
            {['kanban', 'list', 'calendar', 'gantt'].map(v => (
              <button key={v} className={`view-toggle-btn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowModal(true)}>+ New Task</Button>
        </div>
      </div>

      {tasks.length === 0 && view !== 'kanban' ? (
        <EmptyState 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          } 
          title="No tasks yet" 
          message="Create your first task to get started with project tracking." 
          actionText="Create Task" 
          onAction={() => setShowModal(true)} 
        />
      ) : view === 'kanban' ? (
        <div className="kanban-board">
          {STATUSES.map(status => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="kanban-column" onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, status)}>
                <div className="kanban-column-header" style={{ borderBottomColor: STATUS_COLORS[status] }}>
                  <span className="kanban-column-title" style={{ color: STATUS_COLORS[status] }}>{status.replace('InProgress', 'In Progress')}</span>
                  <span className="kanban-count">{columnTasks.length}</span>
                </div>
                <div className="kanban-cards">
                  {columnTasks.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Drop tasks here</div>
                  )}
                  {columnTasks.map(task => (
                    <div key={task.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, task)} onDragEnd={handleDragEnd} onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Badge type={task.priority} />
                        {task.project_name && <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{task.project_name}</span>}
                      </div>
                      <div className="kanban-card-title">{task.title}</div>
                      <div className="kanban-card-meta">
                        <span style={{ color: task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'var(--primary)' : 'inherit' }}>
                          {getDaysText(task.due_date)}
                        </span>
                        {task.assignee_name && <Avatar name={task.assignee_name} size="sm" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'list' ? (
        <Card>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600 }}>{task.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{task.project_name}</td>
                  <td><Badge type={task.status} /></td>
                  <td><Badge type={task.priority} /></td>
                  <td>
                    {task.assignee_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={task.assignee_name} size="sm" />
                        <span style={{ fontSize: '0.85rem' }}>{task.assignee_name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
       ) : view === 'calendar' ? (
        <Card>
          <div className="card-body">
            <CalendarView tasks={tasks} navigate={navigate} />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="card-body">
            <GanttView tasks={tasks} navigate={navigate} />
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="lg" footer={
        <><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit} loading={saving}>Create Task</Button></>
      }>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Task description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} required>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assignee</label>
              <select value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Estimated Hours</label>
              <input type="number" placeholder="0" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const CalendarView = ({ tasks, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: d });

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));
  };

  const priorityColors = { Low: 'var(--bright)', Medium: 'var(--accent)', High: 'var(--warm)', Critical: 'var(--primary)' };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1))}>← Prev</button>
        <h3>{monthNames[month]} {year}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1))}>Next →</button>
      </div>
      <div className="calendar-grid">
        {days.map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
        {cells.map(cell => (
          <div key={cell.key} className={`calendar-cell ${cell.day && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'today' : ''} ${!cell.day ? 'other-month' : ''}`}>
            {cell.day && (
              <>
                <div className="calendar-date">{cell.day}</div>
                {getTasksForDay(cell.day).slice(0, 3).map(task => (
                  <div key={task.id} className="calendar-task" style={{ background: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }} onClick={() => navigate(`/tasks/${task.id}`)}>
                    {task.title}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

const GanttView = ({ tasks, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const getTaskGanttStyle = (task) => {
    const due = new Date(task.due_date);
    const day = due.getDate();
    const duration = 4;
    const startDay = Math.max(1, day - duration + 1);

    const priorityColors = {
      Low: 'var(--bright-dark)',
      Medium: 'var(--accent)',
      High: 'var(--warm)',
      Critical: 'var(--primary)'
    };

    return {
      gridColumnStart: startDay,
      gridColumnEnd: day + 1,
      background: priorityColors[task.priority] || 'var(--accent)'
    };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1))}>← Prev</button>
        <h3>{monthNames[month]} {year}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1))}>Next →</button>
      </div>

      {monthTasks.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          No tasks with deadlines in this month.
        </div>
      ) : (
        <div className="gantt-container" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${daysInMonth}, 35px)`,
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            minWidth: `${200 + daysInMonth * 35}px`
          }}>
            {/* Header row */}
            <div style={{ padding: '10px', fontWeight: 600, borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', background: 'var(--bg-tertiary)' }}>
              Tasks
            </div>
            {Array.from({ length: daysInMonth }).map((_, idx) => (
              <div key={idx} style={{
                textAlign: 'center',
                padding: '10px 0',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-light)',
                borderRight: idx === daysInMonth - 1 ? 'none' : '1px solid var(--border-light)',
                background: 'var(--bg-tertiary)'
              }}>
                {idx + 1}
              </div>
            ))}

            {/* Task rows */}
            {monthTasks.map(task => (
              <div key={task.id} style={{ display: 'contents' }}>
                {/* Task name */}
                <div style={{
                  padding: '12px 10px',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  borderBottom: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer'
                }} onClick={() => navigate(`/tasks/${task.id}`)}>
                  {task.title}
                </div>

                {/* Timeline Grid cell row */}
                <div style={{
                  gridColumn: `2 / span ${daysInMonth}`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${daysInMonth}, 35px)`,
                  borderBottom: '1px solid var(--border-light)',
                  position: 'relative',
                  height: '44px',
                  alignItems: 'center'
                }}>
                  {/* Grid background cells */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => (
                    <div key={idx} style={{
                      gridColumnStart: idx + 1,
                      gridColumnEnd: idx + 2,
                      height: '100%',
                      borderRight: idx === daysInMonth - 1 ? 'none' : '1px solid var(--border-light)',
                      opacity: 0.15
                    }}></div>
                  ))}

                  {/* Gantt bar */}
                  <div
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    style={{
                      ...getTaskGanttStyle(task),
                      height: '24px',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '10px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'absolute',
                      left: '4px',
                      right: '4px',
                      zIndex: 2,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                    title={`${task.title} (Due: ${new Date(task.due_date).toLocaleDateString()})`}
                  >
                    {task.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
