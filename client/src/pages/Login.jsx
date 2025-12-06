import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './styles/Login.css';

const Login = () => {
  const { login, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('user');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setFormData({ username: 'admin', password: 'admin123' });
    } else {
      setFormData({ username: 'user', password: 'user123' });
    }
    setLoginType(type);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo Section */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <BookOpen size={40} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access the Library Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Demo Credentials Buttons */}
          <div className="demo-section">
            <p className="demo-label">Quick Login:</p>
            <div className="demo-buttons">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className={`demo-btn ${loginType === 'admin' ? 'demo-btn--active' : ''}`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('user')}
                className={`demo-btn ${loginType === 'user' ? 'demo-btn--active' : ''}`}
              >
                User Login
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">
              <span>or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  await googleLogin(credentialResponse.credential);
                  navigate('/dashboard');
                } catch (err) {
                  setError(err.message || 'Google login failed');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setError('Google login failed. Please try again.');
              }}
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>

          <p className="signup-link">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;