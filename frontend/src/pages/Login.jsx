import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
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
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#logoGrad)" />
              <path d="M7 10h4v4H7zM13 10h4v8h-4zM7 16h4v2H7z" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#a91f23" />
                  <stop offset="1" stopColor="#c9503d" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ letterSpacing: '-0.03em', fontSize: '1.8rem', fontWeight: 800 }}>ProjectHub</h1>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.8 }}>Enterprise Project Tracker Portal</p>
        </div>
        
        <form className="login-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input 
              id="login-email" 
              type="email" 
              placeholder="name@company.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ padding: '12px 16px' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ margin: 0 }}>Password</label>
            </div>
            <input 
              id="login-password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ padding: '12px 16px' }}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading} 
            className="btn-lg" 
            style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}
          >
            Sign In to Dashboard
          </Button>
        </form>
        
        <div className="login-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
          New to the portal? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
