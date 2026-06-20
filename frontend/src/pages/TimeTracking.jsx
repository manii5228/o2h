import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const TimeTracking = () => {
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTask, setTimerTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ task_id: '', hours: '', notes: '', date: new Date().toISOString().split('T')[0], is_billable: true });
  const intervalRef = useRef(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myRes, tasksRes, allRes] = await Promise.all([
          api.get('/time-entries/my'),
          api.get('/tasks/my'),
          user?.role === 'PM' || user?.role === 'TeamLead' ? api.get('/time-entries?status=Pending') : Promise.resolve({ data: [] })
        ]);
        setEntries(myRes.data);
        setTasks(tasksRes.data);
        setAllEntries(allRes.data);
      } catch (err) {
        addToast('Failed to load time entries', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const savedTimer = localStorage.getItem('timer');
    if (savedTimer) {
      const { seconds, running, task } = JSON.parse(savedTimer);
      if (running) {
        setTimerSeconds(seconds);
        setTimerTask(task);
        setTimerRunning(true);
      }
    }
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem('timer', JSON.stringify({ seconds: next, running: true, task: timerTask }));
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timerTask]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startTimer = () => {
    if (!timerTask) { addToast('Select a task first', 'warning'); return; }
    setTimerRunning(true);
  };

  const stopTimer = async () => {
    setTimerRunning(false);
    const hours = parseFloat((timerSeconds / 3600).toFixed(2));
    if (hours > 0 && timerTask) {
      try {
        await api.post('/time-entries', { task_id: parseInt(timerTask), hours, date: new Date().toISOString().split('T')[0], notes: 'Tracked via timer' });
        addToast(`Logged ${hours}h`, 'success');
        const res = await api.get('/time-entries/my');
        setEntries(res.data);
      } catch (err) {
        addToast('Failed to log time', 'error');
      }
    }
    setTimerSeconds(0);
    localStorage.removeItem('timer');
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    localStorage.removeItem('timer');
  };

  const logManual = async (e) => {
    e.preventDefault();
    try {
      await api.post('/time-entries', logForm);
      addToast('Time logged', 'success');
      setShowLog(false);
      setLogForm({ task_id: '', hours: '', notes: '', date: new Date().toISOString().split('T')[0], is_billable: true });
      const res = await api.get('/time-entries/my');
      setEntries(res.data);
    } catch (err) {
      addToast('Failed to log time', 'error');
    }
  };

  const handleApproval = async (entryId, action) => {
    try {
      await api.patch(`/time-entries/${entryId}/${action}`);
      addToast(`Time entry ${action}d`, 'success');
      const res = await api.get('/time-entries?status=Pending');
      setAllEntries(res.data);
    } catch (err) {
      addToast(`Failed to ${action}`, 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Time Tracking</h1>
          <p className="page-subtitle">Track and manage your work hours</p>
        </div>
        <Button onClick={() => setShowLog(true)}>+ Log Time</Button>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card className="timer-widget">
          <h3 style={{ opacity: 0.85, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timer
          </h3>
          <div className="timer-display">{formatTimer(timerSeconds)}</div>
          <div style={{ marginBottom: '16px' }}>
            <select value={timerTask} onChange={e => setTimerTask(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', maxWidth: '250px' }}>
              <option value="">Select task...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="timer-controls">
            {!timerRunning ? (
              <button className="btn btn-accent" onClick={startTimer} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopTimer} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" />
                </svg>
                Stop & Log
              </button>
            )}
            <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={resetTimer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Reset
            </button>
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3>Summary</h3>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {entries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0).toFixed(1)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Hours</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bright)' }}>
                  {entries.filter(e => e.status === 'Approved').reduce((sum, e) => sum + parseFloat(e.hours || 0), 0).toFixed(1)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approved</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card>
          <div className="card-header">
            <h3>My Time Entries</h3>
          </div>
          {entries.length === 0 ? (
            <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px' }}>No time entries yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Task</th><th>Project</th><th>Hours</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600 }}>{entry.task_title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{entry.project_name}</td>
                    <td>{entry.hours}h</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(entry.date).toLocaleDateString()}</td>
                    <td><Badge type={entry.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {(user?.role === 'PM' || user?.role === 'TeamLead') && allEntries.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Card>
            <div className="card-header">
              <h3>Pending Approvals</h3>
              <Badge type="Pending" text={`${allEntries.length} pending`} />
            </div>
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Task</th><th>Hours</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {allEntries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600 }}>{entry.user_name}</td>
                    <td>{entry.task_title}</td>
                    <td>{entry.hours}h</td>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="accent" size="sm" onClick={() => handleApproval(entry.id, 'approve')}>✓</Button>
                        <Button variant="danger" size="sm" onClick={() => handleApproval(entry.id, 'reject')}>✕</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Time</h3>
              <button className="modal-close" onClick={() => setShowLog(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={logManual}>
              <div className="form-group">
                <label>Task</label>
                <select value={logForm.task_id} onChange={e => setLogForm({ ...logForm, task_id: e.target.value })} required>
                  <option value="">Select task...</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Hours</label>
                  <input type="number" step="0.25" value={logForm.hours} onChange={e => setLogForm({ ...logForm, hours: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} placeholder="What did you work on?"></textarea>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={logForm.is_billable} onChange={e => setLogForm({ ...logForm, is_billable: e.target.checked })} style={{ width: 'auto' }} />
                  Billable Hours
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button variant="outline" onClick={() => setShowLog(false)}>Cancel</Button>
                <Button type="submit">Log Time</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;
