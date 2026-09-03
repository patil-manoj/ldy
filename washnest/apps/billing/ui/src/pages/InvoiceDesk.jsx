import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Check,
  ChevronDown,
  IndianRupee,
  Minus,
  PackageOpen,
  Plus,
  ReceiptText,
  Scale,
  Search,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react';
import {
  createCustomer,
  createOrder,
  getPriceList,
  getRoundedWeight,
  getSettings,
  lookupCustomer,
  recordPayment,
} from '../api';
import { formatMoney, roundCurrency, SERVICES, SERVICE_LABELS, settingsToObject } from '../lib/billing';

const INITIAL_CUSTOMER = {
  name: '',
  phone: '',
  address: '',
  area: '',
};

const INITIAL_OPTIONS = {
  source: 'walkin',
  is_express: false,
  is_doorstep: false,
  pickup_date: '',
  expected_delivery_date: '',
  discount_percent: 0,
  delivery_charge: 0,
  notes: '',
  staff_notes: '',
};

export default function InvoiceDesk() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedService, setSelectedService] = useState('wash_fold');
  const [itemSearch, setItemSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(INITIAL_CUSTOMER);

  const [items, setItems] = useState([]);
  const [orderOptions, setOrderOptions] = useState(INITIAL_OPTIONS);
  const [rawWeight, setRawWeight] = useState('');
  const [roundedWeight, setRoundedWeight] = useState(null);
  const [payment, setPayment] = useState({ amount: '', mode: 'cash' });

  useEffect(() => {
    Promise.all([getPriceList(), getSettings()])
      .then(([priceList, settingList]) => {
        setPrices(priceList);
        setSettings(settingsToObject(settingList));
      })
      .catch(() => toast.error('Could not load billing data'));
  }, []);

  const handleWeightChange = useCallback(async (value) => {
    setRawWeight(value);
    const weight = Number(value);
    if (!weight || weight <= 0) {
      setRoundedWeight(null);
      return;
    }

    try {
      const result = await getRoundedWeight(weight);
      setRoundedWeight(result.rounded);
      setItems((currentItems) => currentItems.map((item) => (
        item.weight_kg != null
          ? { ...item, weight_kg: result.rounded, subtotal: result.rounded * item.price_per_unit }
          : item
      )));
    } catch {
      setRoundedWeight(null);
    }
  }, []);

  const handleLookup = async () => {
    if (phone.length !== 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }

    try {
      const foundCustomer = await lookupCustomer(phone);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setIsNewCustomer(false);
        toast.success(`${foundCustomer.name} selected`);
        return;
      }
    } catch {
      // A missing customer starts the inline creation flow.
    }

    setCustomer(null);
    setIsNewCustomer(true);
    setCustomerForm({ ...INITIAL_CUSTOMER, phone });
  };

  const handleCreateCustomer = async () => {
    if (!customerForm.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    try {
      const createdCustomer = await createCustomer(customerForm);
      setCustomer(createdCustomer);
      setIsNewCustomer(false);
      toast.success('Customer created and selected');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredPrices = prices.filter((price) => (
    price.service_type === selectedService
    && price.active
    && price.item_name.toLowerCase().includes(itemSearch.trim().toLowerCase())
  ));
  const serviceUsesWeight = prices.some((price) => price.service_type === selectedService && price.active && price.is_per_kg);

  const addItem = (priceItem) => {
    if (priceItem.is_per_kg && roundedWeight == null) {
      toast.error('Enter the machine weight before adding this service');
      return;
    }

    const unitPrice = priceItem.is_per_kg ? (priceItem.price_per_kg || priceItem.price) : priceItem.price;
    const existingIndex = items.findIndex((item) => (
      item.item_name === priceItem.item_name
      && item.service_type === priceItem.service_type
      && Boolean(item.weight_kg) === Boolean(priceItem.is_per_kg)
    ));

    if (existingIndex >= 0) {
      setItems(items.map((item, index) => {
        if (index !== existingIndex) return item;
        if (priceItem.is_per_kg) {
          return { ...item, weight_kg: roundedWeight, subtotal: roundedWeight * unitPrice };
        }
        const quantity = item.quantity + 1;
        return { ...item, quantity, subtotal: quantity * unitPrice };
      }));
      return;
    }

    setItems([...items, {
      service_type: priceItem.service_type,
      item_name: priceItem.item_name,
      category: priceItem.category,
      quantity: 1,
      weight_kg: priceItem.is_per_kg ? roundedWeight : null,
      price_per_unit: unitPrice,
      subtotal: priceItem.is_per_kg ? roundedWeight * unitPrice : unitPrice,
      notes: '',
    }]);
  };

  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) {
      setItems(items.filter((_, itemIndex) => itemIndex !== index));
      return;
    }
    setItems(items.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, quantity, subtotal: quantity * item.price_per_unit }
        : item
    )));
  };

  const updateItemNotes = (index, notes) => {
    setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, notes } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const expressMultiplier = Number(settings.express_multiplier || 1.5);
  const expressCharge = orderOptions.is_express ? roundCurrency(subtotal * (expressMultiplier - 1)) : 0;
  const discountAmount = roundCurrency(subtotal * (Number(orderOptions.discount_percent) || 0) / 100);
  const deliveryCharge = Number(orderOptions.delivery_charge) || 0;
  const taxableAmount = Math.max(0, subtotal + expressCharge + deliveryCharge - discountAmount);
  const gstEnabled = settings.gst_enabled === 'true';
  const gstRate = gstEnabled ? Number(settings.gst_rate || 0) : 0;
  const gstAmount = roundCurrency(taxableAmount * gstRate / 100);
  const total = roundCurrency(taxableAmount + gstAmount);
  const amountPaid = Number(payment.amount) || 0;
  const amountDue = Math.max(0, total - amountPaid);

  const handleDoorstepChange = (checked) => {
    setOrderOptions((options) => ({
      ...options,
      is_doorstep: checked,
      delivery_charge: checked ? Number(settings.default_delivery_charge || options.delivery_charge || 0) : 0,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!customer) {
      toast.error('Select or create a customer first');
      return;
    }
    if (items.length === 0) {
      toast.error('Add at least one service to the bill');
      return;
    }
    if (amountPaid < 0 || amountPaid > total) {
      toast.error('Collected amount cannot exceed the bill total');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_id: customer.id,
        source: orderOptions.source,
        is_express: orderOptions.is_express,
        is_doorstep: orderOptions.is_doorstep,
        pickup_date: orderOptions.pickup_date || null,
        expected_delivery_date: orderOptions.expected_delivery_date || null,
        discount_percent: Number(orderOptions.discount_percent) || 0,
        delivery_charge: deliveryCharge,
        notes: orderOptions.notes || null,
        staff_notes: orderOptions.staff_notes || null,
        weight_kg: roundedWeight,
        items,
      });

      if (amountPaid > 0) {
        try {
          await recordPayment(order.id, {
            amount: amountPaid,
            mode: payment.mode,
          });
        } catch (error) {
          toast.error(`Bill created, but payment was not recorded: ${error.message}`);
        }
      }

      toast.success(`${order.order_number} created`);
      navigate(`/orders/${order.id}`, { state: { justCreated: true } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="invoice-page">
      <header className="invoice-page__header">
        <div>
          <p className="eyebrow"><ReceiptText size={14} aria-hidden="true" /> Quick billing</p>
          <h1>Create a bill</h1>
          <p>Customer, services and payment in one place.</p>
        </div>
        <div className="invoice-date" aria-label="Today's date">
          <CalendarDays size={18} aria-hidden="true" />
          <span>{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}</span>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="invoice-layout">
          <div className="billing-flow">
            <section className="billing-section" aria-labelledby="customer-heading">
              <div className="section-heading">
                <span className="section-heading__icon"><UserRound size={19} aria-hidden="true" /></span>
                <div><h2 id="customer-heading">Customer</h2><p>Find them by mobile number.</p></div>
                {customer && <span className="section-status"><Check size={14} aria-hidden="true" /> Selected</span>}
              </div>

              {!customer && (
                <div className="customer-search">
                  <label className="sr-only" htmlFor="customer-phone">Customer mobile number</label>
                  <div className="input-with-icon">
                    <UserRound size={18} aria-hidden="true" />
                    <input
                      id="customer-phone"
                      className="form-input form-input--lg"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), handleLookup())}
                      autoFocus
                    />
                  </div>
                  <button className="btn btn--primary btn--lg" type="button" onClick={handleLookup} disabled={phone.length !== 10}>
                    <Search size={18} aria-hidden="true" /> Find customer
                  </button>
                </div>
              )}

              {customer && (
                <div className="selected-customer">
                  <span className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.phone}{customer.area ? ` · ${customer.area}` : ''}</span>
                  </div>
                  <button className="btn btn--ghost btn--sm" type="button" onClick={() => { setCustomer(null); setPhone(''); setIsNewCustomer(false); }}>Change</button>
                </div>
              )}

              {isNewCustomer && !customer && (
                <div className="new-customer-form">
                  <div className="new-customer-form__intro">
                    <strong>New customer</strong>
                    <span>No customer found for {phone}.</span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="new-customer-name">Name <span aria-hidden="true">*</span></label>
                      <input id="new-customer-name" className="form-input" value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} autoFocus />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-customer-area">Area</label>
                      <input id="new-customer-area" className="form-input" value={customerForm.area} onChange={(event) => setCustomerForm((form) => ({ ...form, area: event.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-customer-address">Pickup address</label>
                    <input id="new-customer-address" className="form-input" value={customerForm.address} onChange={(event) => setCustomerForm((form) => ({ ...form, address: event.target.value }))} />
                  </div>
                  <button className="btn btn--primary" type="button" onClick={handleCreateCustomer}>
                    <Plus size={17} aria-hidden="true" /> Add customer
                  </button>
                </div>
              )}
            </section>

            <section className="billing-section" aria-labelledby="services-heading">
              <div className="section-heading">
                <span className="section-heading__icon"><Sparkles size={19} aria-hidden="true" /></span>
                <div><h2 id="services-heading">Services</h2><p>Tap an item to add it to the bill.</p></div>
                {items.length > 0 && <span className="section-count">{items.length} {items.length === 1 ? 'line' : 'lines'}</span>}
              </div>

              <div className="service-tabs" role="tablist" aria-label="Laundry service">
                {SERVICES.map((service) => (
                  <button
                    key={service}
                    className={`service-tab${selectedService === service ? ' service-tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={selectedService === service}
                    onClick={() => setSelectedService(service)}
                  >
                    {SERVICE_LABELS[service]}
                  </button>
                ))}
              </div>

              <div className="service-tools">
                <label className="input-with-icon" htmlFor="item-search">
                  <Search size={17} aria-hidden="true" />
                  <input id="item-search" className="form-input" placeholder="Search items" value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} />
                </label>
                {serviceUsesWeight && (
                  <div className="weight-control">
                    <Scale size={18} aria-hidden="true" />
                    <label htmlFor="machine-weight">Machine weight</label>
                    <input id="machine-weight" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={rawWeight} onChange={(event) => handleWeightChange(event.target.value)} />
                    <span>{roundedWeight != null ? `${roundedWeight} kg billed` : 'kg'}</span>
                  </div>
                )}
              </div>

              <div className="service-grid">
                {filteredPrices.map((price) => (
                  <button className="service-item" type="button" key={price.id} onClick={() => addItem(price)}>
                    <span className="service-item__add"><Plus size={16} aria-hidden="true" /></span>
                    <span className="service-item__name">{price.item_name}</span>
                    <span className="service-item__price">{formatMoney(price.is_per_kg ? price.price_per_kg : price.price)}{price.is_per_kg ? '/kg' : ''}</span>
                  </button>
                ))}
                {filteredPrices.length === 0 && (
                  <div className="service-empty"><PackageOpen size={24} aria-hidden="true" /><span>No matching items</span></div>
                )}
              </div>
            </section>

            <details className="billing-section order-options">
              <summary>
                <span className="section-heading__icon"><Truck size={19} aria-hidden="true" /></span>
                <span><strong>Pickup, delivery & adjustments</strong><small>Optional order details</small></span>
                <ChevronDown className="order-options__chevron" size={19} aria-hidden="true" />
              </summary>
              <div className="order-options__body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="order-source">Order source</label>
                    <select id="order-source" className="form-select" value={orderOptions.source} onChange={(event) => setOrderOptions((options) => ({ ...options, source: event.target.value }))}>
                      <option value="walkin">Walk-in</option>
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pickup-date">Pickup date</label>
                    <input id="pickup-date" type="date" className="form-input" value={orderOptions.pickup_date} onChange={(event) => setOrderOptions((options) => ({ ...options, pickup_date: event.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="delivery-date">Expected delivery</label>
                    <input id="delivery-date" type="date" className="form-input" value={orderOptions.expected_delivery_date} onChange={(event) => setOrderOptions((options) => ({ ...options, expected_delivery_date: event.target.value }))} />
                  </div>
                </div>

                <div className="option-toggles">
                  <label className="toggle-row">
                    <input type="checkbox" checked={orderOptions.is_express} onChange={(event) => setOrderOptions((options) => ({ ...options, is_express: event.target.checked }))} />
                    <span className="toggle"><span /></span>
                    <Zap size={17} aria-hidden="true" />
                    <span><strong>Express service</strong><small>{expressMultiplier}× pricing</small></span>
                  </label>
                  <label className="toggle-row">
                    <input type="checkbox" checked={orderOptions.is_doorstep} onChange={(event) => handleDoorstepChange(event.target.checked)} />
                    <span className="toggle"><span /></span>
                    <Truck size={17} aria-hidden="true" />
                    <span><strong>Doorstep service</strong><small>Pickup and delivery</small></span>
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="discount-percent">Discount (%)</label>
                    <input id="discount-percent" type="number" className="form-input" min="0" max="100" value={orderOptions.discount_percent} onChange={(event) => setOrderOptions((options) => ({ ...options, discount_percent: event.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="delivery-charge">Delivery charge (₹)</label>
                    <input id="delivery-charge" type="number" className="form-input" min="0" value={orderOptions.delivery_charge} onChange={(event) => setOrderOptions((options) => ({ ...options, delivery_charge: event.target.value }))} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer-notes">Customer note</label>
                    <input id="customer-notes" className="form-input" placeholder="Care or delivery instructions" value={orderOptions.notes} onChange={(event) => setOrderOptions((options) => ({ ...options, notes: event.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="staff-notes">Staff note</label>
                    <input id="staff-notes" className="form-input" placeholder="Visible only to staff" value={orderOptions.staff_notes} onChange={(event) => setOrderOptions((options) => ({ ...options, staff_notes: event.target.value }))} />
                  </div>
                </div>
              </div>
            </details>
          </div>

          <aside className="bill-preview" aria-labelledby="bill-preview-heading">
            <div className="bill-preview__brand">
              <span className="brand__mark"><img src="/favicon.png" alt="" /></span>
              <div><strong>{settings.shop_name || 'Wash Nest'}</strong><span>Fresh care, neatly billed.</span></div>
              <span className="draft-badge">Draft</span>
            </div>

            <div className="bill-preview__customer">
              <span>Bill to</span>
              <strong>{customer?.name || 'Select a customer'}</strong>
              {customer && <small>{customer.phone}</small>}
            </div>

            <div className="bill-lines">
              <div className="bill-lines__heading"><h2 id="bill-preview-heading">Bill items</h2><span>{items.length}</span></div>
              {items.length === 0 ? (
                <div className="bill-empty">
                  <ReceiptText size={28} aria-hidden="true" />
                  <strong>Your bill is empty</strong>
                  <span>Add a laundry service to begin.</span>
                </div>
              ) : items.map((item, index) => (
                <div className="bill-line" key={`${item.service_type}-${item.item_name}`}>
                  <div className="bill-line__top">
                    <div><strong>{item.item_name}</strong><span>{SERVICE_LABELS[item.service_type]} · {formatMoney(item.price_per_unit)}{item.weight_kg ? '/kg' : ''}</span></div>
                    <strong>{formatMoney(item.subtotal)}</strong>
                  </div>
                  <div className="bill-line__controls">
                    {item.weight_kg ? (
                      <span className="weight-pill"><Scale size={14} aria-hidden="true" /> {item.weight_kg} kg</span>
                    ) : (
                      <div className="qty-stepper" aria-label={`Quantity for ${item.item_name}`}>
                        <button className="qty-stepper__btn" type="button" onClick={() => updateItemQuantity(index, item.quantity - 1)} aria-label={`Remove one ${item.item_name}`}><Minus size={14} aria-hidden="true" /></button>
                        <span className="qty-stepper__value">{item.quantity}</span>
                        <button className="qty-stepper__btn" type="button" onClick={() => updateItemQuantity(index, item.quantity + 1)} aria-label={`Add one ${item.item_name}`}><Plus size={14} aria-hidden="true" /></button>
                      </div>
                    )}
                    <label className="bill-line__note">
                      <span className="sr-only">Note for {item.item_name}</span>
                      <input placeholder="Item note" value={item.notes} onChange={(event) => updateItemNotes(index, event.target.value)} />
                    </label>
                    <button className="icon-button icon-button--danger" type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${item.item_name}`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bill-totals">
              <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              {expressCharge > 0 && <div><span>Express service</span><strong>{formatMoney(expressCharge)}</strong></div>}
              {discountAmount > 0 && <div className="bill-totals__discount"><span>Discount</span><strong>−{formatMoney(discountAmount)}</strong></div>}
              {deliveryCharge > 0 && <div><span>Delivery</span><strong>{formatMoney(deliveryCharge)}</strong></div>}
              {gstAmount > 0 && <div><span>GST ({gstRate}%)</span><strong>{formatMoney(gstAmount)}</strong></div>}
              <div className="bill-totals__grand"><span>Total</span><strong>{formatMoney(total)}</strong></div>
            </div>

            <div className="payment-box">
              <div className="payment-box__heading">
                <span><IndianRupee size={18} aria-hidden="true" /> Payment</span>
                <div className="payment-shortcuts">
                  <button type="button" onClick={() => setPayment((current) => ({ ...current, amount: '' }))}>Later</button>
                  <button type="button" onClick={() => setPayment((current) => ({ ...current, amount: total.toFixed(2) }))}>Full</button>
                </div>
              </div>
              <div className="payment-entry">
                <label htmlFor="amount-collected">Collected now</label>
                <div className="money-input"><span>₹</span><input id="amount-collected" type="number" min="0" max={total} step="0.01" placeholder="0" value={payment.amount} onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))} /></div>
              </div>
              {amountPaid > 0 && (
                <div className="payment-methods" aria-label="Payment method">
                  {['cash', 'upi', 'card'].map((mode) => (
                    <button className={payment.mode === mode ? 'is-active' : ''} type="button" key={mode} aria-pressed={payment.mode === mode} onClick={() => setPayment((current) => ({ ...current, mode }))}>{mode.toUpperCase()}</button>
                  ))}
                </div>
              )}
              <div className="payment-due"><span>Balance due</span><strong>{formatMoney(amountDue)}</strong></div>
            </div>

            <button className="btn btn--primary btn--create" type="submit" disabled={submitting || !customer || items.length === 0}>
              <ReceiptText size={19} aria-hidden="true" />
              {submitting ? 'Creating bill…' : `Create bill · ${formatMoney(total)}`}
            </button>
            <p className="bill-preview__hint">Print or send on WhatsApp after creating the bill.</p>
          </aside>
        </div>
      </form>
    </div>
  );
}