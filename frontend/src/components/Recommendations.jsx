import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Activity, AlertCircle, RefreshCw, Shield, Target, Wallet, Clock, Award, ChevronRight, BarChart3, PiggyBank, Sparkles, Home, Coffee, TrendingDown, DollarSign } from 'lucide-react';

const Recommendations = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [budgetIncome, setBudgetIncome] = useState('');
  const [budget, setBudget] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get('http://localhost:8000/goals/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data);
      if (res.data.length > 0) setSelectedGoal(res.data[0].goal_name);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePredict = async () => {
    if (!selectedGoal) {
      setError("Please select a goal or create one in the Goals tab.");
      return;
    }
    setLoading(true);
    setError('');
    setRecommendation(null);
    try {
      const res = await axios.post('http://localhost:8000/recommendations/', { goal: selectedGoal }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecommendation(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBudget = async () => {
    if (!budgetIncome || isNaN(budgetIncome)) return;
    setLoadingBudget(true);
    try {
      const res = await axios.post('http://localhost:8000/ai/generate-budget', { income: parseFloat(budgetIncome) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBudget(res.data.budget);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const rankColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const rankBg = ['#8b5cf620', '#3b82f620', '#10b98120', '#f59e0b20', '#ef444420'];

  return (
    <div className="grid-cols-12">
      {/* Left Column: Input */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <h3 className="font-bold mb-4 text-2xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} style={{ color: '#8b5cf6' }} /> AI Insights
          </h3>
          <p className="text-muted mb-6" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            Our ML model analyzes your <strong>age, income, expenses, savings, risk tolerance, and goals</strong> using the investment dataset to suggest the best investment path personalized for you.
          </p>
          
          <div className="mb-6">
             <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Select Target Goal</label>
             <select 
               className="input-light" 
               value={selectedGoal} 
               onChange={e => setSelectedGoal(e.target.value)}
             >
               <option value="">-- Choose Goal --</option>
               {goals.map(g => (
                 <option key={g.id} value={g.goal_name}>{g.goal_name}</option>
               ))}
             </select>
          </div>
          
          <button className="pill-btn" style={{ width: '100%' }} onClick={handlePredict} disabled={loading}>
            {loading ? <><RefreshCw size={18} className="animate-spin" /> Analyzing...</> : <><TrendingUp size={18} /> Generate Recommendation</>}
          </button>

          {error && (
            <div style={{ color: 'var(--color-danger)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>

        {/* Factors Considered Card */}
        {recommendation && recommendation.factors_considered && (
          <div className="card animate-fade-in" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', border: 'none' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>Factors Analyzed</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <Clock size={15}/>, label: 'Age', value: `${recommendation.factors_considered.age} years` },
                { icon: <Wallet size={15}/>, label: 'Monthly Income', value: `₹${recommendation.factors_considered.monthly_income?.toLocaleString()}` },
                { icon: <Shield size={15}/>, label: 'Risk Tolerance', value: recommendation.factors_considered.risk_tolerance },
                { icon: <Target size={15}/>, label: 'Goal', value: recommendation.factors_considered.goal },
                { icon: <TrendingUp size={15}/>, label: 'Total Income', value: `₹${recommendation.factors_considered.total_income?.toLocaleString()}` },
                { icon: <BarChart3 size={15}/>, label: 'Total Expenses', value: `₹${recommendation.factors_considered.total_expense?.toLocaleString()}` },
                { icon: <PiggyBank size={15}/>, label: 'Total Savings', value: `₹${recommendation.factors_considered.total_savings?.toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.82rem' }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        

      </div>

      {/* Right Column: Output */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {recommendation ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Analysis Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', border: 'none', padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Financial Analysis</h4>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.7', opacity: 0.95 }}>{recommendation.analysis}</p>
                </div>
              </div>
            </div>

            {/* Risk Profile Badge */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: recommendation.risk_profile === 'High' ? '#ef444420' : recommendation.risk_profile === 'Medium' ? '#f59e0b20' : '#10b98120', color: recommendation.risk_profile === 'High' ? '#ef4444' : recommendation.risk_profile === 'Medium' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={22} />
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Risk Profile</div>
                  <div className="font-bold" style={{ fontSize: '1.2rem' }}>{recommendation.risk_profile}</div>
                </div>
              </div>

              {/* Live Market Data */}
              {recommendation.market_data && (
                <>
                  <div className="card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#3b82f620', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Market Index</div>
                      <div className="font-bold" style={{ fontSize: '1.1rem' }}>{recommendation.market_data.ticker}</div>
                    </div>
                  </div>
                  <div className="card" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: recommendation.market_data.change_pct >= 0 ? '#10b98120' : '#ef444420', color: recommendation.market_data.change_pct >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Current Price</div>
                      <div className="font-bold" style={{ fontSize: '1.1rem' }}>
                        ₹{recommendation.market_data.current_price}
                        <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: recommendation.market_data.change_pct >= 0 ? '#10b981' : '#ef4444' }}>
                          {recommendation.market_data.change_pct >= 0 ? '+' : ''}{recommendation.market_data.change_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Recommended Instruments List */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 className="font-bold mb-6" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} style={{ color: '#8b5cf6' }} /> Recommended Investment Assets
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recommendation.instruments && recommendation.instruments.map((inst, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    background: '#f8fafc',
                    border: '1px solid var(--light-border)',
                    borderRadius: '16px',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = rankColors[i % rankColors.length]; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--light-border)'; }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: rankBg[i % rankBg.length],
                      color: rankColors[i % rankColors.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1rem', flexShrink: 0
                    }}>
                      #{inst.rank}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--light-text-main)' }}>{inst.name}</h4>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          background: rankBg[i % rankBg.length],
                          color: rankColors[i % rankColors.length],
                          padding: '3px 10px', borderRadius: '20px',
                          textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>{inst.best_for}</span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--light-text-muted)', marginBottom: '10px', lineHeight: '1.5' }}>
                        {inst.description}
                      </p>

                      <div style={{
                        background: `${rankColors[i % rankColors.length]}10`,
                        border: `1px solid ${rankColors[i % rankColors.length]}30`,
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.82rem',
                        color: 'var(--light-text-main)',
                        lineHeight: '1.5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <ChevronRight size={16} style={{ color: rankColors[i % rankColors.length], flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Why this for you:</strong> {inst.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market data error removed per user request */}
          </div>
        ) : (
          <div className="card" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-text-muted)', border: '2px dashed var(--light-border)', borderRadius: '24px' }}>
            <div style={{ textAlign: 'center' }}>
               <TrendingUp size={56} style={{ opacity: 0.15, margin: '0 auto 20px' }} />
               <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>Select a goal and click <strong>"Generate Recommendation"</strong><br/>to see AI-powered investment insights with<br/>detailed descriptions and live market data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
