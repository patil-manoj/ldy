import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getDashboard } from '../api';
import { formatMoney } from '../lib/billing';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { getDashboard().then(setData).catch(console.error); }, []);

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
    </>
  );
}
