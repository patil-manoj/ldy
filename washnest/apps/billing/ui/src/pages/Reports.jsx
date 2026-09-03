import { useEffect, useState } from 'react';
import { getDailyReport } from '../api';

export default function Reports() {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);

  const load = () => getDailyReport(reportDate).then(setReport).catch(console.error);
  useEffect(() => { load(); }, [reportDate]);

  if (!report) return <p>Loading…</p>;

  return (
    <>
      <div className="page-header">
        <h1>Daily Report</h1>
        <input type="date" className="form-input" style={{ width: 'auto' }} value={reportDate} onChange={e => setReportDate(e.target.value)} />
      </div>

      <div className="stats-grid">
        <StatCard label="Total Orders" value={report.total_orders} />
        <StatCard label="Total Revenue" value={`₹${report.total_revenue.toLocaleString('en-IN')}`} />
        <StatCard label="Collected" value={`₹${report.collected_revenue.toLocaleString('en-IN')}`} accent="success" />
        <StatCard label="Pending" value={`₹${report.pending_revenue.toLocaleString('en-IN')}`} accent={report.pending_revenue > 0 ? 'danger' : undefined} />
      </div>

      <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Collections Breakdown */}
        <div className="card detail-section">
          <h3>Collections</h3>
          <div className="detail-row"><span className="detail-row__label">💵 Cash</span><span className="detail-row__value">₹{report.cash_collected.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><span className="detail-row__label">📱 UPI</span><span className="detail-row__value">₹{report.upi_collected.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><span className="detail-row__label">💳 Card</span><span className="detail-row__value">₹{report.card_collected.toLocaleString('en-IN')}</span></div>
          <div className="detail-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '.5rem', marginTop: '.5rem' }}>
            <span className="detail-row__label"><strong>Total Collected</strong></span>
            <span className="detail-row__value"><strong>₹{report.collected_revenue.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Order Sources */}
        <div className="card detail-section">
          <h3>Order Sources</h3>
          <div className="detail-row"><span className="detail-row__label">🏪 Walk-in</span><span className="detail-row__value">{report.walkin_orders}</span></div>
          <div className="detail-row"><span className="detail-row__label">📱 WhatsApp</span><span className="detail-row__value">{report.whatsapp_orders}</span></div>
          <div className="detail-row"><span className="detail-row__label">📞 Phone</span><span className="detail-row__value">{report.phone_orders}</span></div>
        </div>

        {/* Order Status */}
        <div className="card detail-section">
          <h3>By Status</h3>
          {Object.entries(report.orders_by_status).map(([status, count]) => (
            <div className="detail-row" key={status}>
              <span className="detail-row__label"><span className={`badge badge--${status}`}>{status.replace(/_/g, ' ')}</span></span>
              <span className="detail-row__value">{count}</span>
            </div>
          ))}
          {Object.keys(report.orders_by_status).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders</p>}
        </div>
      </div>

      {/* P&L Summary */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Profit & Loss</h3>
        <div style={{ maxWidth: 400 }}>
          <div className="detail-row"><span className="detail-row__label">Revenue Collected</span><span className="detail-row__value" style={{ color: '#059669' }}>+ ₹{report.collected_revenue.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><span className="detail-row__label">Expenses</span><span className="detail-row__value" style={{ color: '#dc2626' }}>− ₹{report.expenses_total.toLocaleString('en-IN')}</span></div>
          <div className="detail-row" style={{ borderTop: '2px solid var(--border)', paddingTop: '.5rem', marginTop: '.5rem' }}>
            <span className="detail-row__label"><strong>Net</strong></span>
            <span className="detail-row__value" style={{ fontWeight: 700, fontSize: '1.2rem', color: report.net_revenue >= 0 ? '#059669' : '#dc2626' }}>
              ₹{report.net_revenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, accent }) {
  const color = accent === 'success' ? '#059669' : accent === 'danger' ? '#dc2626' : undefined;
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}
