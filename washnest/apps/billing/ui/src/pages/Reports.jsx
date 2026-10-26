import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Banknote, BarChart3, CalendarRange, CreditCard, Download, FileText, Filter, MessageCircle, Phone, PieChart, Smartphone, Store, Target, TrendingUp, WalletCards } from 'lucide-react';
import { getDailyReport, getExpenses, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

const CHART_METRICS = {
  orders: { label: 'Number of orders', shortLabel: 'Orders', format: (value) => String(Math.round(value)), color: '#2563eb' },
  revenue: { label: 'Total revenue', shortLabel: 'Revenue', format: formatMoney, color: '#059669' },
  profit: { label: 'Profit', shortLabel: 'Profit', format: formatMoney, color: '#7c3aed' },
};

function dateString(date) {
  return date.toISOString().split('T')[0];
}

function getDateRange(preset) {
  const end = new Date();
  const start = new Date(end);
  if (preset === 'week') start.setDate(end.getDate() - 6);
  if (preset === 'month') start.setDate(end.getDate() - 29);
  return { from: dateString(start), to: dateString(end) };
}

function getPreviousRange(from, to) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const previousEnd = new Date(start);
  previousEnd.setDate(start.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - days + 1);
  return { from: dateString(previousStart), to: dateString(previousEnd) };
}

