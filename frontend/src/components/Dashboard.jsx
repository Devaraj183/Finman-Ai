import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Calendar, ArrowUpRight, CreditCard, Shield, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, BarChart2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, CartesianGrid } from 'recharts';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() { 
    if (this.state.hasError) return <div style={{padding: '50px', color: 'red'}}><h1>Crash!</h1><pre>{this.state.error.toString()}</pre></div>; 
    return this.props.children; 
  }
}

const Dashboard = () => {
  const [details, setDetails] = useState({ full_name: '', age: '', risk_tolerance: '', monthly_income: 0, photo: '' });
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [spendingAnalysis, setSpendingAnalysis] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [detRes, txRes, goalRes, spendRes, riskRes] = await Promise.all([
        axios.get('http://localhost:8000/users/details', { headers }),
        axios.get('http://localhost:8000/transactions/', { headers }),
        axios.get('http://localhost:8000/goals/', { headers }),
        axios.get('http://localhost:8000/ai/spending-analysis', { headers }).catch(() => ({data:{analysis:''}})),
        axios.get('http://localhost:8000/ai/risk-analysis', { headers }).catch(() => ({data:null}))
      ]);
      setDetails(detRes.data || { full_name: '', age: '', risk_tolerance: '', monthly_income: 0, photo: '' });
      setTransactions(txRes.data);
      setGoals(goalRes.data);
      if(spendRes.data) setSpendingAnalysis(spendRes.data.analysis);
      if(riskRes.data) setRiskAnalysis(riskRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('http://localhost:8000/users/details', details, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowSettings(false);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Calculations for Charts ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  
  // Analytics Line Data
  const monthlyData = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  transactions.forEach(t => {
     const date = new Date(t.date);
     const monthName = months[date.getMonth()];
     if (!monthlyData[monthName]) monthlyData[monthName] = { name: monthName, income: 0, expenses: 0 };
     if (t.type === 'income') monthlyData[monthName].income += t.amount;
     else monthlyData[monthName].expenses += t.amount;
  });
  const currentMonthIndex = new Date().getMonth();
  const lineData = [];
  for(let i=0; i<=currentMonthIndex; i++) {
     const m = months[i];
     lineData.push(monthlyData[m] || { name: m, income: 0, expenses: 0 });
  }

  // Analytics Radial Pie Data
  const expensesByCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
     expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });
  const catColors = ['#22c55e', '#ef4444', '#f97316', '#0ea5e9', '#8b5cf6']; // Green, Red, Orange, Blue, Purple
  const expensePieData = Object.keys(expensesByCategory).map((cat, i) => {
     const val = expensesByCategory[cat];
     const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(0) : 0;
     return { name: cat, value: parseInt(pct) || 1, amount: val, fill: catColors[i % catColors.length] };
  }).sort((a,b) => b.value - a.value).slice(0, 4); // Only top 4 to match the 4 rings

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>Loading Dashboard...</div>;
  }

  return (
    <ErrorBoundary>
    <div style={{ background: '#ffffff', minHeight: 'calc(100vh - 120px)', boxSizing: 'border-box', color: '#111827' }}>
      


      <div className="grid-cols-12" style={{ gap: '24px' }}>
        
        {/* TOP ROW: 3 Cards */}
        <div style={{ gridColumn: 'span 5', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>My balance</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>${balance.toLocaleString()}</div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}><ArrowUpRight size={16}/> +6.7%</div>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 3', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <CreditCard size={20} />
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>Monthly income</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>${totalIncome.toLocaleString()}</div>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem', marginTop: '8px' }}>+9.8% compared to last month</div>
        </div>

        <div style={{ gridColumn: 'span 4', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <CreditCard size={20} />
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>Monthly expenses</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>${totalExpense.toLocaleString()}</div>
          <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginTop: '8px' }}>-8.6% compared to last month</div>
        </div>

        {/* MIDDLE LEFT: Statistics Line Chart */}
        <div style={{ gridColumn: 'span 8', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Statistics</h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e'}}></div> Total income</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width:8,height:8,borderRadius:'50%',background:'#f97316'}}></div> Total expenses</span>
              </div>
            </div>
            <button style={{ background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16}/> Monthly
            </button>
          </div>
          
          <div style={{ height: '250px', width: '100%', marginBottom: '24px' }}>
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb', paddingTop: '24px', gap: '48px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Average income</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${(totalIncome / (lineData.length || 1)).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Average expenses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${(totalExpense / (lineData.length || 1)).toLocaleString()}</div>
            </div>
          </div>


        </div>

        {/* MIDDLE RIGHT: Radial Chart & Green Banner */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px' }}>All expenses</h3>
            <div style={{ height: '200px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={8} data={expensePieData}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                  <Tooltip formatter={(value, name, props) => [`$${props.payload.amount.toLocaleString()}`, name]} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expensePieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }}></div>
                    {d.name}
                  </div>
                  <div style={{ fontWeight: 800 }}>{d.value}%</div>
                </div>
              ))}
              {expensePieData.length === 0 && <div style={{opacity: 0.5, fontSize: '0.85rem'}}>No expenses logged.</div>}
            </div>
          </div>


        </div>

      </div>

      {/* Settings / Edit Profile Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Profile Settings</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowSettings(false)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e5e7eb', position: 'relative' }}>
                <img src={details.photo || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={24} color="white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Full Name</label>
                <input type="text" value={details.full_name || ''} onChange={e => setDetails({...details, full_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Age</label>
                <input type="number" value={details.age || ''} onChange={e => setDetails({...details, age: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <button onClick={handleSaveProfile} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
