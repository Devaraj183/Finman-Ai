import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Target, TrendingUp, MessageSquare, LogOut, Hexagon } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Goals from './components/Goals';
import Recommendations from './components/Recommendations';
import AIAdvisor from './components/AIAdvisor';
import Logo from './components/Logo';
import axios from 'axios';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const Layout = ({ children, setIsAuthenticated }) => {
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Fetch user details for the header
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8000/users/details', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.full_name) setUserName(res.data.full_name.split(' ')[0]);
        if (res.data.photo) setUserPhoto(res.data.photo);
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, []);

  // Add light theme class to body
  useEffect(() => {
    document.body.className = 'dashboard-body';
    return () => { document.body.className = ''; }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="nav-brand" style={{ gap: '10px' }}>
          <Logo size={36} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Aura Wealth</span>
        </div>
        
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/tracker" className={`nav-item ${location.pathname === '/tracker' ? 'active' : ''}`}>
          <Wallet size={20} /> Transactions
        </Link>
        <Link to="/goals" className={`nav-item ${location.pathname === '/goals' ? 'active' : ''}`}>
          <Target size={20} /> Saving Goals
        </Link>
        <Link to="/recommendations" className={`nav-item ${location.pathname === '/recommendations' ? 'active' : ''}`}>
          <TrendingUp size={20} /> AI Insights
        </Link>
        <Link to="/ai-advisor" className={`nav-item ${location.pathname === '/ai-advisor' ? 'active' : ''}`} style={{ position: 'relative' }}>
          <MessageSquare size={20} /> AI Advisor
          <span style={{
            position: 'absolute', top: 8, right: 12,
            width: 7, height: 7, borderRadius: '50%',
            background: '#16a34a', boxShadow: '0 0 0 2px white'
          }} />
        </Link>

        <div style={{ marginTop: 'auto' }}>
          <button className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="content-area animate-fade-in">
        <div className="header">
          <div>
            <h1 className="text-2xl font-bold">{getGreeting()}, {userName || 'User'}</h1>
            <p className="text-muted">This is your finance report</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden' }}>
              <img src={userPhoto || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Auth setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <Layout setIsAuthenticated={setIsAuthenticated}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/ai-advisor" element={<AIAdvisor />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
};

export default App;
