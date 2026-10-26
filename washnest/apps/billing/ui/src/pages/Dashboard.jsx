import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, PackageCheck, Plus, Receipt, Sparkles, TrendingUp, WalletCards } from 'lucide-react';
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

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
  const stats = [
    { label: "Today's revenue", value: formatMoney(data.revenue_today), meta: `${data.total_orders_today} orders today`, icon: TrendingUp, tone: 'blue' },
    { label: 'Collected today', value: formatMoney(data.collected_today), meta: data.revenue_today ? `${Math.round((data.collected_today / data.revenue_today) * 100)}% collection rate` : 'No collections yet', icon: CheckCircle2, tone: 'green' },
    { label: 'Outstanding', value: formatMoney(data.outstanding_total), meta: 'Across active orders', icon: WalletCards, tone: data.outstanding_total ? 'amber' : 'green' },
    { label: 'Active customers', value: data.total_customers, meta: `${data.express_orders} express orders`, icon: Sparkles, tone: 'purple' },
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
      <div className="page-header dashboard-header">
        <div>
          <p className="eyebrow"><span className="eyebrow__dot" /> {today}</p>
          <h1>Good morning, Wash Nest <span aria-hidden="true">✦</span></h1>
          <p className="page-subtitle">Here’s the pulse of your laundry business today.</p>
        </div>
        <div className="inline-actions">
          <Link to="/reports" className="btn btn--ghost">View reports <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link to="/orders/new" className="btn btn--primary btn--lg"><Plus size={18} aria-hidden="true" /> New bill</Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card stat-card--${stat.tone}`}>
            <div className="stat-card__top"><span className="stat-card__icon"><stat.icon size={17} aria-hidden="true" /></span><span className="stat-card__label">{stat.label}</span></div>
            <div className="stat-card__value">{stat.value}</div>
            <div className="stat-card__meta">{stat.meta}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card dashboard-card dashboard-card--accent dashboard-pulse">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><TrendingUp size={18} aria-hidden="true" /></span>
            <div><h2>Today at a glance</h2><p>A quick read on today’s performance.</p></div>
          </div>
          <div className="pulse-value">{formatMoney(data.revenue_today)} <span>revenue</span></div>
          <div className="pulse-bars" aria-hidden="true">{[42, 58, 45, 70, 56, 76, 64, 88, 72, 94, 82, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
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
            <Link to="/orders" className="section-heading__action">View all <ArrowRight size={14} /></Link>
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
