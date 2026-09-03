import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, updateOrderStatus, recordPayment } from '../api';

const STATUS_FLOW = ['received', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered'];
const SERVICE_LABELS = { wash_fold: 'Wash & Fold', iron: 'Ironing', wash_iron: 'Wash & Iron', dry_clean: 'Dry Clean' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', mode: 'cash', reference: '', received_by: '' });

  const load = () => getOrder(id).then(setOrder).catch(console.error);
  useEffect(() => { load(); }, [id]);

  if (!order) return <p>Loading…</p>;

  const currentIdx = STATUS_FLOW.indexOf(order.status);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(order.id, { status: newStatus });
      toast.success(`Status → ${newStatus.replace(/_/g, ' ')}`);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handlePayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return toast.error('Enter a valid amount');
    try {
      await recordPayment(order.id, { ...payForm, amount: Number(payForm.amount) });
      toast.success('Payment recorded');
      setShowPayModal(false);
      setPayForm({ amount: '', mode: 'cash', reference: '', received_by: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <>
      <div className="page-header">
        <h1>
          {order.order_number}
          {order.is_express && <span className="badge badge--express" style={{ marginLeft: 8, fontSize: '.7rem' }}>EXPRESS ⚡</span>}
        </h1>
        <div className="inline-actions">
          {nextStatus && order.status !== 'cancelled' && (
            <button className="btn btn--primary" onClick={() => handleStatusChange(nextStatus)}>
              → {nextStatus.replace(/_/g, ' ')}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button className="btn btn--danger" onClick={() => handleStatusChange('cancelled')}>Cancel</button>
          )}
          {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
            <button className="btn btn--success" onClick={() => { setPayForm(f => ({ ...f, amount: String(order.amount_due) })); setShowPayModal(true); }}>
              💰 Record Payment
            </button>
          )}
          <button className="btn btn--ghost no-print" onClick={() => window.print()}>🖨️ Print</button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="timeline">
        {STATUS_FLOW.map((s, i) => (
          <span key={s} className={`timeline__step ${i === currentIdx ? 'timeline__step--active' : i < currentIdx ? 'timeline__step--done' : ''}`}>
            {s.replace(/_/g, ' ')}
          </span>
        ))}
        {order.status === 'cancelled' && <span className="timeline__step" style={{ background: '#dc2626', color: '#fff' }}>cancelled</span>}
      </div>

      {/* Detail Sections */}
      <div className="detail-grid" style={{ marginTop: '1.5rem' }}>
        <div className="card detail-section">
          <h3>Customer</h3>
          <div className="detail-row"><span className="detail-row__label">Name</span><span className="detail-row__value"><Link to={`/customers/${order.customer_id}`}>{order.customer?.name}</Link></span></div>
          <div className="detail-row"><span className="detail-row__label">Phone</span><span className="detail-row__value">{order.customer?.phone}</span></div>
          {order.customer?.area && <div className="detail-row"><span className="detail-row__label">Area</span><span className="detail-row__value">{order.customer.area}</span></div>}
        </div>

        <div className="card detail-section">
          <h3>Schedule</h3>
          <div className="detail-row"><span className="detail-row__label">Order Date</span><span className="detail-row__value">{order.order_date || '—'}</span></div>
          <div className="detail-row"><span className="detail-row__label">Pickup</span><span className="detail-row__value">{order.pickup_date || '—'} {order.pickup_slot && `(${order.pickup_slot})`}</span></div>
          <div className="detail-row"><span className="detail-row__label">Expected Delivery</span><span className="detail-row__value">{order.expected_delivery_date || '—'} {order.delivery_slot && `(${order.delivery_slot})`}</span></div>
          {order.actual_delivery_date && <div className="detail-row"><span className="detail-row__label">Delivered On</span><span className="detail-row__value">{order.actual_delivery_date}</span></div>}
          <div className="detail-row"><span className="detail-row__label">Source</span><span className="detail-row__value">{order.source}</span></div>
        </div>

        <div className="card detail-section">
          <h3>Payment</h3>
          <div className="detail-row"><span className="detail-row__label">Status</span><span className={`badge badge--${order.payment_status}`}>{order.payment_status}</span></div>
          <div className="detail-row"><span className="detail-row__label">Total</span><span className="detail-row__value" style={{ fontWeight: 700 }}>₹{order.total_amount.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><span className="detail-row__label">Paid</span><span className="detail-row__value">₹{order.amount_paid.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><span className="detail-row__label">Due</span><span className="detail-row__value" style={{ color: order.amount_due > 0 ? '#dc2626' : '#059669' }}>₹{order.amount_due.toLocaleString('en-IN')}</span></div>
          {order.payment_mode && <div className="detail-row"><span className="detail-row__label">Mode</span><span className="detail-row__value">{order.payment_mode}</span></div>}
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Items ({order.items.length})</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Service</th><th>Qty</th><th>Rate</th><th>Total</th><th>Notes</th></tr></thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td>{SERVICE_LABELS[item.service_type] || item.service_type}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price_per_unit}</td>
                  <td>₹{item.subtotal}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '.95rem', lineHeight: 1.8 }}>
          <div>Subtotal: ₹{order.subtotal}</div>
          {order.express_charge > 0 && <div>Express: ₹{order.express_charge}</div>}
          {order.discount_amount > 0 && <div>Discount ({order.discount_percent}%): −₹{order.discount_amount}</div>}
          {order.delivery_charge > 0 && <div>Delivery: ₹{order.delivery_charge}</div>}
          {order.gst_amount > 0 && <div>GST ({order.gst_percent}%): ₹{order.gst_amount}</div>}
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total: ₹{order.total_amount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Payment History */}
      {order.payments.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Payment History</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Received By</th></tr></thead>
              <tbody>
                {order.payments.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.received_at).toLocaleString('en-IN')}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.mode}</td>
                    <td>{p.reference || '—'}</td>
                    <td>{p.received_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status History */}
      {order.status_history.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Status History</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>From</th><th>To</th><th>By</th><th>Notes</th></tr></thead>
              <tbody>
                {order.status_history.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.changed_at).toLocaleString('en-IN')}</td>
                    <td>{h.from_status || '—'}</td>
                    <td><span className={`badge badge--${h.to_status}`}>{h.to_status.replace(/_/g, ' ')}</span></td>
                    <td>{h.changed_by || '—'}</td>
                    <td>{h.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {(order.notes || order.staff_notes) && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Notes</h3>
          {order.notes && <div style={{ marginBottom: '.5rem' }}><strong>Customer:</strong> {order.notes}</div>}
          {order.staff_notes && <div><strong>Staff:</strong> {order.staff_notes}</div>}
        </div>
      )}

      {/* Receipt (for printing) */}
      <div className="receipt" style={{ display: 'none' }}>
        {/* Shown only during print via CSS */}
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Record Payment</h2>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input className="form-input" type="number" min="1" max={order.amount_due} value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} autoFocus />
            </div>
            <div className="form-group">
              <label>Mode</label>
              <select className="form-select" value={payForm.mode} onChange={e => setPayForm(f => ({ ...f, mode: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reference (UPI ID / Transaction #)</label>
              <input className="form-input" value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Received By</label>
              <input className="form-input" value={payForm.received_by} onChange={e => setPayForm(f => ({ ...f, received_by: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn--ghost" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn btn--success" onClick={handlePayment}>Record ₹{payForm.amount || 0}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
