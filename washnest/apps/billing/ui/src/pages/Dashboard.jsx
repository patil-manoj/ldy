import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock3, PackageCheck, Plus, Receipt, TrendingUp, WalletCards } from 'lucide-react';
import { getDashboard, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  useEffect(() => {
    Promise.all([getDashboard(), getOrders({ limit: 200 })])
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
  const workflow = [
    { key: 'received', label: 'New', value: recentOrders.filter((order) => order.status === 'received').length, icon: Receipt },
    { key: 'processing', label: 'Processing', value: recentOrders.filter((order) => order.status === 'processing' || order.status === 'picked_up').length, icon: TrendingUp },
    { key: 'ready', label: 'Ready', value: recentOrders.filter((order) => order.status === 'ready').length, icon: PackageCheck },
    { key: 'out_for_delivery', label: 'Out for delivery', value: recentOrders.filter((order) => order.status === 'out_for_delivery').length, icon: ArrowRight },
  ];
  const overdue = recentOrders.filter((order) => order.status !== 'cancelled' && order.amount_due > 0);
  const recent = recentOrders.slice(0, 6);

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
              {recent.map((order) => (
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

      <div className="dashboard-lower-grid">
        <section className="card">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><PackageCheck size={18} aria-hidden="true" /></span>
            <div><h2>Work in progress</h2><p>Know what needs attention on the floor.</p></div>
          </div>
          <div className="workflow-grid">
            {workflow.map(({ key, label, value, icon: Icon }) => (
              <Link to={`/orders?status=${key}`} className="workflow-card" key={key}>
                <span className="workflow-card__icon"><Icon size={17} aria-hidden="true" /></span>
                <strong>{value}</strong><span>{label}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="card dashboard-alerts">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><AlertCircle size={18} aria-hidden="true" /></span>
            <div><h2>Needs attention</h2><p>Follow up before the day ends.</p></div>
          </div>
          <Link to="/orders?payment_status=unpaid" className="alert-row">
            <WalletCards size={16} aria-hidden="true" /><span><strong>{overdue.length}</strong> orders with an outstanding balance</span><ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link to="/reports" className="alert-row">
            <TrendingUp size={16} aria-hidden="true" /><span>Review this period's revenue and profit trends</span><ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
