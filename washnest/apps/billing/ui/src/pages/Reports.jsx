import { useEffect, useMemo, useState } from 'react';
import { Banknote, BarChart3, CreditCard, Download, FileText, MessageCircle, Phone, Smartphone, Store } from 'lucide-react';
import { getDailyReport, getExpenses, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

const today = new Date().toISOString().split('T')[0];
const monthStart = new Date();
monthStart.setDate(1);
const firstOfMonth = monthStart.toISOString().split('T')[0];

export default function Reports() {
  const [range, setRange] = useState({ from: firstOfMonth, to: today });
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('washnest-report-presets') || '[]'));

  useEffect(() => {
    Promise.all([
      getDailyReport(range.to),
      getOrders({ date_from: range.from, date_to: range.to, limit: 200 }),
      getExpenses({ date_from: range.from, date_to: range.to, limit: 200 }),
    ]).then(([daily, filteredOrders, filteredExpenses]) => {
      setReport(daily);
      setOrders(filteredOrders);
      setExpenses(filteredExpenses);
    }).catch(console.error);
  }, [range.from, range.to]);

  const summary = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const collected = orders.reduce((sum, order) => sum + Number(order.amount_paid || 0), 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const payments = orders.flatMap((order) => order.payments || []);
    const statusCounts = orders.reduce((counts, order) => ({ ...counts, [order.status]: (counts[order.status] || 0) + 1 }), {});
    const sourceCounts = orders.reduce((counts, order) => ({ ...counts, [order.source]: (counts[order.source] || 0) + 1 }), {});
    const services = {};
    orders.forEach((order) => order.items?.forEach((item) => {
      services[item.item_name] = (services[item.item_name] || 0) + Number(item.subtotal || 0);
    }));
    return {
      revenue, collected, expenseTotal, net: collected - expenseTotal, statusCounts, sourceCounts,
      cash: payments.filter((payment) => payment.mode === 'cash').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      upi: payments.filter((payment) => payment.mode === 'upi').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      card: payments.filter((payment) => payment.mode === 'card').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      services: Object.entries(services).sort((a, b) => b[1] - a[1]).slice(0, 6),
    };
  }, [orders, expenses]);

  if (!report) return <p>Loading…</p>;

  const downloadCsv = () => {
    const rows = [['Order', 'Token', 'Customer', 'Status', 'Total', 'Paid', 'Due', 'Date']];
    orders.forEach((order) => rows.push([
      order.order_number, order.token_number || '', order.customer?.name || '', order.status,
      order.total_amount, order.amount_paid, order.amount_due, order.order_date || '',
    ]));
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `washnest-report-${range.from}-to-${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const savePreset = () => {
    const next = [...saved.filter((preset) => preset.from !== range.from || preset.to !== range.to), range].slice(-5);
    setSaved(next);
    localStorage.setItem('washnest-report-presets', JSON.stringify(next));
  };

  const maxService = Math.max(...summary.services.map(([, value]) => value), 1);

  return (
    <>
      <div className="page-header">
        <div><p className="eyebrow"><BarChart3 size={14} aria-hidden="true" /> Business intelligence</p><h1>Reports</h1></div>
        <div className="inline-actions no-print">
          <button className="btn btn--ghost" type="button" onClick={savePreset}>Save filter</button>
          <button className="btn btn--ghost" type="button" onClick={downloadCsv}><Download size={16} aria-hidden="true" /> CSV</button>
          <button className="btn btn--primary" type="button" onClick={() => window.print()}><FileText size={16} aria-hidden="true" /> Print / PDF</button>
        </div>
      </div>

      <div className="filters no-print">
        <div className="form-group"><label htmlFor="report-from">From</label><input id="report-from" type="date" className="form-input" value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} /></div>
        <div className="form-group"><label htmlFor="report-to">To</label><input id="report-to" type="date" className="form-input" value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} /></div>
        <div className="report-presets"><span>Saved filters</span>{saved.map((preset) => <button className="btn btn--sm btn--ghost" type="button" key={`${preset.from}-${preset.to}`} onClick={() => setRange(preset)}>{preset.from} → {preset.to}</button>)}</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Orders in period" value={orders.length} />
        <StatCard label="Revenue" value={formatMoney(summary.revenue)} />
        <StatCard label="Collected" value={formatMoney(summary.collected)} accent="success" />
        <StatCard label="Net after expenses" value={formatMoney(summary.net)} accent={summary.net >= 0 ? 'success' : 'danger'} />
      </div>

      <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card detail-section"><h3>Collections</h3>
          <Detail icon={<Banknote size={15} />} label="Cash" value={formatMoney(summary.cash)} />
          <Detail icon={<Smartphone size={15} />} label="UPI" value={formatMoney(summary.upi)} />
          <Detail icon={<CreditCard size={15} />} label="Card" value={formatMoney(summary.card)} />
          <Detail label="Total collected" value={formatMoney(summary.collected)} strong />
        </div>
        <div className="card detail-section"><h3>Order sources</h3>
          <Detail icon={<Store size={15} />} label="Walk-in" value={summary.sourceCounts.walkin || 0} />
          <Detail icon={<MessageCircle size={15} />} label="WhatsApp" value={summary.sourceCounts.whatsapp || 0} />
          <Detail icon={<Phone size={15} />} label="Phone" value={summary.sourceCounts.phone || 0} />
          <Detail label="Outstanding" value={formatMoney(summary.revenue - summary.collected)} />
        </div>
        <div className="card detail-section"><h3>Status mix</h3>
          {Object.entries(summary.statusCounts).map(([status, count]) => <Detail key={status} label={<span className={`badge badge--${status}`}>{status.replace(/_/g, ' ')}</span>} value={count} />)}
        </div>
      </div>

      <div className="report-columns">
        <section className="card"><h3>Top services by revenue</h3><div className="bar-list">
          {summary.services.length === 0 ? <p className="empty">No service data in this period</p> : summary.services.map(([name, value]) => <div className="bar-row" key={name}><div className="bar-row__label"><span>{name}</span><strong>{formatMoney(value)}</strong></div><div className="bar-track"><span style={{ width: `${(value / maxService) * 100}%` }} /></div></div>)}
        </div></section>
        <section className="card"><h3>Profit & loss</h3>
          <Detail label="Revenue" value={`+ ${formatMoney(summary.revenue)}`} />
          <Detail label="Expenses" value={`− ${formatMoney(summary.expenseTotal)}`} />
          <Detail label="Net" value={formatMoney(summary.net)} strong />
          <p className="report-note">Use the date range above to compare any periods, then print or export the filtered result.</p>
        </section>
      </div>
    </>
  );
}

function Detail({ icon, label, value, strong }) {
  return <div className="detail-row"><span className={`detail-row__label ${icon ? 'label-with-icon' : ''}`}>{icon}{label}</span><span className="detail-row__value" style={strong ? { fontWeight: 700 } : undefined}>{value}</span></div>;
}

function StatCard({ label, value, accent }) {
  return <div className={`stat-card ${accent ? `stat-card--${accent}` : ''}`}><div className="stat-card__label">{label}</div><div className="stat-card__value">{value}</div></div>;
}
