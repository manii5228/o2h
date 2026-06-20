import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

const Reports = () => {
  const [reportType, setReportType] = useState('project'); // 'project', 'overdue', 'time'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const { addToast } = useToast();

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'project') {
        const res = await api.get('/projects');
        setData(res.data);
      } else if (reportType === 'overdue') {
        const res = await api.get('/dashboard/overdue');
        setData(res.data);
      } else if (reportType === 'time') {
        const res = await api.get('/time-entries');
        setData(res.data);
      }
    } catch (err) {
      addToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    let rows = [];

    if (reportType === 'project') {
      headers = ['Project Name', 'Status', 'RAG Status', 'Budget ($)', 'Tasks Total', 'Tasks Completed', 'Progress (%)'];
      rows = data.map(p => [
        p.name,
        p.status,
        p.rag_status,
        p.budget || 0,
        p.task_count || 0,
        p.completed_tasks || 0,
        p.task_count > 0 ? Math.round(p.completed_tasks / p.task_count * 100) : 0
      ]);
    } else if (reportType === 'overdue') {
      headers = ['Task Title', 'Project', 'Assignee', 'Due Date', 'Priority', 'Status'];
      rows = data.map(t => [
        t.title,
        t.project_name || 'N/A',
        t.assignee_name || 'Unassigned',
        t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A',
        t.priority,
        t.status
      ]);
    } else if (reportType === 'time') {
      headers = ['Date', 'User', 'Task', 'Hours Logged', 'Description', 'Billable', 'Status'];
      rows = data.map(entry => [
        entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A',
        entry.user_name || 'N/A',
        entry.task_title || 'N/A',
        entry.hours,
        entry.description || '',
        entry.is_billable ? 'Yes' : 'No',
        entry.status
      ]);
    }

    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      const row = rowArray.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported successfully', 'success');
  };

  const getReportSummary = () => {
    if (reportType === 'project') {
      const totalBudget = data.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
      const totalTasks = data.reduce((sum, p) => sum + (p.task_count || 0), 0);
      const completedTasks = data.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);
      const overallProgress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

      return (
        <div className="stats-grid">
          <Card className="stat-card stat-secondary">
            <div className="stat-icon">📁</div>
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Total Projects</div>
          </Card>
          <Card className="stat-card stat-accent">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${totalBudget.toLocaleString()}</div>
            <div className="stat-label">Total Budget Portfolio</div>
          </Card>
          <Card className="stat-card stat-bright">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{overallProgress}%</div>
            <div className="stat-label">Portfolio Completion</div>
          </Card>
        </div>
      );
    } else if (reportType === 'overdue') {
      const criticalCount = data.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
      return (
        <div className="stats-grid">
          <Card className="stat-card stat-primary">
            <div className="stat-icon">⚠️</div>
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Overdue Tasks</div>
          </Card>
          <Card className="stat-card stat-primary">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{criticalCount}</div>
            <div className="stat-label">High & Critical Priority Overdue</div>
          </Card>
        </div>
      );
    } else if (reportType === 'time') {
      const totalHours = data.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);
      const approvedHours = data.filter(e => e.status === 'Approved').reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);
      const billableHours = data.filter(e => e.is_billable).reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);

      return (
        <div className="stats-grid">
          <Card className="stat-card stat-secondary">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{totalHours} hrs</div>
            <div className="stat-label">Total Logged Hours</div>
          </Card>
          <Card className="stat-card stat-bright">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{approvedHours} hrs</div>
            <div className="stat-label">Approved Hours</div>
          </Card>
          <Card className="stat-card stat-accent">
            <div className="stat-icon">💵</div>
            <div className="stat-value">{billableHours} hrs</div>
            <div className="stat-label">Billable Hours</div>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Generate custom reports, export data, and track portfolio statistics.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={downloadCSV} disabled={loading || data.length === 0}>
            📤 Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            🖨️ Print PDF
          </Button>
        </div>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant={reportType === 'project' ? 'primary' : 'ghost'} onClick={() => setReportType('project')}>
            📁 Project Portfolio
          </Button>
          <Button variant={reportType === 'overdue' ? 'primary' : 'ghost'} onClick={() => setReportType('overdue')}>
            ⚠️ Overdue Tasks
          </Button>
          <Button variant={reportType === 'time' ? 'primary' : 'ghost'} onClick={() => setReportType('time')}>
            ⏱️ Timesheet & Workload
          </Button>
        </div>
      </Card>

      {getReportSummary()}

      {loading ? (
        <Loader />
      ) : data.length === 0 ? (
        <EmptyState icon="📊" title="No data available" message="There are no records in the system that match this report type." />
      ) : (
        <Card>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                {reportType === 'project' && (
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>RAG Status</th>
                    <th>Budget</th>
                    <th>Tasks</th>
                    <th>Completed</th>
                    <th>Progress</th>
                  </tr>
                )}
                {reportType === 'overdue' && (
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                )}
                {reportType === 'time' && (
                  <tr>
                    <th>Date</th>
                    <th>User Name</th>
                    <th>Task</th>
                    <th>Hours</th>
                    <th>Description</th>
                    <th>Billable</th>
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {reportType === 'project' && data.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><Badge type={p.status || 'Active'} /></td>
                    <td><Badge type={p.rag_status || 'Green'} /></td>
                    <td style={{ fontWeight: 500 }}>${(parseFloat(p.budget) || 0).toLocaleString()}</td>
                    <td>{p.task_count || 0}</td>
                    <td>{p.completed_tasks || 0}</td>
                    <td style={{ width: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '80px', marginBottom: 0 }}>
                          <div className="progress-fill" style={{ width: `${p.task_count > 0 ? (p.completed_tasks / p.task_count * 100) : 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.task_count > 0 ? Math.round(p.completed_tasks / p.task_count * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {reportType === 'overdue' && data.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>{t.project_name || 'N/A'}</td>
                    <td>{t.assignee_name || 'Unassigned'}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td><Badge type={t.priority} /></td>
                    <td><Badge type={t.status} /></td>
                  </tr>
                ))}

                {reportType === 'time' && data.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{entry.user_name}</td>
                    <td>{entry.task_title || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{entry.hours} hrs</td>
                    <td>{entry.description}</td>
                    <td>
                      <span style={{ color: entry.is_billable ? 'var(--bright-dark)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                        {entry.is_billable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td><Badge type={entry.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
