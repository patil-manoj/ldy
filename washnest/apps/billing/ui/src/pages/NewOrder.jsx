import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lookupCustomer, createCustomer, getPriceList, createOrder, getRoundedWeight } from '../api';

const SERVICES = ['wash_fold', 'iron', 'wash_iron', 'dry_clean'];
const SERVICE_LABELS = { wash_fold: 'Wash & Fold', iron: 'Ironing', wash_iron: 'Wash & Iron', dry_clean: 'Dry Clean' };

export default function NewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [prices, setPrices] = useState([]);
  const [selectedService, setSelectedService] = useState('wash_fold');
  const [submitting, setSubmitting] = useState(false);

  // Customer
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '', landmark: '', floor_apt: '', area: '', pincode: '', alt_phone: '', delivery_notes: '' });

  // Order
  const [items, setItems] = useState([]);
  const [orderOpts, setOrderOpts] = useState({
    source: 'walkin', is_express: false, is_doorstep: false,
    pickup_date: '', expected_delivery_date: '', pickup_slot: '', delivery_slot: '',
    discount_percent: 0, delivery_charge: 0, notes: '', staff_notes: '',
  });

  // Weight
  const [rawWeight, setRawWeight] = useState('');
  const [roundedWeight, setRoundedWeight] = useState(null);

  useEffect(() => { getPriceList().then(setPrices).catch(console.error); }, []);

  // Weight rounding — call backend
  const handleWeightChange = useCallback(async (val) => {
    setRawWeight(val);
    const kg = parseFloat(val);
    if (!kg || kg <= 0) { setRoundedWeight(null); return; }
    try {
      const res = await getRoundedWeight(kg);
      setRoundedWeight(res.rounded);
    } catch { setRoundedWeight(null); }
  }, []);

  // Lookup customer
  const handleLookup = async () => {
    if (phone.length < 10) return toast.error('Enter a valid 10-digit phone number');
    try {
      const c = await lookupCustomer(phone);
      if (c) {
        setCustomer(c);
        setIsNewCustomer(false);
        toast.success(`Found: ${c.name}`);
      } else {
        setIsNewCustomer(true);
        setCustForm(f => ({ ...f, phone }));
        toast('New customer — fill details below', { icon: '✏️' });
      }
    } catch { setIsNewCustomer(true); setCustForm(f => ({ ...f, phone })); }
  };

  const handleCreateCustomer = async () => {
    if (!custForm.name.trim()) return toast.error('Name is required');
    try {
      const c = await createCustomer(custForm);
      setCustomer(c);
      setIsNewCustomer(false);
      toast.success('Customer created!');
    } catch (e) { toast.error(e.message); }
  };

  // Items
  const filteredPrices = prices.filter(p => p.service_type === selectedService && p.active);

  const addItem = (priceItem) => {
    if (priceItem.is_per_kg) {
      // For per-kg items, use rounded weight
      const wt = roundedWeight || 1;
      const existing = items.find(i => i.item_name === priceItem.item_name && i.service_type === priceItem.service_type);
      if (existing) {
        setItems(items.map(i =>
          i === existing ? { ...i, weight_kg: wt, subtotal: wt * i.price_per_unit } : i
        ));
      } else {
        setItems([...items, {
          service_type: priceItem.service_type,
          item_name: priceItem.item_name,
          category: priceItem.category,
          quantity: 1,
          weight_kg: wt,
          price_per_unit: priceItem.price_per_kg || priceItem.price,
          subtotal: wt * (priceItem.price_per_kg || priceItem.price),
          notes: '',
        }]);
      }
      toast.success(`${priceItem.item_name} — ${wt} kg`);
    } else {
      const existing = items.find(i => i.item_name === priceItem.item_name && i.service_type === priceItem.service_type && !i.weight_kg);
      if (existing) {
        setItems(items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price_per_unit } : i
        ));
      } else {
        setItems([...items, {
          service_type: priceItem.service_type,
          item_name: priceItem.item_name,
          category: priceItem.category,
          quantity: 1,
          weight_kg: null,
          price_per_unit: priceItem.price,
          subtotal: priceItem.price,
          notes: '',
        }]);
      }
    }
  };

  const updateItemQty = (idx, qty) => {
    if (qty < 1) return removeItem(idx);
    setItems(items.map((item, i) => {
      if (i !== idx) return item;
      if (item.weight_kg) {
        return { ...item, weight_kg: qty, subtotal: qty * item.price_per_unit };
      }
      return { ...item, quantity: qty, subtotal: qty * item.price_per_unit };
    }));
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItemNotes = (idx, notes) => {
    setItems(items.map((item, i) => i === idx ? { ...item, notes } : item));
  };

  // Totals
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const expressCharge = orderOpts.is_express ? Math.round(subtotal * 0.5) : 0;
  const discountAmt = Number(orderOpts.discount_percent) > 0 ? Math.round(subtotal * Number(orderOpts.discount_percent) / 100) : 0;
  const deliveryChg = Number(orderOpts.delivery_charge) || 0;
  const total = subtotal + expressCharge + deliveryChg - discountAmt;

  // Submit
  const handleSubmit = async () => {
    if (!customer) return toast.error('Select a customer first');
    if (items.length === 0) return toast.error('Add at least one item');
    setSubmitting(true);
    try {
      const payload = {
        customer_id: customer.id,
        source: orderOpts.source,
        is_express: orderOpts.is_express,
        is_doorstep: orderOpts.is_doorstep,
        pickup_date: orderOpts.pickup_date || null,
        expected_delivery_date: orderOpts.expected_delivery_date || null,
        pickup_slot: orderOpts.pickup_slot || null,
        delivery_slot: orderOpts.delivery_slot || null,
        discount_percent: Number(orderOpts.discount_percent) || 0,
        delivery_charge: Number(orderOpts.delivery_charge) || 0,
        notes: orderOpts.notes || null,
        staff_notes: orderOpts.staff_notes || null,
        weight_kg: roundedWeight || null,
        items,
      };
      const order = await createOrder(payload);
      toast.success(`Order ${order.order_number} created!`);
      navigate(`/orders/${order.id}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canGoStep2 = !!customer;
  const canGoStep3 = items.length > 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>New Order</h1>
          {customer && <span className="page-header__sub">for {customer.name} ({customer.phone})</span>}
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="wizard-steps">
        <button className={`wizard-step ${step === 1 ? 'wizard-step--active' : step > 1 ? 'wizard-step--done' : ''}`} onClick={() => setStep(1)}>
          <span className="wizard-step__num">{step > 1 ? '✓' : '1'}</span> Customer
        </button>
        <button className={`wizard-step ${step === 2 ? 'wizard-step--active' : step > 2 ? 'wizard-step--done' : ''}`}
          onClick={() => canGoStep2 && setStep(2)} disabled={!canGoStep2}>
          <span className="wizard-step__num">{step > 2 ? '✓' : '2'}</span> Items & Options
        </button>
        <button className={`wizard-step ${step === 3 ? 'wizard-step--active' : ''}`}
          onClick={() => canGoStep3 && setStep(3)} disabled={!canGoStep3}>
          <span className="wizard-step__num">3</span> Review & Submit
        </button>
      </div>

      {/* STEP 1: Customer */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Find or Create Customer</h3>
          <div style={{ display: 'flex', gap: '.75rem', maxWidth: 480 }}>
            <input
              className="form-input form-input--lg"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              autoFocus
              style={{ flex: 1 }}
            />
            <button className="btn btn--primary btn--lg" onClick={handleLookup} disabled={phone.length < 10}>
              Search
            </button>
          </div>

          {customer && (
            <div className="customer-card" style={{ marginTop: '1.25rem', cursor: 'default', borderColor: 'var(--success)', background: 'var(--success-bg)' }}>
              <div className="customer-avatar">{customer.name[0]}</div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1.05rem' }}>{customer.name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '.5rem' }}>{customer.phone}</span>
                {customer.area && <span style={{ color: 'var(--text-muted)' }}> • {customer.area}</span>}
                <div style={{ color: 'var(--text-secondary)', fontSize: '.85rem', marginTop: '.15rem' }}>
                  {customer.total_orders} orders • ₹{(customer.total_spent || 0).toLocaleString('en-IN')} spent
                </div>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => { setCustomer(null); setPhone(''); setIsNewCustomer(false); }}>Change</button>
            </div>
          )}

          {isNewCustomer && !customer && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>New Customer Details</h4>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input className="form-input" value={custForm.name} onChange={e => setCustForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
                <div className="form-group"><label>Phone</label><input className="form-input" value={custForm.phone} readOnly style={{ opacity: .7 }} /></div>
                <div className="form-group"><label>Alt Phone</label><input className="form-input" value={custForm.alt_phone} onChange={e => setCustForm(f => ({ ...f, alt_phone: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Address</label><input className="form-input" value={custForm.address} onChange={e => setCustForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="form-group"><label>Landmark</label><input className="form-input" value={custForm.landmark} onChange={e => setCustForm(f => ({ ...f, landmark: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Floor / Apt</label><input className="form-input" value={custForm.floor_apt} onChange={e => setCustForm(f => ({ ...f, floor_apt: e.target.value }))} /></div>
                <div className="form-group"><label>Area</label><input className="form-input" value={custForm.area} onChange={e => setCustForm(f => ({ ...f, area: e.target.value }))} /></div>
                <div className="form-group"><label>Pincode</label><input className="form-input" value={custForm.pincode} onChange={e => setCustForm(f => ({ ...f, pincode: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>Delivery Notes</label><input className="form-input" placeholder="Ring bell twice, give to watchman…" value={custForm.delivery_notes} onChange={e => setCustForm(f => ({ ...f, delivery_notes: e.target.value }))} /></div>
              <button className="btn btn--primary" onClick={handleCreateCustomer}>Create Customer</button>
            </div>
          )}

          {customer && (
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn--primary btn--lg" onClick={() => setStep(2)}>Next → Add Items</button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Items */}
      {step === 2 && (
        <>
          {/* Order Options */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Order Options</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <select className="form-select" value={orderOpts.source} onChange={e => setOrderOpts(o => ({ ...o, source: e.target.value }))}>
                  <option value="walkin">Walk-in</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pickup Date</label>
                <input type="date" className="form-input" value={orderOpts.pickup_date} onChange={e => setOrderOpts(o => ({ ...o, pickup_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Expected Delivery</label>
                <input type="date" className="form-input" value={orderOpts.expected_delivery_date} onChange={e => setOrderOpts(o => ({ ...o, expected_delivery_date: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
              <label className="form-check">
                <input type="checkbox" checked={orderOpts.is_express} onChange={e => setOrderOpts(o => ({ ...o, is_express: e.target.checked }))} />
                ⚡ Express Order (1.5x surcharge)
              </label>
              <label className="form-check">
                <input type="checkbox" checked={orderOpts.is_doorstep} onChange={e => setOrderOpts(o => ({ ...o, is_doorstep: e.target.checked }))} />
                🏠 Doorstep Pickup/Delivery
              </label>
            </div>
            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Discount %</label>
                <input type="number" className="form-input" min="0" max="100" value={orderOpts.discount_percent} onChange={e => setOrderOpts(o => ({ ...o, discount_percent: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Delivery Charge ₹</label>
                <input type="number" className="form-input" min="0" value={orderOpts.delivery_charge} onChange={e => setOrderOpts(o => ({ ...o, delivery_charge: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Weight Input */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Machine Weight (for per-kg items)</h3>
            <div className="weight-input">
              <div>
                <div className="weight-input__label">Raw Weight (from machine)</div>
                <input
                  className="weight-input__field"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={rawWeight}
                  onChange={e => handleWeightChange(e.target.value)}
                />
              </div>
              <div className="weight-input__arrow">→</div>
              <div>
                <div className="weight-input__label">Billed Weight</div>
                <div className="weight-input__rounded">
                  {roundedWeight != null ? `${roundedWeight} kg` : '—'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '.75rem' }}>
              Weight is rounded to nearest 0.5 kg. Up to 100g over a boundary is rounded down (grace).
            </p>
          </div>

          {/* Item Selection */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add Items</h3>
            <div className="tabs">
              {SERVICES.map(s => (
                <button key={s} className={`tab ${selectedService === s ? 'tab--active' : ''}`} onClick={() => setSelectedService(s)}>
                  {SERVICE_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="item-grid">
              {filteredPrices.map(p => (
                <button key={p.id} className="item-btn" onClick={() => addItem(p)}>
                  <span className="item-btn__name">{p.item_name}</span>
                  <span className="item-btn__price">
                    {p.is_per_kg ? `₹${p.price_per_kg}/kg` : `₹${p.price}`}
                  </span>
                  {p.is_per_kg && <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>per kg</span>}
                </button>
              ))}
              {filteredPrices.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', padding: '1rem' }}>No items in this category</p>}
            </div>
          </div>

          {/* Selected Items */}
          {items.length > 0 && (
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Cart ({items.length} items)</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Item</th><th>Service</th><th style={{ textAlign: 'center' }}>Qty / Wt</th><th>Rate</th><th style={{ textAlign: 'right' }}>Subtotal</th><th>Notes</th><th></th></tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.item_name}</strong></td>
                        <td><span className="badge badge--walkin">{SERVICE_LABELS[item.service_type]}</span></td>
                        <td>
                          {item.weight_kg ? (
                            <span style={{ fontWeight: 700 }}>{item.weight_kg} kg</span>
                          ) : (
                            <div className="qty-stepper">
                              <button className="qty-stepper__btn" onClick={() => updateItemQty(idx, item.quantity - 1)}>−</button>
                              <span className="qty-stepper__value">{item.quantity}</span>
                              <button className="qty-stepper__btn" onClick={() => updateItemQty(idx, item.quantity + 1)}>+</button>
                            </div>
                          )}
                        </td>
                        <td>₹{item.price_per_unit}{item.weight_kg ? '/kg' : ''}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{item.subtotal}</td>
                        <td>
                          <input className="form-input" placeholder="Stain, tear…" value={item.notes || ''}
                            onChange={e => updateItemNotes(idx, e.target.value)} style={{ minWidth: 100, padding: '.3rem .5rem', fontSize: '.8rem' }} />
                        </td>
                        <td>
                          <button className="btn btn--danger btn--sm btn--icon" onClick={() => removeItem(idx)} title="Remove">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="breakdown" style={{ marginTop: '1rem' }}>
                <div className="breakdown__row"><span className="breakdown__label">Subtotal</span><span className="breakdown__value">₹{subtotal.toLocaleString('en-IN')}</span></div>
                {expressCharge > 0 && <div className="breakdown__row"><span className="breakdown__label">Express (1.5x)</span><span className="breakdown__value">₹{expressCharge.toLocaleString('en-IN')}</span></div>}
                {discountAmt > 0 && <div className="breakdown__row"><span className="breakdown__label">Discount ({orderOpts.discount_percent}%)</span><span className="breakdown__value" style={{ color: 'var(--success)' }}>−₹{discountAmt.toLocaleString('en-IN')}</span></div>}
                {deliveryChg > 0 && <div className="breakdown__row"><span className="breakdown__label">Delivery</span><span className="breakdown__value">₹{deliveryChg}</span></div>}
                <div className="breakdown__row breakdown__total"><span className="breakdown__label">Total</span><span className="breakdown__value">₹{total.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="form-row">
              <div className="form-group"><label>Notes (customer-facing)</label><input className="form-input" value={orderOpts.notes} onChange={e => setOrderOpts(o => ({ ...o, notes: e.target.value }))} placeholder="Special instructions…" /></div>
              <div className="form-group"><label>Staff Notes (internal)</label><input className="form-input" value={orderOpts.staff_notes} onChange={e => setOrderOpts(o => ({ ...o, staff_notes: e.target.value }))} placeholder="Internal notes…" /></div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
            <button className="btn btn--ghost btn--lg" onClick={() => setStep(1)}>← Customer</button>
            <button className="btn btn--primary btn--lg" onClick={() => canGoStep3 ? setStep(3) : toast.error('Add items first')} disabled={!canGoStep3}>
              Review & Submit →
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Review */}
      {step === 3 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>

          <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="detail-section">
              <h3>Customer</h3>
              <div className="detail-row"><span className="detail-row__label">Name</span><span className="detail-row__value">{customer.name}</span></div>
              <div className="detail-row"><span className="detail-row__label">Phone</span><span className="detail-row__value">{customer.phone}</span></div>
              {customer.area && <div className="detail-row"><span className="detail-row__label">Area</span><span className="detail-row__value">{customer.area}</span></div>}
            </div>
            <div className="detail-section">
              <h3>Order Details</h3>
              <div className="detail-row"><span className="detail-row__label">Source</span><span className={`badge badge--${orderOpts.source}`}>{orderOpts.source}</span></div>
              {orderOpts.is_express && <div className="detail-row"><span className="detail-row__label">Type</span><span className="badge badge--express">EXPRESS ⚡</span></div>}
              {orderOpts.pickup_date && <div className="detail-row"><span className="detail-row__label">Pickup</span><span className="detail-row__value">{orderOpts.pickup_date}</span></div>}
              {orderOpts.expected_delivery_date && <div className="detail-row"><span className="detail-row__label">Delivery</span><span className="detail-row__value">{orderOpts.expected_delivery_date}</span></div>}
              {roundedWeight && <div className="detail-row"><span className="detail-row__label">Total Weight</span><span className="detail-row__value">{roundedWeight} kg</span></div>}
            </div>
          </div>

          <h3 style={{ marginBottom: '.75rem', fontSize: '.9rem', color: 'var(--text-secondary)' }}>ITEMS ({items.length})</h3>
          <div className="table-wrap" style={{ marginBottom: '1.25rem' }}>
            <table>
              <thead><tr><th>Item</th><th>Service</th><th>Qty/Wt</th><th>Rate</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.item_name}</strong>{item.notes && <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{item.notes}</div>}</td>
                    <td>{SERVICE_LABELS[item.service_type]}</td>
                    <td>{item.weight_kg ? `${item.weight_kg} kg` : item.quantity}</td>
                    <td>₹{item.price_per_unit}{item.weight_kg ? '/kg' : ''}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{item.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="breakdown">
            <div className="breakdown__row"><span className="breakdown__label">Subtotal</span><span className="breakdown__value">₹{subtotal.toLocaleString('en-IN')}</span></div>
            {expressCharge > 0 && <div className="breakdown__row"><span className="breakdown__label">Express Charge</span><span className="breakdown__value">₹{expressCharge.toLocaleString('en-IN')}</span></div>}
            {discountAmt > 0 && <div className="breakdown__row"><span className="breakdown__label">Discount ({orderOpts.discount_percent}%)</span><span className="breakdown__value" style={{ color: 'var(--success)' }}>−₹{discountAmt.toLocaleString('en-IN')}</span></div>}
            {deliveryChg > 0 && <div className="breakdown__row"><span className="breakdown__label">Delivery</span><span className="breakdown__value">₹{deliveryChg}</span></div>}
            <div className="breakdown__row breakdown__total"><span className="breakdown__label">Total</span><span className="breakdown__value">₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
            <button className="btn btn--ghost btn--lg" onClick={() => setStep(2)}>← Edit Items</button>
            <button className="btn btn--success btn--lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating…' : '✓ Create Order & Generate Bill'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
