import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from './Logo';

const Auth = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Apply orange theme class to body for Auth layout
  useEffect(() => {
    document.body.className = 'auth-orange-body';
    return () => { document.body.className = ''; }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (isForgotPassword) {
      try {
        await axios.post('http://localhost:8000/auth/forgot-password', { email });
        setMessage('If an account exists, a reset link has been sent to your email.');
      } catch (err) {
        setError('Failed to process request.');
      }
      return;
    }

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const res = await axios.post('http://localhost:8000/auth/login', formData);
        localStorage.setItem('token', res.data.access_token);
        setIsAuthenticated(true);
      } else {
        await axios.post('http://localhost:8000/auth/register', { email, password });
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const res = await axios.post('http://localhost:8000/auth/login', formData);
        localStorage.setItem('token', res.data.access_token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', width: '100%' }}>
      
      {/* Brand Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
         <Logo size={46} />
         <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#120e0d', letterSpacing: '-0.5px' }}>Aura Wealth</span>
      </div>

      <div className="auth-orange-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
            {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#888' }}>
            {isForgotPassword ? 'Enter your email to receive a reset link' : (isLogin ? 'Enter your details to sign in' : 'Enter your details to get started')}
          </p>
        </div>
        
        {error && <div style={{ color: '#ff5a36', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div style={{ color: '#10b981', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem' }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
             <label className="auth-orange-label">Email</label>
             <input 
               type="email" 
               placeholder="Your Email Address" 
               className="auth-orange-input"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
          </div>
          
          {!isForgotPassword && (
            <div style={{ marginBottom: '24px' }}>
               <label className="auth-orange-label">Password</label>
               <input 
                 type="password" 
                 placeholder="••••••••••••" 
                 className="auth-orange-input"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
            </div>
          )}
          
          <button type="submit" className="auth-orange-btn">
            {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '0.85rem' }}>
          {isLogin && !isForgotPassword && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', cursor: 'pointer' }}>
                 <input type="checkbox" style={{ accentColor: '#ff5a36' }} /> Remember me
              </label>
              <span 
                onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                style={{ color: '#ff5a36', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '8px', color: '#aaa' }}>
            {isForgotPassword ? (
              <span 
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(''); setMessage(''); }}
                style={{ color: '#ff5a36', cursor: 'pointer', fontWeight: 'bold' }}>
                Back to Login
              </span>
            ) : (
              <>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span 
                  onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
                  style={{ color: '#ff5a36', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isLogin ? "Sign Up" : "Login"}
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