function getChartBuckets(from, to, orders, expenses, metric, grouping) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const dayCount = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const bucketCount = grouping === 'day' ? dayCount : Math.ceil(dayCount / 7);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + (grouping === 'day' ? index : index * 7));
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + (grouping === 'day' ? 0 : 6));
    return {
      label: grouping === 'day'
        ? bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : `${bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}–${bucketEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
      from: dateString(bucketStart),
      to: dateString(bucketEnd > end ? end : bucketEnd),
      orders: [],
      expenses: [],
    };
  });
  const bucketFor = (date) => {
    const offset = Math.floor((new Date(`${date}T00:00:00`) - start) / 86400000);
    return buckets[Math.min(buckets.length - 1, grouping === 'day' ? offset : Math.floor(offset / 7))];
  };
  orders.forEach((order) => {
    const bucket = bucketFor(order.order_date || order.created_at.slice(0, 10));
    if (bucket) bucket.orders.push(order);
  });
  expenses.forEach((expense) => {
    const bucket = bucketFor(expense.date);
    if (bucket) bucket.expenses.push(expense);
  });
  return buckets.map((bucket) => {
    const revenue = bucket.orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const expenseTotal = bucket.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const profit = bucket.orders.reduce((sum, order) => sum + Number(order.amount_paid || 0), 0) - expenseTotal;
    return { ...bucket, value: metric === 'orders' ? bucket.orders.length : metric === 'revenue' ? revenue : profit };
  });
}

export default function Reports() {
  const [range, setRange] = useState(getDateRange('week'));
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [chartPreset, setChartPreset] = useState('week');
  const [chartMetric, setChartMetric] = useState('revenue');
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('washnest-report-presets') || '[]'));

  useEffect(() => {
    const previousRange = getPreviousRange(range.from, range.to);
    Promise.all([
      getDailyReport(range.to),
      getOrders({ date_from: range.from, date_to: range.to, limit: 200 }),
      getExpenses({ date_from: range.from, date_to: range.to, limit: 200 }),
      getOrders({ date_from: previousRange.from, date_to: previousRange.to, limit: 200 }),
      getExpenses({ date_from: previousRange.from, date_to: previousRange.to, limit: 200 }),
    ]).then(([daily, filteredOrders, filteredExpenses, previousOrders, previousExpenses]) => {
      setReport(daily);
      setOrders(filteredOrders);
      setExpenses(filteredExpenses);
      setPrevious({
        orders: previousOrders,
        revenue: previousOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
        profit: previousOrders.reduce((sum, order) => sum + Number(order.amount_paid || 0), 0) - previousExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      });
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
  const chartGrouping = range.from === range.to || (new Date(range.to) - new Date(range.from)) / 86400000 < 14 ? 'day' : 'week';
  const chartBuckets = getChartBuckets(range.from, range.to, orders, expenses, chartMetric, chartGrouping);
  const chartMax = Math.max(...chartBuckets.map((bucket) => bucket.value), 1);
  const chartMetricInfo = CHART_METRICS[chartMetric];
  const change = (current, old) => old === 0 ? (current === 0 ? '—' : 'New') : `${current >= old ? '+' : ''}${Math.round(((current - old) / old) * 100)}%`;
  const collectionRate = summary.revenue ? Math.round((summary.collected / summary.revenue) * 100) : 0;
  const chartPoints = chartBuckets.map((bucket, index) => {
    const x = chartBuckets.length === 1 ? 50 : (index / (chartBuckets.length - 1)) * 100;
    const y = 100 - ((bucket.value / chartMax) * 84 + 8);
    return `${x},${y}`;
  }).join(' ');
  const applyChartPreset = (preset) => {
    setChartPreset(preset);
    if (preset !== 'custom') setRange(getDateRange(preset));
  };

  return (
    <>
      <div className="page-header report-header">
        <div><p className="eyebrow"><span className="eyebrow__dot" /> Business intelligence</p><h1>Reports & insights</h1><p className="page-subtitle">Understand your performance, spot trends, and make better decisions.</p></div>
        <div className="inline-actions no-print">
          <button className="btn btn--ghost" type="button" onClick={savePreset}>Save filter</button>
          <button className="btn btn--ghost" type="button" onClick={downloadCsv}><Download size={16} aria-hidden="true" /> CSV</button>
          <button className="btn btn--primary" type="button" onClick={() => window.print()}><FileText size={16} aria-hidden="true" /> Print / PDF</button>
        </div>
      </div>

      <div className="filters report-filters no-print">
        <div className="report-filters__title"><span className="report-filters__icon"><CalendarRange size={16} /></span><span><strong>Reporting period</strong><small>Choose the window you want to analyse</small></span></div>
        <div className="form-group"><label htmlFor="report-from">From</label><input id="report-from" type="date" className="form-input" value={range.from} onChange={(event) => { setChartPreset('custom'); setRange({ ...range, from: event.target.value }); }} /></div>
        <div className="form-group"><label htmlFor="report-to">To</label><input id="report-to" type="date" className="form-input" value={range.to} onChange={(event) => { setChartPreset('custom'); setRange({ ...range, to: event.target.value }); }} /></div>
        <div className="report-presets"><span>Saved filters</span>{saved.map((preset) => <button className="btn btn--sm btn--ghost" type="button" key={`${preset.from}-${preset.to}`} onClick={() => setRange(preset)}>{preset.from} → {preset.to}</button>)}</div>
      </div>

      <div className="report-overview">
        <div className="report-overview__intro"><span className="report-overview__icon"><PieChart size={20} /></span><div><strong>Business overview</strong><span>{range.from} to {range.to}</span></div></div>
        <div className="report-overview__metrics">
          <div><span>Revenue</span><strong>{formatMoney(summary.revenue)}</strong><small className={previous ? (change(summary.revenue, previous.revenue).startsWith('-') ? 'is-down' : '') : ''}>{previous ? `${change(summary.revenue, previous.revenue)} vs previous` : 'Selected period'}</small></div>
          <div><span>Collected</span><strong>{formatMoney(summary.collected)}</strong><small>{collectionRate}% collection rate</small></div>
          <div><span>Net after expenses</span><strong>{formatMoney(summary.net)}</strong><small>{formatMoney(summary.expenseTotal)} expenses</small></div>
        </div>
      </div>

      <section className="card analytics-chart">
        <div className="analytics-chart__header">
          <div className="section-heading section-heading--compact">
            <span className="section-heading__icon"><TrendingUp size={18} aria-hidden="true" /></span>
            <div><h2>Performance trend</h2><p>Track the business signals that matter most.</p></div>
          </div>
          <div className="analytics-chart__controls no-print">
            <div className="chart-segmented" aria-label="Chart range">
              {['week', 'month', 'custom'].map((preset) => <button key={preset} type="button" className={chartPreset === preset ? 'is-active' : ''} onClick={() => applyChartPreset(preset)}>{preset === 'week' ? 'Last 7 days' : preset === 'month' ? 'Last 30 days' : 'Custom'}</button>)}
            </div>
            <select className="form-select chart-metric" value={chartMetric} onChange={(event) => setChartMetric(event.target.value)} aria-label="Chart metric">
              {Object.entries(CHART_METRICS).map(([key, metric]) => <option key={key} value={key}>{metric.label}</option>)}
            </select>
          </div>
        </div>
        <div className="chart-summary"><strong>{chartMetricInfo.format(chartBuckets.reduce((sum, bucket) => sum + bucket.value, 0))}</strong><span>{chartMetricInfo.shortLabel.toLowerCase()} during selected period</span></div>
        <div className="line-chart" role="img" aria-label={`${chartMetricInfo.label} trend chart`}>
          <div className="line-chart__scale"><span>{chartMetricInfo.format(chartMax)}</span><span>{chartMetricInfo.format(chartMax / 2)}</span><span>0</span></div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={chartMetricInfo.color} stopOpacity=".25" /><stop offset="100%" stopColor={chartMetricInfo.color} stopOpacity=".02" /></linearGradient></defs>
            <line x1="0" x2="100" y1="8" y2="8" /><line x1="0" x2="100" y1="50" y2="50" /><line x1="0" x2="100" y1="92" y2="92" />
            <polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#chart-fill)" />
            <polyline points={chartPoints} fill="none" stroke={chartMetricInfo.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            {chartBuckets.map((bucket, index) => <circle key={bucket.label} cx={chartBuckets.length === 1 ? 50 : (index / (chartBuckets.length - 1)) * 100} cy={100 - ((bucket.value / chartMax) * 84 + 8)} r="1.8" fill="#fff" stroke={chartMetricInfo.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke"><title>{bucket.label}: {chartMetricInfo.format(bucket.value)}</title></circle>)}
          </svg>
          <div className="line-chart__labels">{chartBuckets.map((bucket) => <span key={bucket.label}>{bucket.label}</span>)}</div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="Orders in period" value={orders.length} icon={<Filter size={16} />} />
        <StatCard label="Revenue" value={formatMoney(summary.revenue)} icon={<TrendingUp size={16} />} trend={previous && change(summary.revenue, previous.revenue)} />
        <StatCard label="Collected" value={formatMoney(summary.collected)} icon={<WalletCards size={16} />} accent="success" />
        <StatCard label="Net after expenses" value={formatMoney(summary.net)} icon={<Target size={16} />} accent={summary.net >= 0 ? 'success' : 'danger'} trend={previous && change(summary.net, previous.profit)} />
      </div>

      <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card detail-section report-detail-card"><div className="report-detail-card__heading"><span className="report-detail-card__icon report-detail-card__icon--green"><WalletCards size={17} /></span><div><h3>Collections</h3><p>How customers paid</p></div></div>
          <Detail icon={<Banknote size={15} />} label="Cash" value={formatMoney(summary.cash)} />
          <Detail icon={<Smartphone size={15} />} label="UPI" value={formatMoney(summary.upi)} />
          <Detail icon={<CreditCard size={15} />} label="Card" value={formatMoney(summary.card)} />
          <Detail label="Total collected" value={formatMoney(summary.collected)} strong />
        </div>
        <div className="card detail-section report-detail-card"><div className="report-detail-card__heading"><span className="report-detail-card__icon report-detail-card__icon--blue"><Store size={17} /></span><div><h3>Order sources</h3><p>Where orders come from</p></div></div>
          <Detail icon={<Store size={15} />} label="Walk-in" value={summary.sourceCounts.walkin || 0} />
          <Detail icon={<MessageCircle size={15} />} label="WhatsApp" value={summary.sourceCounts.whatsapp || 0} />
          <Detail icon={<Phone size={15} />} label="Phone" value={summary.sourceCounts.phone || 0} />
          <Detail label="Outstanding" value={formatMoney(summary.revenue - summary.collected)} />
        </div>
        <div className="card detail-section report-detail-card"><div className="report-detail-card__heading"><span className="report-detail-card__icon report-detail-card__icon--purple"><PieChart size={17} /></span><div><h3>Status mix</h3><p>Current order distribution</p></div></div>
          {Object.entries(summary.statusCounts).map(([status, count]) => <Detail key={status} label={<span className={`badge badge--${status}`}>{status.replace(/_/g, ' ')}</span>} value={count} />)}
        </div>
      </div>

      <div className="report-columns">
        <section className="card report-service-card"><div className="report-card-heading"><div><h3>Top services by revenue</h3><p>What is driving your sales</p></div><ArrowUpRight size={18} /></div><div className="bar-list">
          {summary.services.length === 0 ? <p className="empty">No service data in this period</p> : summary.services.map(([name, value]) => <div className="bar-row" key={name}><div className="bar-row__label"><span>{name}</span><strong>{formatMoney(value)}</strong></div><div className="bar-track"><span style={{ width: `${(value / maxService) * 100}%` }} /></div></div>)}
        </div></section>
        <section className="card report-service-card"><div className="report-card-heading"><div><h3>Profit & loss</h3><p>A simple view of your bottom line</p></div><TrendingUp size={18} /></div>
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

function StatCard({ label, value, accent, trend, icon }) {
  return <div className={`stat-card report-stat-card ${accent ? `stat-card--${accent}` : ''}`}><div className="report-stat-card__top"><span>{icon}</span><div className="stat-card__label">{label}</div></div><div className="stat-card__value">{value}</div>{trend && <div className={`stat-card__trend ${trend.startsWith('-') ? 'is-down' : ''}`}>{trend} vs previous period</div>}</div>;
}
