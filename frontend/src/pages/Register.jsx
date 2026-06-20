import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Contributor' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      addToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-in-up">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#logoGradReg)" />
              <path d="M7 10h4v4H7zM13 10h4v8h-4zM7 16h4v2H7z" fill="white" />
              <defs>
                <linearGradient id="logoGradReg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#a91f23" />
                  <stop offset="1" stopColor="#c9503d" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ letterSpacing: '-0.03em', fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.8 }}>Join the ProjectHub Team Portal</p>
        </div>

        <form className="login-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input 
              id="reg-name" 
              name="name" 
              type="text" 
              placeholder="John Doe" 
              value={form.name} 
              onChange={handleChange} 
              required 
              style={{ padding: '10px 14px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input 
              id="reg-email" 
              name="email" 
              type="email" 
              placeholder="name@company.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
              style={{ padding: '10px 14px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input 
              id="reg-password" 
              name="password" 
              type="password" 
              placeholder="Min 6 characters" 
              value={form.password} 
              onChange={handleChange} 
              required 
              minLength={6} 
              style={{ padding: '10px 14px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="reg-role">System Role</label>
            <select 
              id="reg-role" 
              name="role" 
              value={form.role} 
              onChange={handleChange}
              style={{ padding: '10px 14px' }}
            >
              <option value="PM">Project Manager</option>
              <option value="TeamLead">Team Lead</option>
              <option value="Contributor">Contributor</option>
              <option value="QA">QA / Tester</option>
            </select>
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading} 
            className="btn-lg" 
            style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}
          >
            Create Account
          </Button>
        </form>
        <div className="login-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
          Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
