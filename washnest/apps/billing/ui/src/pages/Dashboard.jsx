import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { getDashboard().then(setData).catch(console.error); }, []);

  if (!data) return <p>Loading…</p>;

  const stats = [
    { label: "Today's Orders", value: data.today_orders, cls: 'stat-card--primary' },
    { label: "Today's Revenue", value: `₹${(data.today_revenue || 0).toLocaleString('en-IN')}`, cls: 'stat-card--success' },
    { label: 'Pending Pickup', value: data.pending_pickup, cls: 'stat-card--warning' },
    { label: 'Processing', value: data.processing, cls: 'stat-card--purple' },
    { label: 'Ready', value: data.ready_for_delivery, cls: 'stat-card--success' },
    { label: 'Unpaid Orders', value: data.unpaid_orders, cls: 'stat-card--danger' },
    { label: 'Total Customers', value: data.total_customers, cls: '' },
    { label: 'Outstanding Amt', value: `₹${(data.outstanding_amount || 0).toLocaleString('en-IN')}`, cls: data.outstanding_amount > 0 ? 'stat-card--danger' : '' },
    { label: "Today's Expenses", value: `₹${(data.today_expenses || 0).toLocaleString('en-IN')}`, cls: 'stat-card--warning' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/orders/new" className="btn btn--primary btn--lg">+ New Order</Link>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      {data.recent_orders && data.recent_orders.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Recent Orders</h3>
            <Link to="/orders" className="btn btn--ghost btn--sm">View All →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Amount</th><th>Payment</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.recent_orders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}><strong>{o.order_number}</strong></Link>
                      {o.is_express && <span className="badge badge--express" style={{ marginLeft: 6 }}>⚡</span>}
                    </td>
                    <td>
                      <div>{o.customer?.name || '—'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{o.customer?.phone}</small>
                    </td>
                    <td><span className={`badge badge--${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{o.total_amount.toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge--${o.payment_status}`}>{o.payment_status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
