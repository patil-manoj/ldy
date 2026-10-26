import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Banknote, BarChart3, CalendarRange, CheckCircle2, CreditCard, Download, FileText, Filter, MessageCircle, Phone, PieChart, Smartphone, Store, Target, TrendingUp, WalletCards } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDailyReport, getExpenses, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

const CHART_METRICS = {
  orders: { label: 'Number of orders', shortLabel: 'Orders', format: (value) => String(Math.round(value)), color: '#2563eb' },
  revenue: { label: 'Total revenue', shortLabel: 'Revenue', format: formatMoney, color: '#059669' },
  profit: { label: 'Profit', shortLabel: 'Profit', format: formatMoney, color: '#7c3aed' },
};

const STATUS_LABELS = {
  received: 'New', picked_up: 'Picked up', processing: 'Processing', ready: 'Ready',
  out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

function compactMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return formatMoney(amount);
}

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
  const chartMetricInfo = CHART_METRICS[chartMetric];
  const change = (current, old) => old === 0 ? (current === 0 ? '—' : 'New') : `${current >= old ? '+' : ''}${Math.round(((current - old) / old) * 100)}%`;
  const collectionRate = summary.revenue ? Math.round((summary.collected / summary.revenue) * 100) : 0;
  const chartData = chartBuckets.map((bucket) => ({
    ...bucket,
    displayValue: bucket.value,
  }));
  const deliveredOrders = summary.statusCounts.delivered || 0;
  const activeOrders = orders.filter((order) => !['cancelled', 'delivered'].includes(order.status)).length;
  const averageOrder = orders.length ? summary.revenue / orders.length : 0;
  const topService = summary.services[0];
  const sourceTotal = Object.values(summary.sourceCounts).reduce((sum, count) => sum + count, 0) || 1;
  const applyChartPreset = (preset) => {
    setChartPreset(preset);
    if (preset !== 'custom') setRange(getDateRange(preset));
  };

  return (
    <>
      <div className="page-header report-header"><div><p className="eyebrow"><span className="eyebrow__dot" /> Business intelligence</p><h1>Reports & insights</h1><p className="page-subtitle">A clear view of revenue, cash flow, demand, and the work still in motion.</p></div><div className="inline-actions no-print"><button className="btn btn--ghost" type="button" onClick={savePreset}>Save filter</button><button className="btn btn--ghost" type="button" onClick={downloadCsv}><Download size={16} /> CSV</button><button className="btn btn--primary" type="button" onClick={() => window.print()}><FileText size={16} /> Print / PDF</button></div></div>

      <div className="filters report-filters no-print"><div className="report-filters__title"><span className="report-filters__icon"><CalendarRange size={16} /></span><span><strong>Reporting period</strong><small>Compare any window with the one before it</small></span></div><div className="form-group"><label htmlFor="report-from">From</label><input id="report-from" type="date" className="form-input" value={range.from} onChange={(event) => { setChartPreset('custom'); setRange({ ...range, from: event.target.value }); }} /></div><div className="form-group"><label htmlFor="report-to">To</label><input id="report-to" type="date" className="form-input" value={range.to} onChange={(event) => { setChartPreset('custom'); setRange({ ...range, to: event.target.value }); }} /></div><div className="report-presets"><span>Saved filters</span>{saved.map((preset) => <button className="btn btn--sm btn--ghost" type="button" key={`${preset.from}-${preset.to}`} onClick={() => setRange(preset)}>{preset.from} → {preset.to}</button>)}</div></div>

      <div className="report-overview"><div className="report-overview__intro"><span className="report-overview__icon"><BarChart3 size={20} /></span><div><strong>Executive snapshot</strong><span>{range.from} to {range.to}</span></div></div><div className="report-overview__metrics"><div><span>Revenue</span><strong>{formatMoney(summary.revenue)}</strong><small>{previous ? `${change(summary.revenue, previous.revenue)} vs previous` : 'Selected period'}</small></div><div><span>Cash collected</span><strong>{formatMoney(summary.collected)}</strong><small>{collectionRate}% collection rate</small></div><div><span>Net cash position</span><strong>{formatMoney(summary.net)}</strong><small>{formatMoney(summary.expenseTotal)} operating expenses</small></div></div></div>

      <div className="bi-kpi-grid"><BiKpi label="Orders" value={orders.length} meta={`${activeOrders} still active`} icon={<Filter size={16} />} tone="blue" /><BiKpi label="Average order" value={compactMoney(averageOrder)} meta="Revenue per bill" icon={<Target size={16} />} tone="violet" /><BiKpi label="Delivered" value={`${orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0}%`} meta={`${deliveredOrders} completed orders`} icon={<CheckCircle2 size={16} />} tone="green" /><BiKpi label="Outstanding" value={formatMoney(summary.revenue - summary.collected)} meta="Receivables to follow up" icon={<WalletCards size={16} />} tone="amber" /></div>

      <section className="card analytics-chart bi-trend-card"><div className="analytics-chart__header"><div className="section-heading section-heading--compact"><span className="section-heading__icon"><TrendingUp size={18} /></span><div><h2>Performance trend</h2><p>Revenue, orders, and profit across the selected period.</p></div></div><div className="analytics-chart__controls no-print"><div className="chart-segmented" aria-label="Chart range">{['week', 'month', 'custom'].map((preset) => <button key={preset} type="button" className={chartPreset === preset ? 'is-active' : ''} onClick={() => applyChartPreset(preset)}>{preset === 'week' ? '7 days' : preset === 'month' ? '30 days' : 'Custom'}</button>)}</div><select className="form-select chart-metric" value={chartMetric} onChange={(event) => setChartMetric(event.target.value)} aria-label="Chart metric">{Object.entries(CHART_METRICS).map(([key, metric]) => <option key={key} value={key}>{metric.label}</option>)}</select></div></div><div className="chart-summary"><strong>{chartMetricInfo.format(chartBuckets.reduce((sum, bucket) => sum + bucket.value, 0))}</strong><span>{chartMetricInfo.shortLabel.toLowerCase()} during selected period</span>{previous && <span className="chart-summary__compare">{change(summary.revenue, previous.revenue)} vs previous period</span>}</div><div className="line-chart" role="img" aria-label={`${chartMetricInfo.label} trend chart`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={chartMetricInfo.color} stopOpacity=".28" /><stop offset="100%" stopColor={chartMetricInfo.color} stopOpacity=".02" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e5e9f2" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fill: '#7b879e', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} /><YAxis tickFormatter={chartMetricInfo.format} tick={{ fill: '#7b879e', fontSize: 10 }} tickLine={false} axisLine={false} width={54} /><Tooltip formatter={(value) => [chartMetricInfo.format(value), chartMetricInfo.shortLabel]} labelStyle={{ color: '#182033', fontWeight: 700 }} contentStyle={{ border: '1px solid #e5e9f2', borderRadius: 9, boxShadow: '0 8px 24px rgba(16, 25, 54, .1)', fontSize: 12 }} /><Area type="monotone" dataKey="displayValue" stroke={chartMetricInfo.color} strokeWidth={3} fill="url(#chart-fill)" dot={{ r: 3, fill: '#fff', stroke: chartMetricInfo.color, strokeWidth: 2 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div></section>

      <div className="bi-grid bi-grid--primary"><section className="card bi-panel bi-panel--services"><PanelHeading icon={<ArrowUpRight size={17} />} title="Revenue by service" subtitle="Where your sales are coming from" /><div className="service-bars">{summary.services.length === 0 ? <p className="empty">No service data in this period</p> : summary.services.map(([name, value], index) => <div className="service-bar" key={name}><div><span className="service-bar__rank">{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><em>{formatMoney(value)}</em></div><div className="bar-track"><span style={{ width: `${(value / maxService) * 100}%` }} /></div><small>{summary.revenue ? Math.round((value / summary.revenue) * 100) : 0}% of revenue</small></div>)}</div></section><section className="card bi-panel"><PanelHeading icon={<WalletCards size={17} />} title="Collection mix" subtitle="How money reached the desk" /><div className="mix-chart"><div className="mix-donut" style={{ '--cash': `${summary.collected ? (summary.cash / summary.collected) * 100 : 0}%`, '--upi': `${summary.collected ? (summary.upi / summary.collected) * 100 : 0}%` }}><strong>{collectionRate}%</strong><span>collected</span></div><div className="mix-legend"><MixRow color="green" label="Cash" value={summary.cash} total={summary.collected} /><MixRow color="blue" label="UPI" value={summary.upi} total={summary.collected} /><MixRow color="violet" label="Card" value={summary.card} total={summary.collected} /></div></div><div className="bi-callout"><strong>{formatMoney(summary.revenue - summary.collected)}</strong><span>still outstanding</span></div></section></div>

      <div className="bi-grid bi-grid--secondary"><section className="card bi-panel"><PanelHeading icon={<Store size={17} />} title="Demand channels" subtitle="Which front doors bring orders" /><div className="channel-list"><ChannelRow label="Walk-in" icon={<Store size={15} />} value={summary.sourceCounts.walkin || 0} total={sourceTotal} /><ChannelRow label="WhatsApp" icon={<MessageCircle size={15} />} value={summary.sourceCounts.whatsapp || 0} total={sourceTotal} /><ChannelRow label="Phone" icon={<Phone size={15} />} value={summary.sourceCounts.phone || 0} total={sourceTotal} /></div></section><section className="card bi-panel"><PanelHeading icon={<PieChart size={17} />} title="Order pipeline" subtitle="Current operational load" /><div className="pipeline-list">{Object.entries(summary.statusCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([status, count]) => <div className="pipeline-row" key={status}><span className={`pipeline-dot pipeline-dot--${status}`} /><span>{STATUS_LABELS[status] || status.replace(/_/g, ' ')}</span><strong>{count}</strong><div><i style={{ width: `${orders.length ? (count / orders.length) * 100 : 0}%` }} /></div></div>)}</div></section><section className="card bi-panel bi-panel--insights"><PanelHeading icon={<Target size={17} />} title="Decision signals" subtitle="Useful actions from this period" /><div className="insight-list"><Insight icon={summary.net >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />} tone={summary.net >= 0 ? 'positive' : 'negative'} title={summary.net >= 0 ? 'Positive cash position' : 'Expenses exceed collections'} detail={`${formatMoney(summary.net)} net after operating expenses`} /><Insight icon={<WalletCards size={15} />} tone="warning" title={`${formatMoney(summary.revenue - summary.collected)} to collect`} detail={`${100 - collectionRate}% of billed revenue remains open`} /><Insight icon={<TrendingUp size={15} />} tone="info" title={topService ? `${topService[0]} leads sales` : 'No service leader yet'} detail={topService ? `${formatMoney(topService[1])} in revenue this period` : 'Add orders to unlock service insights'} /></div></section></div>

      <section className="card bi-table-panel"><PanelHeading icon={<BarChart3 size={17} />} title="Recent activity" subtitle="The latest bills included in this report" /><div className="bi-table-wrap"><table className="bi-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Value</th><th>Paid</th></tr></thead><tbody>{orders.slice(0, 7).map((order) => <tr key={order.id}><td><strong>{order.order_number}</strong><small>{order.order_date || order.created_at?.slice(0, 10)}</small></td><td>{order.customer?.name || 'Walk-in'}</td><td><span className={`bi-status bi-status--${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span></td><td>{formatMoney(order.total_amount)}</td><td className={Number(order.amount_due) > 0 ? 'is-pending' : 'is-paid'}>{Number(order.amount_due) > 0 ? formatMoney(order.amount_paid) : 'Paid'}</td></tr>)}</tbody></table>{orders.length === 0 && <p className="empty">No orders in this period.</p>}</div></section>
    </>
  );
}

function PanelHeading({ icon, title, subtitle }) {
  return <div className="bi-panel__heading"><span className="bi-panel__icon">{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}

function BiKpi({ label, value, meta, icon, tone }) {
  return <div className={`bi-kpi bi-kpi--${tone}`}><span className="bi-kpi__icon">{icon}</span><span className="bi-kpi__label">{label}</span><strong>{value}</strong><small>{meta}</small></div>;
}

function MixRow({ color, label, value, total }) {
  return <div className="mix-row"><span className={`mix-dot mix-dot--${color}`} /><span>{label}</span><strong>{formatMoney(value)}</strong><small>{total ? Math.round((value / total) * 100) : 0}%</small></div>;
}

function ChannelRow({ label, icon, value, total }) {
  return <div className="channel-row"><span className="channel-row__icon">{icon}</span><span>{label}</span><strong>{value}</strong><div><i style={{ width: `${(value / total) * 100}%` }} /></div><small>{Math.round((value / total) * 100)}%</small></div>;
}

function Insight({ icon, tone, title, detail }) {
  return <div className={`insight insight--${tone}`}><span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div></div>;
}

function Detail({ icon, label, value, strong }) {
  return <div className="detail-row"><span className={`detail-row__label ${icon ? 'label-with-icon' : ''}`}>{icon}{label}</span><span className="detail-row__value" style={strong ? { fontWeight: 700 } : undefined}>{value}</span></div>;
}

function StatCard({ label, value, accent, trend, icon }) {
  return <div className={`stat-card report-stat-card ${accent ? `stat-card--${accent}` : ''}`}><div className="report-stat-card__top"><span>{icon}</span><div className="stat-card__label">{label}</div></div><div className="stat-card__value">{value}</div>{trend && <div className={`stat-card__trend ${trend.startsWith('-') ? 'is-down' : ''}`}>{trend} vs previous period</div>}</div>;
}
