import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';

const Tracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '' });

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, []);

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

  const fetchGoals = async () => {
    try {
      const res = await axios.get('http://localhost:8000/goals/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/transactions/', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setForm({ type: form.type, amount: '', category: '', description: '' });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const typeColors = { income: '#10b981', expense: '#ef4444', savings: '#8b5cf6' };
  const typeIcons = {
    income: <ArrowUpRight size={16} />,
    expense: <ArrowDownRight size={16} />,
    savings: <PiggyBank size={16} />,
  };

  return (
    <div className="grid-cols-12">
      {/* Left Column: Add Transaction Form */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <h3 className="font-bold mb-6 text-2xl">New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Transaction Type</label>
               <select
                 className="input-light"
                 value={form.type}
                 onChange={e => setForm({...form, type: e.target.value, category: ''})}
               >
                 <option value="income">Income (+)</option>
                 <option value="expense">Expense (-)</option>
                 <option value="savings">Savings 🐷</option>
               </select>
            </div>

            <div className="mb-4">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Amount</label>
               <input
                 type="number"
                 placeholder="e.g. 150.00"
                 className="input-light"
                 value={form.amount}
                 onChange={e => setForm({...form, amount: e.target.value})}
                 required
               />
            </div>

            <div className="mb-4">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>
                 {form.type === 'savings' ? 'Saving Goal (Link to Goal)' : 'Category'}
               </label>
               {form.type === 'savings' ? (
                 <select
                   className="input-light"
                   value={form.category}
                   onChange={e => setForm({...form, category: e.target.value})}
                   required
                 >
                   <option value="">-- Select a Goal --</option>
                   {goals.map(g => (
                     <option key={g.id} value={g.goal_name}>{g.goal_name} (₹{g.target_amount.toLocaleString()})</option>
                   ))}
                 </select>
               ) : (
                 <input
                   type="text"
                   placeholder="e.g., Grocery, Salary"
                   className="input-light"
                   value={form.category}
                   onChange={e => setForm({...form, category: e.target.value})}
                   required
                 />
               )}
            </div>

            <div className="mb-6">
               <label className="text-muted font-bold text-sm mb-2" style={{ display: 'block' }}>Description (Optional)</label>
               <input
                 type="text"
                 placeholder="Notes..."
                 className="input-light"
                 value={form.description}
                 onChange={e => setForm({...form, description: e.target.value})}
               />
            </div>

            <button type="submit" className="pill-btn" style={{ width: '100%' }}>
              <Plus size={18} /> Add Transaction
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Transaction History */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-2xl">Transaction History</h3>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <div className="font-bold" style={{ color: 'var(--light-text-main)' }}>{t.category}</div>
                  </td>
                  <td className="text-muted">{t.description || '-'}</td>
                  <td>
                    <span style={{
                      background: `${typeColors[t.type] || '#888'}20`,
                      color: typeColors[t.type] || '#888',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}>{t.type}</span>
                  </td>
                  <td>
                    <div className={`flex items-center gap-2 font-bold`} style={{ color: typeColors[t.type] || '#888' }}>
                      {typeIcons[t.type]}
                      ₹{t.amount.toFixed(2)}
                    </div>
                  </td>
                  <td>
                    <button className="pill-btn pill-btn-danger" style={{ padding: '8px', borderRadius: '12px' }} onClick={() => handleDelete(t.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--light-text-muted)' }}>No transactions yet. Add your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
