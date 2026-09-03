import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCustomer, updateCustomer, getCustomerOrders } from '../api';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getCustomer(id).then(c => { setCustomer(c); setForm(c); }).catch(console.error);
    getCustomerOrders(id).then(setOrders).catch(console.error);
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await updateCustomer(id, {
        name: form.name, phone: form.phone, alt_phone: form.alt_phone,
        address: form.address, landmark: form.landmark, floor_apt: form.floor_apt,
        area: form.area, pincode: form.pincode, delivery_notes: form.delivery_notes,
        customer_type: form.customer_type, credit_limit: Number(form.credit_limit),
      });
      setCustomer(updated);
      setEditing(false);
      toast.success('Customer updated');
    } catch (e) { toast.error(e.message); }
  };

  if (!customer) return <p>Loading…</p>;

  return (
    <>
      <div className="page-header">
        <h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div className="customer-avatar">{customer.name[0]}</div>
            {customer.name}
          </div>
        </h1>
        <div className="inline-actions">
          {!editing ? (
            <button className="btn btn--primary" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <>
              <button className="btn btn--ghost" onClick={() => { setEditing(false); setForm(customer); }}>Cancel</button>
              <button className="btn btn--success" onClick={handleSave}>Save</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__label">Total Orders</div><div className="stat-card__value">{customer.total_orders}</div></div>
        <div className="stat-card"><div className="stat-card__label">Total Spent</div><div className="stat-card__value">₹{customer.total_spent.toLocaleString('en-IN')}</div></div>
        <div className="stat-card"><div className="stat-card__label">Outstanding</div><div className="stat-card__value" style={{ color: customer.outstanding_balance > 0 ? '#dc2626' : '#059669' }}>₹{customer.outstanding_balance.toLocaleString('en-IN')}</div></div>
        <div className="stat-card"><div className="stat-card__label">Member Since</div><div className="stat-card__value" style={{ fontSize: '1rem' }}>{new Date(customer.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
      </div>

      {/* Details */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Details</h3>
        {editing ? (
          <>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input className="form-input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group"><label>Alt Phone</label><input className="form-input" value={form.alt_phone || ''} onChange={e => setForm(f => ({ ...f, alt_phone: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Address</label><input className="form-input" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="form-group"><label>Landmark</label><input className="form-input" value={form.landmark || ''} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} /></div>
              <div className="form-group"><label>Floor / Apt</label><input className="form-input" value={form.floor_apt || ''} onChange={e => setForm(f => ({ ...f, floor_apt: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Area</label><input className="form-input" value={form.area || ''} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} /></div>
              <div className="form-group"><label>Pincode</label><input className="form-input" value={form.pincode || ''} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} /></div>
              <div className="form-group"><label>Type</label>
                <select className="form-select" value={form.customer_type || 'regular'} onChange={e => setForm(f => ({ ...f, customer_type: e.target.value }))}>
                  <option value="regular">Regular</option><option value="walkin">Walk-in</option><option value="corporate">Corporate</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Delivery Notes</label><input className="form-input" value={form.delivery_notes || ''} onChange={e => setForm(f => ({ ...f, delivery_notes: e.target.value }))} /></div>
              <div className="form-group"><label>Credit Limit (₹)</label><input className="form-input" type="number" value={form.credit_limit || 0} onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))} /></div>
            </div>
          </>
        ) : (
          <div className="detail-grid">
            <div className="detail-section">
              <h3>Contact</h3>
              <div className="detail-row"><span className="detail-row__label">Phone</span><span className="detail-row__value">{customer.phone}</span></div>
              {customer.alt_phone && <div className="detail-row"><span className="detail-row__label">Alt Phone</span><span className="detail-row__value">{customer.alt_phone}</span></div>}
              <div className="detail-row"><span className="detail-row__label">Type</span><span className="detail-row__value">{customer.customer_type}</span></div>
            </div>
            <div className="detail-section">
              <h3>Address</h3>
              <div className="detail-row"><span className="detail-row__label">Address</span><span className="detail-row__value">{customer.address || '—'}</span></div>
              {customer.landmark && <div className="detail-row"><span className="detail-row__label">Landmark</span><span className="detail-row__value">{customer.landmark}</span></div>}
              {customer.floor_apt && <div className="detail-row"><span className="detail-row__label">Floor/Apt</span><span className="detail-row__value">{customer.floor_apt}</span></div>}
              <div className="detail-row"><span className="detail-row__label">Area</span><span className="detail-row__value">{customer.area || '—'}</span></div>
              {customer.pincode && <div className="detail-row"><span className="detail-row__label">Pincode</span><span className="detail-row__value">{customer.pincode}</span></div>}
            </div>
            <div className="detail-section">
              <h3>Preferences</h3>
              {customer.delivery_notes && <div className="detail-row"><span className="detail-row__label">Delivery Notes</span><span className="detail-row__value">{customer.delivery_notes}</span></div>}
              <div className="detail-row"><span className="detail-row__label">Credit Limit</span><span className="detail-row__value">₹{customer.credit_limit}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Order History ({orders.length})</h3>
        {orders.length === 0 ? (
          <p className="empty">No orders yet</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order #</th><th>Status</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><Link to={`/orders/${o.id}`}>{o.order_number}</Link></td>
                    <td><span className={`badge badge--${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                    <td>₹{o.total_amount.toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge--${o.payment_status}`}>{o.payment_status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
