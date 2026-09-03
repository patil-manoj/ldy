import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Zap } from 'lucide-react';
import { getOrders } from '../api';

const STATUSES = ['', 'received', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['', 'unpaid', 'partial', 'paid'];
const SOURCES = ['', 'walkin', 'whatsapp', 'phone'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', payment_status: '', source: '', search: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getOrders(filters).then(setOrders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters.status, filters.payment_status, filters.source]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <>
      <div className="page-header">
        <h1>Orders</h1>
        <Link to="/orders/new" className="btn btn--primary"><Plus size={17} aria-hidden="true" /> New bill</Link>
      </div>

      <div className="filters">
        <div className="form-group">
          <label>Status</label>
          <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Payment</label>
          <select className="form-select" value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value }))}>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Source</label>
          <select className="form-select" value={filters.source} onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}>
            {SOURCES.map(s => <option key={s} value={s}>{s || 'All Sources'}</option>)}
          </select>
        </div>
        <form onSubmit={handleSearch} className="form-group" style={{ flex: 1, minWidth: 200 }}>
          <label>Search</label>
          <input
            className="form-input"
            placeholder="Order #, name, or phone..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </form>
      </div>

      <div className="card">
        {loading ? <p>Loading…</p> : orders.length === 0 ? (
          <p className="empty">No orders found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}><strong>{o.order_number}</strong></Link>
                      {o.is_express && <span className="badge badge--express" style={{ marginLeft: 6 }} aria-label="Express order"><Zap size={12} aria-hidden="true" /></span>}
                    </td>
                    <td>
                      <div>{o.customer?.name || '—'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{o.customer?.phone}</small>
                    </td>
                    <td><span className={`badge badge--${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                    <td>{o.items?.length || 0}</td>
                    <td>₹{o.total_amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge--${o.payment_status}`}>{o.payment_status}</span>
                      {o.payment_status === 'partial' && <small style={{ display: 'block', color: 'var(--text-muted)' }}>Due: ₹{o.amount_due}</small>}
                    </td>
                    <td>{o.source}</td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
