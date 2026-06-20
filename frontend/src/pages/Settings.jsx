import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import api from '../services/api';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    department: '',
    skills: ''
  });
  const [saving, setSaving] = useState(false);

  // Custom fields configuration state (mock/local persistence)
  const [customFields, setCustomFields] = useState(() => {
    const saved = localStorage.getItem('custom_fields');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Client Name', type: 'Text', entity: 'Project' },
      { id: 2, name: 'Estimated Launch Date', type: 'Date', entity: 'Project' },
      { id: 3, name: 'Pull Request URL', type: 'Text', entity: 'Task' }
    ];
  });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('Text');
  const [newFieldEntity, setNewFieldEntity] = useState('Project');

  // Workflow automation rules state (mock/local persistence)
  const [automationRules, setAutomationRules] = useState(() => {
    const saved = localStorage.getItem('automation_rules');
    return saved ? JSON.parse(saved) : [
      { id: 1, trigger: 'If status changes to Review', action: 'Assign to Team Lead', active: true },
      { id: 2, trigger: 'If task is Blocked', action: 'Notify PM via email', active: true },
      { id: 3, trigger: 'If task is Overdue', action: 'Change priority to Critical', active: false }
    ];
  });
  const [newTrigger, setNewTrigger] = useState('If status changes to Review');
  const [newAction, setNewAction] = useState('Assign to Team Lead');

  // Integrations state (mock/local persistence)
  const [integrations, setIntegrations] = useState(() => {
    const saved = localStorage.getItem('integrations');
    return saved ? JSON.parse(saved) : {
      slack: false,
      github: false,
      drive: false
    };
  });

  useEffect(() => {
    if (user) {
      let skillsStr = '';
      try {
        if (user.skills) {
          const parsed = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
          skillsStr = Array.isArray(parsed) ? parsed.join(', ') : String(user.skills);
        }
      } catch (e) {
        skillsStr = String(user.skills || '');
      }

      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        skills: skillsStr
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = profileForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        department: profileForm.department,
        skills: skillsArray
      });
      updateUser(res.data);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const updated = [
      ...customFields,
      { id: Date.now(), name: newFieldName, type: newFieldType, entity: newFieldEntity }
    ];
    setCustomFields(updated);
    localStorage.setItem('custom_fields', JSON.stringify(updated));
    setNewFieldName('');
    addToast('Custom field added', 'success');
  };

  const handleDeleteCustomField = (id) => {
    const updated = customFields.filter(f => f.id !== id);
    setCustomFields(updated);
    localStorage.setItem('custom_fields', JSON.stringify(updated));
    addToast('Custom field removed', 'info');
  };

  const handleAddAutomationRule = () => {
    const updated = [
      ...automationRules,
      { id: Date.now(), trigger: newTrigger, action: newAction, active: true }
    ];
    setAutomationRules(updated);
    localStorage.setItem('automation_rules', JSON.stringify(updated));
    addToast('Automation rule added', 'success');
  };

  const toggleAutomationRule = (id) => {
    const updated = automationRules.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setAutomationRules(updated);
    localStorage.setItem('automation_rules', JSON.stringify(updated));
  };

  const toggleIntegration = (key) => {
    const updated = { ...integrations, [key]: !integrations[key] };
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
    addToast(`${key.toUpperCase()} integration ${updated[key] ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure system preferences, profile, custom fields, and automations.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
        {/* Left Tabs */}
        <div>
          <Card style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Button 
                variant={activeTab === 'profile' ? 'primary' : 'ghost'} 
                style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Edit Profile
              </Button>
              <Button 
                variant={activeTab === 'preferences' ? 'primary' : 'ghost'} 
                style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={() => setActiveTab('preferences')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                Appearance
              </Button>
              <Button 
                variant={activeTab === 'customfields' ? 'primary' : 'ghost'} 
                style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={() => setActiveTab('customfields')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                Custom Fields
              </Button>
              <Button 
                variant={activeTab === 'automations' ? 'primary' : 'ghost'} 
                style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={() => setActiveTab('automations')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M12 2v2M5.22 5.22l1.42 1.42M18.78 5.22l-1.42 1.42" /><circle cx="12" cy="11" r="1" /></svg>
                Automations
              </Button>
              <Button 
                variant={activeTab === 'integrations' ? 'primary' : 'ghost'} 
                style={{ textAlign: 'left', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                onClick={() => setActiveTab('integrations')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                Integrations
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Content */}
        <div>
          {activeTab === 'profile' && (
            <Card>
              <div className="card-header">
                <h3 className="card-title">Profile Settings</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" placeholder="e.g. +123456789" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" placeholder="e.g. Engineering, Marketing" value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Skills (Comma-separated)</label>
                    <input type="text" placeholder="React, Node.js, Project Management" value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} />
                  </div>
                  <Button type="submit" loading={saving}>Save Changes</Button>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <div className="card-header">
                <h3 className="card-title">Visual Settings</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Dark Mode Preference</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Switch between dark theme and light theme.</p>
                  </div>
                  <Button variant={isDark ? 'primary' : 'outline'} onClick={toggleTheme}>
                    {isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'customfields' && (
            <Card>
              <div className="card-header">
                <h3 className="card-title">Manage Custom Fields</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>Field Name</label>
                    <input type="text" placeholder="e.g. Jira Key" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} />
                  </div>
                  <div style={{ width: '120px' }}>
                    <label>Type</label>
                    <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)}>
                      <option value="Text">Text</option>
                      <option value="Number">Number</option>
                      <option value="Date">Date</option>
                    </select>
                  </div>
                  <div style={{ width: '140px' }}>
                    <label>Applies To</label>
                    <select value={newFieldEntity} onChange={e => setNewFieldEntity(e.target.value)}>
                      <option value="Project">Project</option>
                      <option value="Task">Task</option>
                    </select>
                  </div>
                  <Button onClick={handleAddCustomField}>+ Add</Button>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field Name</th>
                      <th>Type</th>
                      <th>Entity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.map(f => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{f.type}</td>
                        <td>{f.entity}</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteCustomField(f.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'automations' && (
            <Card>
              <div className="card-header">
                <h3 className="card-title">Workflow Automation Rules</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label>Trigger Condition</label>
                    <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)}>
                      <option value="If status changes to Review">If status changes to "Review"</option>
                      <option value="If task is Blocked">If task is Blocked</option>
                      <option value="If task is Overdue">If task is Overdue</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label>Action To Execute</label>
                    <select value={newAction} onChange={e => setNewAction(e.target.value)}>
                      <option value="Assign to Team Lead">Assign to Team Lead</option>
                      <option value="Notify PM via email">Notify PM via email</option>
                      <option value="Change priority to Critical">Change priority to Critical</option>
                    </select>
                  </div>
                  <Button onClick={handleAddAutomationRule}>+ Rule</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {automationRules.map(rule => (
                    <Card key={rule.id} style={{ padding: '16px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warm)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            Trigger: {rule.trigger}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            Action: {rule.action}
                          </div>
                        </div>
                        <div>
                          <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                            <input type="checkbox" checked={rule.active} onChange={() => toggleAutomationRule(rule.id)} style={{ width: 'auto', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rule.active ? 'Active' : 'Inactive'}</span>
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <div className="card-header">
                <h3 className="card-title">Third-Party Integrations</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Slack Notifications</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Send real-time updates and comments to Slack channels.</p>
                  </div>
                  <Button variant={integrations.slack ? 'primary' : 'outline'} onClick={() => toggleIntegration('slack')}>
                    {integrations.slack ? 'Connected' : 'Disconnect'}
                  </Button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>GitHub Integration</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Link pull requests and commits to tasks using ID references.</p>
                  </div>
                  <Button variant={integrations.github ? 'primary' : 'outline'} onClick={() => toggleIntegration('github')}>
                    {integrations.github ? 'Connected' : 'Disconnect'}
                  </Button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Google Drive Storage</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Attach files directly from Google Drive to tasks.</p>
                  </div>
                  <Button variant={integrations.drive ? 'primary' : 'outline'} onClick={() => toggleIntegration('drive')}>
                    {integrations.drive ? 'Connected' : 'Disconnect'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
