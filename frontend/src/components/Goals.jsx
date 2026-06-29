import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2, Home, Car, GraduationCap, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ goal_name: '', target_amount: '', current_amount: 0 });
  const [suggestions, setSuggestions] = useState({});

  useEffect(() => {
    fetchGoals();
    fetchTransactions();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get('http://localhost:8000/goals/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data);
      fetchSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestions = async (goalsData) => {
    const token = localStorage.getItem('token');
    for (let goal of goalsData) {
      try {
        const res = await axios.get(`http://localhost:8000/ai/goal-suggestions/${goal.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(prev => ({ ...prev, [goal.id]: res.data.suggestion }));
      } catch (err) {
        console.error("Failed to fetch suggestion for goal", goal.id);
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:8000/transactions/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/goals/', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setForm({ goal_name: '', target_amount: '', current_amount: 0 });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/goals/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total saved from savings transactions linked to a goal
  const getSavedAmount = (goalName) => {
    return transactions
      .filter(t => t.type === 'savings' && t.category === goalName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Estimate months to completion based on avg monthly savings
  const getEstimatedMonths = (goalName, remaining) => {
    const savings = transactions.filter(t => t.type === 'savings' && t.category === goalName);
    if (savings.length === 0) return null;

    const totalSaved = savings.reduce((s, t) => s + t.amount, 0);
    const earliest = new Date(Math.min(...savings.map(t => new Date(t.date))));
    const monthsElapsed = Math.max(
      (new Date() - earliest) / (1000 * 60 * 60 * 24 * 30),
      1
    );
    const avgPerMonth = totalSaved / monthsElapsed;
    if (avgPerMonth <= 0) return null;
    return Math.ceil(remaining / avgPerMonth);
  };

  const getIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('house') || lower.includes('home')) return { icon: <Home size={20}/>, color: '#8b5cf6' };
    if (lower.includes('car') || lower.includes('vehicle')) return { icon: <Car size={20}/>, color: '#3b82f6' };
    if (lower.includes('edu') || lower.includes('school')) return { icon: <GraduationCap size={20}/>, color: '#f59e0b' };
    return { icon: <Briefcase size={20}/>, color: '#10b981' };
  };

  return (
    <div className="grid-cols-12">
      {/* Left Column: Create Goal */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <h3 className="font-bold mb-6 text-2xl">Set New Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Goal Name</label>
               <input
                 type="text"
                 placeholder="e.g. Dream Car, House Saving"
                 className="input-light"
                 value={form.goal_name}
                 onChange={e => setForm({...form, goal_name: e.target.value})}
                 required
               />
            </div>

            <div className="mb-4">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Target Amount (₹)</label>
               <input
                 type="number"
                 placeholder="e.g. 25000"
                 className="input-light"
                 value={form.target_amount}
                 onChange={e => setForm({...form, target_amount: e.target.value})}
                 required
               />
            </div>

            <div className="mb-6">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Initial Saving (₹)</label>
               <input
                 type="number"
                 placeholder="e.g. 1500"
                 className="input-light"
                 value={form.current_amount}
                 onChange={e => setForm({...form, current_amount: e.target.value})}
               />
            </div>

            <button type="submit" className="pill-btn" style={{ width: '100%' }}>
              <Plus size={18} /> Create Goal
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', border: 'none' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '16px', opacity: 0.9, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Total Saved Across Goals</h4>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            ₹{transactions.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0).toLocaleString()}
          </div>
          <div style={{ opacity: 0.7, marginTop: '8px', fontSize: '0.85rem' }}>
            {transactions.filter(t => t.type === 'savings').length} savings transaction(s)
          </div>
        </div>
      </div>

      {/* Right Column: Goal Cards */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
         <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-2xl">Your Active Goals</h3>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {goals.map(g => {
              const savedFromTransactions = getSavedAmount(g.goal_name);
              const totalSaved = (g.current_amount || 0) + savedFromTransactions;
              const progressPct = Math.min((totalSaved / g.target_amount) * 100, 100);
              const remaining = Math.max(g.target_amount - totalSaved, 0);
              const estMonths = getEstimatedMonths(g.goal_name, remaining);
              const ui = getIcon(g.goal_name);
              const chartData = [{ value: progressPct, fill: ui.color }];

              return (
                <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
                  
                  {/* Top: icon + delete */}
                  <div className="flex justify-between items-center">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${ui.color}20`, color: ui.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ui.icon}
                    </div>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }} onClick={() => handleDelete(g.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Goal name */}
                  <h4 className="font-bold" style={{ fontSize: '1.1rem' }}>{g.goal_name}</h4>

                  {/* Circular Chart */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%" cy="50%"
                          innerRadius="65%"
                          outerRadius="100%"
                          barSize={10}
                          data={chartData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          {/* Background ring */}
                          <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={10} />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1rem', fontWeight: 800, fill: ui.color }}>
                            {progressPct.toFixed(0)}%
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--light-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Saved</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#10b981' }}>₹{totalSaved.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--light-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Remaining</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ef4444' }}>₹{remaining.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--light-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{g.target_amount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Linear progress bar */}
                  <div>
                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progressPct}%`, background: ui.color, borderRadius: '4px', transition: 'width 0.6s ease-out' }}></div>
                    </div>
                  </div>

                  {/* Estimated time */}
                  {remaining > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', background: '#f8fafc', border: `1px solid ${ui.color}40`, borderRadius: '8px', padding: '12px 14px', marginTop: '4px' }}>
                      <Clock size={18} color={ui.color} />
                      {estMonths !== null
                        ? <span><span style={{ color: ui.color, fontSize: '1.1rem' }}>{estMonths}</span> month{estMonths === 1 ? '' : 's'} to go</span>
                        : <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Add savings to see time estimate</span>}
                    </div>
                  )}

                  {progressPct >= 100 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#10b981', fontWeight: 700, background: '#10b98115', borderRadius: '8px', padding: '6px 10px' }}>
                      🎉 Goal Achieved!
                    </div>
                  )}

                </div>
              );
            })}

            {goals.length === 0 && (
               <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--light-text-muted)' }}>
                 No goals set yet. Use the form to start tracking your dreams.
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Goals;
