import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Ban, CheckCircle2, IndianRupee, MessageCircle, Printer, Zap } from 'lucide-react';
import { getOrder, getSettings, updateOrderStatus, recordPayment } from '../api';
import { formatMoney, SERVICE_LABELS, settingsToObject } from '../lib/billing';

const STATUS_FLOW = ['received', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({});
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', mode: 'cash', reference: '', received_by: '' });

  const load = () => getOrder(id).then(setOrder).catch(console.error);
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    getSettings()
      .then((settingList) => setSettings(settingsToObject(settingList)))
      .catch(console.error);
  }, []);

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

  const handleWhatsApp = () => {
    const itemLines = order.items.map((item, index) => {
      const quantity = item.weight_kg ? `${item.weight_kg} kg` : `${item.quantity} × ${formatMoney(item.price_per_unit)}`;
      return `${index + 1}. ${item.item_name} (${SERVICE_LABELS[item.service_type] || item.service_type})\n   ${quantity} = ${formatMoney(item.subtotal)}`;
    }).join('\n');
    const expectedDelivery = order.expected_delivery_date
      ? `\n*Expected delivery:* ${new Date(`${order.expected_delivery_date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : '';
    const paymentSummary = order.amount_due > 0
      ? `*Paid:* ${formatMoney(order.amount_paid)}\n*Balance due:* ${formatMoney(order.amount_due)}`
      : '*Payment:* Paid in full';
    const gstLine = order.gst_amount > 0 ? `\nGST (${order.gst_percent}%): ${formatMoney(order.gst_amount)}` : '';
    const message = [
      `Hello ${order.customer?.name || 'there'},`,
      '',
      `Your *${settings.shop_name || 'Wash Nest'}* bill is ready.`,
      `*Bill:* ${order.order_number}`,
      `*Date:* ${new Date(order.created_at).toLocaleDateString('en-IN')}`,
      '',
      '*Services*',
      itemLines,
      '',
      `Subtotal: ${formatMoney(order.subtotal)}${gstLine}`,
      `*Total: ${formatMoney(order.total_amount)}*`,
      paymentSummary,
      expectedDelivery,
      order.notes ? `\n*Note:* ${order.notes}` : '',
      '',
      `Thank you for choosing ${settings.shop_name || 'Wash Nest'}.`,
      settings.shop_phone ? `Questions? Call ${settings.shop_phone}` : '',
    ].filter((line) => line !== '').join('\n');

    let customerPhone = (order.customer?.phone || '').replace(/\D/g, '');
    if (customerPhone.length === 10) customerPhone = `91${customerPhone}`;
    window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="page-header">
        <h1>
          {order.order_number}
          {order.is_express && <span className="badge badge--express" style={{ marginLeft: 8, fontSize: '.7rem' }}><Zap size={12} aria-hidden="true" /> EXPRESS</span>}
        </h1>
        <div className="inline-actions">
          {nextStatus && order.status !== 'cancelled' && (
            <button className="btn btn--primary" onClick={() => handleStatusChange(nextStatus)}>
              <ArrowRight size={17} aria-hidden="true" /> {nextStatus.replace(/_/g, ' ')}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button className="btn btn--danger" onClick={() => handleStatusChange('cancelled')}><Ban size={16} aria-hidden="true" /> Cancel</button>
          )}
          {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
            <button className="btn btn--success" onClick={() => { setPayForm(f => ({ ...f, amount: String(order.amount_due) })); setShowPayModal(true); }}>
              <IndianRupee size={17} aria-hidden="true" /> Record payment
            </button>
          )}
          <button className="btn btn--whatsapp no-print" onClick={handleWhatsApp}><MessageCircle size={17} aria-hidden="true" /> Send on WhatsApp</button>
          <button className="btn btn--ghost no-print" onClick={() => window.print()}><Printer size={17} aria-hidden="true" /> Print receipt</button>
        </div>
      </div>

      {location.state?.justCreated && (
        <div className="bill-ready-banner no-print">
          <CheckCircle2 size={19} aria-hidden="true" />
          <span><strong>Bill created successfully.</strong> It is ready to print or send to {order.customer?.name}.</span>
        </div>
      )}

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
                  <td>{item.weight_kg ? `${item.weight_kg} kg` : item.quantity}</td>
                  <td>₹{item.price_per_unit}{item.weight_kg ? '/kg' : ''}</td>
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

      {/* Thermal receipt, shown only while printing */}
      <div className="receipt">
        <div className="receipt__header">
          <h2>{settings.shop_name || 'Wash Nest'}</h2>
          {settings.shop_address && <p>{settings.shop_address}</p>}
          {settings.shop_phone && <p>Phone: {settings.shop_phone}</p>}
          {order.gst_amount > 0 && settings.gst_number && <p>GSTIN: {settings.gst_number}</p>}
        </div>

        <div className="receipt__meta">
          <div className="receipt__row"><span>Bill</span><strong>{order.order_number}</strong></div>
          <div className="receipt__row"><span>Date</span><span>{new Date(order.created_at).toLocaleString('en-IN')}</span></div>
          <div className="receipt__row"><span>Customer</span><span>{order.customer?.name}</span></div>
          <div className="receipt__row"><span>Mobile</span><span>{order.customer?.phone}</span></div>
          {order.expected_delivery_date && <div className="receipt__row"><span>Delivery</span><span>{order.expected_delivery_date}</span></div>}
        </div>

        <hr className="receipt__divider" />
        <div className="receipt__item receipt__item--heading"><span>Item</span><span>Amount</span></div>
        {order.items.map((item) => (
          <div className="receipt__item" key={item.id}>
            <span>
              <strong>{item.item_name}</strong>
              <small>{item.weight_kg ? `${item.weight_kg} kg × ${formatMoney(item.price_per_unit)}` : `${item.quantity} × ${formatMoney(item.price_per_unit)}`} · {SERVICE_LABELS[item.service_type] || item.service_type}</small>
              {item.notes && <small>Note: {item.notes}</small>}
            </span>
            <span>{formatMoney(item.subtotal)}</span>
          </div>
        ))}

        <hr className="receipt__divider" />
        <div className="receipt__row"><span>Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
        {order.express_charge > 0 && <div className="receipt__row"><span>Express</span><span>{formatMoney(order.express_charge)}</span></div>}
        {order.discount_amount > 0 && <div className="receipt__row"><span>Discount</span><span>-{formatMoney(order.discount_amount)}</span></div>}
        {order.delivery_charge > 0 && <div className="receipt__row"><span>Delivery</span><span>{formatMoney(order.delivery_charge)}</span></div>}
        {order.gst_amount > 0 && <div className="receipt__row"><span>GST ({order.gst_percent}%)</span><span>{formatMoney(order.gst_amount)}</span></div>}
        <div className="receipt__row receipt__total"><span>Total</span><span>{formatMoney(order.total_amount)}</span></div>
        <div className="receipt__row"><span>Paid</span><span>{formatMoney(order.amount_paid)}</span></div>
        <div className="receipt__row receipt__total"><span>Balance due</span><span>{formatMoney(order.amount_due)}</span></div>

        {order.notes && <><hr className="receipt__divider" /><p>Note: {order.notes}</p></>}
        <div className="receipt__footer">
          <p>Thank you for choosing {settings.shop_name || 'Wash Nest'}.</p>
          <p>Please keep this receipt for order collection.</p>
        </div>
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
