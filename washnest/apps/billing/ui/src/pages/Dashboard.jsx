import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Plus, Receipt, TrendingUp } from 'lucide-react';
import { getDashboard, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  useEffect(() => {
    Promise.all([getDashboard(), getOrders({ limit: 8 })])
      .then(([dashboard, orders]) => { setData(dashboard); setRecentOrders(orders); })
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading…</p>;

  const stats = [
    { label: "Today's Orders", value: data.total_orders_today, cls: 'stat-card--primary' },
    { label: "Today's Revenue", value: formatMoney(data.revenue_today), cls: 'stat-card--success' },
    { label: 'Collected Today', value: formatMoney(data.collected_today), cls: 'stat-card--success' },
    { label: 'Pending Pickups', value: data.pending_pickups, cls: 'stat-card--warning' },
    { label: 'Processing', value: data.in_progress, cls: 'stat-card--purple' },
    { label: 'Ready for Delivery', value: data.pending_deliveries, cls: 'stat-card--success' },
    { label: 'Express Orders', value: data.express_orders, cls: 'stat-card--warning' },
    { label: 'Total Customers', value: data.total_customers, cls: '' },
    { label: 'Outstanding', value: formatMoney(data.outstanding_total), cls: data.outstanding_total > 0 ? 'stat-card--danger' : '' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/orders/new" className="btn btn--primary btn--lg"><Plus size={18} aria-hidden="true" /> New bill</Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.cls}`}>
            <div className="stat-card__label">{stat.label}</div>
            <div className="stat-card__value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card dashboard-card dashboard-card--accent">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><TrendingUp size={18} aria-hidden="true" /></span>
            <div><h2>Today at a glance</h2><p>Keep the floor moving with the most important numbers.</p></div>
          </div>
          <div className="dashboard-summary">
            <div><span>Average bill</span><strong>{formatMoney(data.total_orders_today ? data.revenue_today / data.total_orders_today : 0)}</strong></div>
            <div><span>Collection rate</span><strong>{data.revenue_today ? `${Math.round((data.collected_today / data.revenue_today) * 100)}%` : '0%'}</strong></div>
          </div>
          <Link className="dashboard-card__link" to="/reports">Open detailed reports <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>

        <section className="card dashboard-card">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><Clock3 size={18} aria-hidden="true" /></span>
            <div><h2>Recent orders</h2><p>Latest bills and internal tokens.</p></div>
          </div>
          {recentOrders.length === 0 ? <p className="empty">No orders yet</p> : (
            <div className="dashboard-orders">
              {recentOrders.slice(0, 5).map((order) => (
                <Link to={`/orders/${order.id}`} className="dashboard-order" key={order.id}>
                  <span className="dashboard-order__icon"><Receipt size={15} aria-hidden="true" /></span>
                  <span><strong>{order.order_number}</strong><small>{order.customer?.name || 'Walk-in'}{order.token_number ? ` · Token ${order.token_number}` : ''}</small></span>
                  <span className="dashboard-order__amount">{formatMoney(order.total_amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
