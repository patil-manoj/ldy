import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getExpenses, createExpense, deleteExpense } from '../api';

const CATEGORIES = ['detergent', 'rent', 'salary', 'electricity', 'water', 'packaging', 'transport', 'maintenance', 'equipment', 'other'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', category: '' });
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'detergent', description: '', amount: '', payment_mode: 'cash', reference: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getExpenses(filters).then(setExpenses).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters.category]);

  const handleFilter = (e) => { e.preventDefault(); load(); };

  const handleAdd = async () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    try {
      await createExpense({ ...form, amount: Number(form.amount) });
      toast.success('Expense added');
      setShowModal(false);
      setForm({ date: new Date().toISOString().split('T')[0], category: 'detergent', description: '', amount: '', payment_mode: 'cash', reference: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <div className="page-header">
        <h1>Expenses</h1>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>

      <form onSubmit={handleFilter} className="filters">
        <div className="form-group"><label>From</label><input type="date" className="form-input" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} /></div>
        <div className="form-group"><label>To</label><input type="date" className="form-input" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} /></div>
        <div className="form-group">
          <label>Category</label>
          <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ alignSelf: 'flex-end' }}><button className="btn btn--primary" type="submit">Filter</button></div>
      </form>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-card__label">Total Expenses</div><div className="stat-card__value" style={{ color: '#dc2626' }}>₹{total.toLocaleString('en-IN')}</div></div>
        <div className="stat-card"><div className="stat-card__label">Entries</div><div className="stat-card__value">{expenses.length}</div></div>
      </div>

      <div className="card">
        {loading ? <p>Loading…</p> : expenses.length === 0 ? (
          <p className="empty">No expenses found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Mode</th><th>Actions</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td><span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{e.category}</span></td>
                    <td>{e.description || '—'}</td>
                    <td style={{ fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</td>
                    <td>{e.payment_mode}</td>
                    <td><button className="btn btn--danger btn--sm" onClick={() => handleDelete(e.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Expense</h2>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Amount (₹)</label><input className="form-input" type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} autoFocus /></div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select className="form-select" value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}>
                  <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Reference</label><input className="form-input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleAdd}>Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
