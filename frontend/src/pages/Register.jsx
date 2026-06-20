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
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚀</div>
          <h1>Join ProjectHub</h1>
          <p>Create your account to get started</p>
        </div>
        <form className="login-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input id="reg-name" name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select id="reg-role" name="role" value={form.role} onChange={handleChange}>
              <option value="PM">Project Manager</option>
              <option value="TeamLead">Team Lead</option>
              <option value="Contributor">Contributor</option>
              <option value="QA">QA / Tester</option>
            </select>
          </div>
          <Button type="submit" variant="primary" loading={loading} className="btn-lg" style={{ width: '100%' }}>
            Create Account
          </Button>
        </form>
        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
