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
      { id: 2, trigger: 'If bug severity is Critical', action: 'Notify PM via email', active: true },
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
              <Button variant={activeTab === 'profile' ? 'primary' : 'ghost'} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setActiveTab('profile')}>
                👤 Edit Profile
              </Button>
              <Button variant={activeTab === 'preferences' ? 'primary' : 'ghost'} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setActiveTab('preferences')}>
                🎨 Appearance
              </Button>
              <Button variant={activeTab === 'customfields' ? 'primary' : 'ghost'} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setActiveTab('customfields')}>
                ⚙️ Custom Fields
              </Button>
              <Button variant={activeTab === 'automations' ? 'primary' : 'ghost'} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setActiveTab('automations')}>
                🤖 Automations
              </Button>
              <Button variant={activeTab === 'integrations' ? 'primary' : 'ghost'} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setActiveTab('integrations')}>
                🔌 Integrations
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
                      <option value="Bug">Bug</option>
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
                      <option value="If bug severity is Critical">If bug severity is "Critical"</option>
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
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>⚡ Trigger: {rule.trigger}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>➡️ Action: {rule.action}</div>
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
