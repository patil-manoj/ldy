import {
  exportLocalData,
  getDatabase,
  getLocalDataCounts,
  importLocalData,
} from './lib/localDatabase';

const VALID_STATUSES = new Set(['received', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']);
const VALID_SOURCES = new Set(['walkin', 'whatsapp', 'phone']);
const VALID_EXPENSE_CATEGORIES = new Set(['detergent', 'rent', 'salary', 'electricity', 'water', 'packaging', 'transport', 'maintenance', 'equipment', 'other']);
const EDITABLE_SETTINGS = new Set(['shop_name', 'shop_phone', 'shop_address', 'gst_number', 'gst_enabled', 'gst_rate', 'express_multiplier', 'default_delivery_charge', 'next_order_number', 'financial_year']);
const ADMIN_SESSION_KEY = 'washnest-admin-session';
const ADMIN_SESSION_DURATION = 8 * 60 * 60 * 1000;
const LOGIN_LOCK_DURATION = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const PASSWORD_ITERATIONS = 310000;
export const DEFAULT_ADMIN_PASSWORD = 'Washnest*123';

function recordKey(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && String(value).trim() !== '' ? numeric : value;
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateForTimestamp(timestamp) {
  return localDateString(new Date(timestamp));
}

function nullableText(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function customerBrief(customer) {
  if (!customer) return null;
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    area: customer.area,
    total_orders: customer.total_orders,
  };
}

function attachCustomer(order, customers) {
  const customer = customers instanceof Map ? customers.get(order.customer_id) : customers;
  return { ...order, customer: customerBrief(customer) };
}

function paginate(records, params = {}) {
  const offset = Math.max(0, Math.trunc(numberValue(params.offset, 0)));
  const limit = Math.min(200, Math.max(1, Math.trunc(numberValue(params.limit, 50))));
  return records.slice(offset, offset + limit);
}

function calculateTotals(items, payload, settings) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
  const discountPercent = Math.min(100, Math.max(0, numberValue(payload.discount_percent)));
  const deliveryCharge = Math.max(0, roundMoney(payload.delivery_charge));
  const expressMultiplier = Math.max(1, numberValue(settings.express_multiplier, 1.5));
  const expressCharge = payload.is_express ? roundMoney(subtotal * (expressMultiplier - 1)) : 0;
  const discountAmount = discountPercent > 0 ? roundMoney(subtotal * discountPercent / 100) : 0;
  const taxable = Math.max(0, subtotal + expressCharge + deliveryCharge - discountAmount);
  const gstEnabled = String(settings.gst_enabled).toLowerCase() === 'true';
  const gstPercent = gstEnabled ? Math.max(0, numberValue(settings.gst_rate, 18)) : 0;
  const gstAmount = gstEnabled ? roundMoney(taxable * gstPercent / 100) : 0;
  const totalAmount = roundMoney(taxable + gstAmount);

  return {
    subtotal,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    delivery_charge: deliveryCharge,
    express_charge: expressCharge,
    gst_percent: gstPercent,
    gst_amount: gstAmount,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_due: totalAmount,
    payment_status: totalAmount === 0 ? 'paid' : 'unpaid',
  };
}

function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Add at least one service to the bill');
  return items.map((item, index) => {
    const quantity = Math.max(1, Math.trunc(numberValue(item.quantity, 1)));
    const weight = item.weight_kg == null ? null : Math.max(0, numberValue(item.weight_kg));
    const price = Math.max(0, numberValue(item.price_per_unit));
    return {
      id: index + 1,
      service_type: item.service_type,
      item_name: nullableText(item.item_name) || 'Service',
      category: nullableText(item.category),
      quantity,
      weight_kg: weight,
      price_per_unit: price,
      subtotal: roundMoney((weight == null ? quantity : weight) * price),
      notes: nullableText(item.notes),
    };
  });
}

async function settingsObject(store) {
  const settings = await store.getAll();
  return Object.fromEntries(settings.map(({ key, value }) => [key, value]));
}

function encodeBytes(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function passwordHash(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Password protection requires HTTPS or localhost');
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: decodeBytes(salt), iterations: PASSWORD_ITERATIONS },
    material,
    256,
  );
  return encodeBytes(new Uint8Array(bits));
}

async function passwordFingerprint(password) {
  if (!globalThis.crypto?.subtle) throw new Error('Password protection requires HTTPS or localhost');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return encodeBytes(new Uint8Array(digest));
}

async function createAdminCredential(password, usesDefaultPassword = false) {
  const salt = encodeBytes(crypto.getRandomValues(new Uint8Array(16)));
  const credential = {
    key: 'admin',
    salt,
    hash: await passwordHash(password, salt),
    credential_version: crypto.randomUUID(),
    failed_attempts: 0,
    lock_until: 0,
    uses_default_password: usesDefaultPassword,
  };
  if (usesDefaultPassword) credential.default_password_id = await passwordFingerprint(password);
  return credential;
}

async function ensureAdminCredential(database) {
  const existing = await database.get('auth', 'admin');
  const currentDefaultId = await passwordFingerprint(DEFAULT_ADMIN_PASSWORD);
  const hasCurrentDefault = existing?.uses_default_password
    && existing.default_password_id === currentDefaultId;
  const hasCustomPassword = existing?.uses_default_password === false;
  if (hasCurrentDefault || hasCustomPassword) return existing;

  if (existing) {
    const migratedCredential = await createAdminCredential(DEFAULT_ADMIN_PASSWORD, true);
    await database.put('auth', migratedCredential);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return migratedCredential;
  }

  const credential = await createAdminCredential(DEFAULT_ADMIN_PASSWORD, true);
  try {
    await database.add('auth', credential);
    return credential;
  } catch (error) {
    if (error.name !== 'ConstraintError') throw error;
    return database.get('auth', 'admin');
  }
}

function equalHashes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function readAdminSession(credentialVersion) {
  try {
    const session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY));
    return session?.credential_version === credentialVersion && session.expires_at > Date.now();
  } catch {
    return false;
  }
}

function startAdminSession(credentialVersion) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    credential_version: credentialVersion,
    expires_at: Date.now() + ADMIN_SESSION_DURATION,
  }));
}

async function requireAdmin() {
  const status = await getAuthStatus();
  if (!status.authenticated) throw new Error('Unlock admin access first');
}

export async function getAuthStatus() {
  const database = await getDatabase();
  const credential = await ensureAdminCredential(database);
  return {
    configured: true,
    authenticated: readAdminSession(credential.credential_version),
    uses_default_password: Boolean(credential.uses_default_password),
  };
}

export async function loginAdmin(password) {
  const database = await getDatabase();
  const credential = await ensureAdminCredential(database);

  const now = Date.now();
  if (credential.lock_until > now) {
    const minutes = Math.ceil((credential.lock_until - now) / 60000);
    throw new Error(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}`);
  }

  const candidateHash = await passwordHash(password, credential.salt);
  if (!equalHashes(candidateHash, credential.hash)) {
    const previousAttempts = credential.lock_until > 0 ? 0 : numberValue(credential.failed_attempts);
    const failedAttempts = previousAttempts + 1;
    credential.failed_attempts = failedAttempts;
    credential.lock_until = failedAttempts >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_LOCK_DURATION : 0;
    await database.put('auth', credential);
    if (credential.lock_until) throw new Error('Too many attempts. Try again in 15 minutes');
    throw new Error('Incorrect password');
  }

  credential.failed_attempts = 0;
  credential.lock_until = 0;
  await database.put('auth', credential);
  startAdminSession(credential.credential_version);
  return { configured: true, authenticated: true, uses_default_password: Boolean(credential.uses_default_password) };
}

export async function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  return { configured: true, authenticated: false };
}

export async function changeAdminPassword(currentPassword, newPassword) {
  await requireAdmin();
  if (newPassword.length < 10) throw new Error('Use at least 10 characters');
  const database = await getDatabase();
  const credential = await database.get('auth', 'admin');
  const currentHash = await passwordHash(currentPassword, credential.salt);
  if (!equalHashes(currentHash, credential.hash)) throw new Error('Current password is incorrect');

  const salt = encodeBytes(crypto.getRandomValues(new Uint8Array(16)));
  credential.salt = salt;
  credential.hash = await passwordHash(newPassword, salt);
  credential.credential_version = crypto.randomUUID();
  credential.failed_attempts = 0;
  credential.lock_until = 0;
  credential.uses_default_password = false;
  delete credential.default_password_id;
  await database.put('auth', credential);
  startAdminSession(credential.credential_version);
  return { configured: true, authenticated: true, uses_default_password: false };
}

export async function createCustomer(body) {
  const name = nullableText(body.name);
  const phone = String(body.phone || '').replace(/\D/g, '');
  if (!name) throw new Error('Customer name is required');
  if (!phone) throw new Error('Customer phone is required');

  const database = await getDatabase();
  const transaction = database.transaction('customers', 'readwrite');
  if (await transaction.store.index('phone').get(phone)) throw new Error('Customer with this phone already exists');

  const now = new Date().toISOString();
  const customer = {
    name,
    phone,
    alt_phone: nullableText(body.alt_phone),
    address: nullableText(body.address),
    landmark: nullableText(body.landmark),
    floor_apt: nullableText(body.floor_apt),
    area: nullableText(body.area),
    pincode: nullableText(body.pincode),
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    customer_type: body.customer_type || 'regular',
    delivery_notes: nullableText(body.delivery_notes),
    credit_limit: Math.max(0, numberValue(body.credit_limit)),
    total_orders: 0,
    total_spent: 0,
    outstanding_balance: 0,
    is_active: body.is_active ?? true,
    created_at: now,
    updated_at: now,
  };
  customer.id = await transaction.store.add(customer);
  await transaction.done;
  return customer;
}

export async function getCustomers(params = {}) {
  const database = await getDatabase();
  let customers = await database.getAll('customers');
  const search = String(params.search || '').trim().toLowerCase();
  if (search) customers = customers.filter((customer) => [customer.name, customer.phone, customer.area].some((value) => String(value || '').toLowerCase().includes(search)));
  if (params.customer_type) customers = customers.filter((customer) => customer.customer_type === params.customer_type);
  if (params.is_active !== undefined && params.is_active !== '') {
    const isActive = params.is_active === true || params.is_active === 'true';
    customers = customers.filter((customer) => customer.is_active === isActive);
  }
  customers.sort((left, right) => right.created_at.localeCompare(left.created_at));
  return paginate(customers, params);
}

export async function lookupCustomer(phone) {
  const database = await getDatabase();
  return (await database.getFromIndex('customers', 'phone', String(phone).replace(/\D/g, ''))) || null;
}

export async function getCustomer(id) {
  const database = await getDatabase();
  const customer = await database.get('customers', recordKey(id));
  if (!customer) throw new Error('Customer not found');
  return customer;
}

export async function updateCustomer(id, body) {
  const database = await getDatabase();
  const transaction = database.transaction('customers', 'readwrite');
  const key = recordKey(id);
  const customer = await transaction.store.get(key);
  if (!customer) throw new Error('Customer not found');

  if (body.phone !== undefined) {
    const phone = String(body.phone).replace(/\D/g, '');
    const existing = await transaction.store.index('phone').get(phone);
    if (existing && existing.id !== key) throw new Error('Customer with this phone already exists');
    customer.phone = phone;
  }

  const textFields = ['name', 'alt_phone', 'address', 'landmark', 'floor_apt', 'area', 'pincode', 'delivery_notes'];
  textFields.forEach((field) => {
    if (body[field] !== undefined) customer[field] = field === 'name' ? nullableText(body[field]) : nullableText(body[field]);
  });
  if (!customer.name) throw new Error('Customer name is required');
  if (body.customer_type !== undefined) customer.customer_type = body.customer_type;
  if (body.credit_limit !== undefined) customer.credit_limit = Math.max(0, numberValue(body.credit_limit));
  if (body.is_active !== undefined) customer.is_active = Boolean(body.is_active);
  customer.updated_at = new Date().toISOString();
  await transaction.store.put(customer);
  await transaction.done;
  return customer;
}

export async function getCustomerOrders(id) {
  const customerId = recordKey(id);
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readonly');
  const [orders, customer] = await Promise.all([
    transaction.objectStore('orders').index('customer_id').getAll(customerId),
    transaction.objectStore('customers').get(customerId),
  ]);
  await transaction.done;
  if (!customer) throw new Error('Customer not found');
  return orders.sort((left, right) => right.created_at.localeCompare(left.created_at)).map((order) => attachCustomer(order, customer));
}

export async function createOrder(body) {
  const database = await getDatabase();
  const transaction = database.transaction(['customers', 'orders', 'settings'], 'readwrite');
  const customerStore = transaction.objectStore('customers');
  const orderStore = transaction.objectStore('orders');
  const settingStore = transaction.objectStore('settings');
  const customerId = recordKey(body.customer_id);
  const [customer, settings] = await Promise.all([
    customerStore.get(customerId),
    settingsObject(settingStore),
  ]);
  if (!customer) throw new Error('Customer not found');

  const items = normalizeOrderItems(body.items);
  let nextNumber = Math.max(1, Math.trunc(numberValue(settings.next_order_number, 1)));
  let orderNumber = `WN-${settings.financial_year || '0000'}-${String(nextNumber).padStart(4, '0')}`;
  while (await orderStore.index('order_number').getKey(orderNumber) !== undefined) {
    nextNumber += 1;
    orderNumber = `WN-${settings.financial_year || '0000'}-${String(nextNumber).padStart(4, '0')}`;
  }
  await settingStore.put({ key: 'next_order_number', value: String(nextNumber + 1) });

  const now = new Date().toISOString();
  const totals = calculateTotals(items, body, settings);
  const order = {
    order_number: orderNumber,
    customer_id: customerId,
    status: 'received',
    source: VALID_SOURCES.has(body.source) ? body.source : 'walkin',
    order_date: localDateString(),
    pickup_date: body.pickup_date || null,
    expected_delivery_date: body.expected_delivery_date || null,
    actual_delivery_date: null,
    pickup_slot: nullableText(body.pickup_slot),
    delivery_slot: nullableText(body.delivery_slot),
    ...totals,
    payment_mode: null,
    is_express: Boolean(body.is_express),
    is_doorstep: body.is_doorstep ?? true,
    weight_kg: body.weight_kg == null ? null : numberValue(body.weight_kg),
    notes: nullableText(body.notes),
    staff_notes: nullableText(body.staff_notes),
    pickup_address: nullableText(body.pickup_address),
    created_at: now,
    updated_at: now,
    items: [],
    payments: [],
    status_history: [],
  };

  order.id = await orderStore.add(order);
  order.items = items.map((item) => ({ ...item, order_id: order.id }));
  order.status_history = [{
    id: 1,
    order_id: order.id,
    from_status: null,
    to_status: 'received',
    changed_by: null,
    notes: null,
    changed_at: now,
  }];
  await orderStore.put(order);

  customer.total_orders = numberValue(customer.total_orders) + 1;
  customer.total_spent = roundMoney(numberValue(customer.total_spent) + order.total_amount);
  customer.outstanding_balance = roundMoney(numberValue(customer.outstanding_balance) + order.amount_due);
  customer.updated_at = now;
  await customerStore.put(customer);
  await transaction.done;
  return attachCustomer(order, customer);
}

export async function getOrders(params = {}) {
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readonly');
  const [orders, customers] = await Promise.all([
    transaction.objectStore('orders').getAll(),
    transaction.objectStore('customers').getAll(),
  ]);
  await transaction.done;

  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const search = String(params.search || '').trim().toLowerCase();
  let filtered = orders.filter((order) => {
    const customer = customerMap.get(order.customer_id);
    if (params.status && order.status !== params.status) return false;
    if (params.payment_status && order.payment_status !== params.payment_status) return false;
    if (params.source && order.source !== params.source) return false;
    if (params.customer_id && order.customer_id !== recordKey(params.customer_id)) return false;
    if (params.is_express !== undefined && params.is_express !== '' && order.is_express !== (params.is_express === true || params.is_express === 'true')) return false;
    if (params.date_from && dateForTimestamp(order.created_at) < params.date_from) return false;
    if (params.date_to && dateForTimestamp(order.created_at) > params.date_to) return false;
    if (search && ![order.order_number, customer?.name, customer?.phone].some((value) => String(value || '').toLowerCase().includes(search))) return false;
    return true;
  });
  filtered.sort((left, right) => right.created_at.localeCompare(left.created_at));
  return paginate(filtered, params).map((order) => attachCustomer(order, customerMap));
}

export async function getOrder(id) {
  const database = await getDatabase();
  const order = await database.get('orders', recordKey(id));
  if (!order) throw new Error('Order not found');
  const customer = await database.get('customers', order.customer_id);
  return attachCustomer(order, customer);
}

export async function deleteOrder(id) {
  await requireAdmin();
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readwrite');
  const orderStore = transaction.objectStore('orders');
  const customerStore = transaction.objectStore('customers');
  const order = await orderStore.get(recordKey(id));
  if (!order) throw new Error('Order not found');

  await orderStore.delete(order.id);
  const customer = await customerStore.get(order.customer_id);
  if (customer) {
    const remainingOrders = await orderStore.index('customer_id').getAll(order.customer_id);
    customer.total_orders = remainingOrders.length;
    customer.total_spent = roundMoney(remainingOrders.reduce((sum, remainingOrder) => sum + remainingOrder.total_amount, 0));
    customer.outstanding_balance = roundMoney(remainingOrders
      .filter((remainingOrder) => remainingOrder.status !== 'cancelled')
      .reduce((sum, remainingOrder) => sum + remainingOrder.amount_due, 0));
    customer.updated_at = new Date().toISOString();
    await customerStore.put(customer);
  }

  await transaction.done;
  return null;
}

export async function updateOrderStatus(id, body) {
  if (!VALID_STATUSES.has(body.status)) throw new Error(`Invalid status: ${body.status}`);
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readwrite');
  const orderStore = transaction.objectStore('orders');
  const customerStore = transaction.objectStore('customers');
  const order = await orderStore.get(recordKey(id));
  if (!order) throw new Error('Order not found');
  if (order.status === 'delivered' && body.status !== 'cancelled') throw new Error('Delivered orders cannot change status');
  if (order.status === 'cancelled') throw new Error('Cancelled orders cannot change status');

  const previousStatus = order.status;
  const now = new Date().toISOString();
  order.status = body.status;
  order.updated_at = now;
  if (body.status === 'delivered') order.actual_delivery_date = localDateString();
  order.status_history = [...order.status_history, {
    id: order.status_history.reduce((highest, entry) => Math.max(highest, entry.id), 0) + 1,
    order_id: order.id,
    from_status: previousStatus,
    to_status: body.status,
    changed_by: nullableText(body.changed_by),
    notes: nullableText(body.notes),
    changed_at: now,
  }];

  if (body.status === 'cancelled' && order.amount_due > 0) {
    const customer = await customerStore.get(order.customer_id);
    if (customer) {
      customer.outstanding_balance = Math.max(0, roundMoney(numberValue(customer.outstanding_balance) - order.amount_due));
      customer.updated_at = now;
      await customerStore.put(customer);
    }
  }

  await orderStore.put(order);
  await transaction.done;
  const customer = await database.get('customers', order.customer_id);
  return attachCustomer(order, customer);
}

export async function getRoundedWeight(kg) {
  const raw = numberValue(kg);
  const lower = Math.floor(raw * 2) / 2;
  const overshoot = Math.round((raw - lower) * 1000) / 1000;
  const rounded = Math.max(overshoot <= 0.1 ? lower : lower + 0.5, 0.5);
  return { raw, rounded };
}

export async function recordPayment(orderId, body) {
  const amount = roundMoney(body.amount);
  if (amount <= 0) throw new Error('Payment amount must be positive');
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readwrite');
  const orderStore = transaction.objectStore('orders');
  const customerStore = transaction.objectStore('customers');
  const order = await orderStore.get(recordKey(orderId));
  if (!order) throw new Error('Order not found');
  if (order.status === 'cancelled') throw new Error('Cannot accept payment for cancelled orders');
  if (amount > order.amount_due) throw new Error(`Payment exceeds amount due (₹${order.amount_due})`);

  const payment = {
    id: order.payments.reduce((highest, entry) => Math.max(highest, entry.id), 0) + 1,
    order_id: order.id,
    amount,
    mode: body.mode,
    reference: nullableText(body.reference),
    received_by: nullableText(body.received_by),
    notes: nullableText(body.notes),
    received_at: new Date().toISOString(),
  };
  order.payments = [...order.payments, payment];
  order.amount_paid = roundMoney(order.amount_paid + amount);
  order.amount_due = Math.max(0, roundMoney(order.total_amount - order.amount_paid));
  order.payment_status = order.amount_due === 0 ? 'paid' : 'partial';
  const paymentModes = new Set(order.payments.map((entry) => entry.mode));
  order.payment_mode = paymentModes.size > 1 ? 'mixed' : payment.mode;
  order.updated_at = payment.received_at;
  await orderStore.put(order);

  const customer = await customerStore.get(order.customer_id);
  if (customer) {
    customer.outstanding_balance = Math.max(0, roundMoney(numberValue(customer.outstanding_balance) - amount));
    customer.updated_at = payment.received_at;
    await customerStore.put(customer);
  }
  await transaction.done;
  return payment;
}

export async function getPriceList(params = {}) {
  const database = await getDatabase();
  let prices = await database.getAll('prices');
  const activeOnly = params.active_only !== false && params.active_only !== 'false';
  if (activeOnly) prices = prices.filter((price) => price.active);
  if (params.service_type) prices = prices.filter((price) => price.service_type === params.service_type);
  if (params.category) prices = prices.filter((price) => price.category === params.category);
  return prices.sort((left, right) => `${left.service_type}|${left.category}|${left.item_name}`.localeCompare(`${right.service_type}|${right.category}|${right.item_name}`));
}

export async function createPrice(body) {
  await requireAdmin();
  if (!nullableText(body.item_name)) throw new Error('Item name is required');
  const database = await getDatabase();
  const price = {
    service_type: body.service_type,
    item_name: body.item_name.trim(),
    category: body.category || 'clothing',
    price: Math.max(0, numberValue(body.price)),
    price_per_kg: body.price_per_kg == null ? null : Math.max(0, numberValue(body.price_per_kg)),
    is_per_kg: Boolean(body.is_per_kg),
    active: body.active ?? true,
  };
  price.id = await database.add('prices', price);
  return price;
}

export async function updatePrice(id, body) {
  await requireAdmin();
  const database = await getDatabase();
  const price = await database.get('prices', recordKey(id));
  if (!price) throw new Error('Price item not found');
  const updated = {
    ...price,
    service_type: body.service_type,
    item_name: nullableText(body.item_name) || price.item_name,
    category: body.category || 'clothing',
    price: Math.max(0, numberValue(body.price)),
    price_per_kg: body.price_per_kg == null ? null : Math.max(0, numberValue(body.price_per_kg)),
    is_per_kg: Boolean(body.is_per_kg),
    active: body.active ?? true,
  };
  await database.put('prices', updated);
  return updated;
}

export async function deletePrice(id) {
  await requireAdmin();
  const database = await getDatabase();
  const price = await database.get('prices', recordKey(id));
  if (!price) throw new Error('Price item not found');
  price.active = false;
  await database.put('prices', price);
  return null;
}

export async function createExpense(body) {
  if (!VALID_EXPENSE_CATEGORIES.has(body.category)) throw new Error('Invalid expense category');
  const amount = roundMoney(body.amount);
  if (amount <= 0) throw new Error('Amount must be positive');
  const database = await getDatabase();
  const expense = {
    date: body.date || localDateString(),
    category: body.category,
    description: nullableText(body.description),
    amount,
    payment_mode: body.payment_mode || 'cash',
    reference: nullableText(body.reference),
    created_at: new Date().toISOString(),
  };
  expense.id = await database.add('expenses', expense);
  return expense;
}

export async function getExpenses(params = {}) {
  const database = await getDatabase();
  let expenses = await database.getAll('expenses');
  if (params.date_from) expenses = expenses.filter((expense) => expense.date >= params.date_from);
  if (params.date_to) expenses = expenses.filter((expense) => expense.date <= params.date_to);
  if (params.category) expenses = expenses.filter((expense) => expense.category === params.category);
  expenses.sort((left, right) => right.date.localeCompare(left.date) || right.created_at.localeCompare(left.created_at));
  return paginate(expenses, params);
}

export async function deleteExpense(id) {
  const database = await getDatabase();
  if (!(await database.get('expenses', recordKey(id)))) throw new Error('Expense not found');
  await database.delete('expenses', recordKey(id));
  return null;
}

export async function getDashboard() {
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'customers'], 'readonly');
  const [orders, totalCustomers] = await Promise.all([
    transaction.objectStore('orders').getAll(),
    transaction.objectStore('customers').count(),
  ]);
  await transaction.done;
  const today = localDateString();
  const todaysOrders = orders.filter((order) => dateForTimestamp(order.created_at) === today);
  const todaysPayments = orders.flatMap((order) => order.payments).filter((payment) => dateForTimestamp(payment.received_at) === today);
  return {
    total_orders_today: todaysOrders.length,
    revenue_today: roundMoney(todaysOrders.reduce((sum, order) => sum + order.total_amount, 0)),
    collected_today: roundMoney(todaysPayments.reduce((sum, payment) => sum + payment.amount, 0)),
    pending_pickups: orders.filter((order) => order.status === 'received').length,
    pending_deliveries: orders.filter((order) => order.status === 'ready').length,
    in_progress: orders.filter((order) => order.status === 'processing').length,
    express_orders: todaysOrders.filter((order) => order.is_express).length,
    total_customers: totalCustomers,
    outstanding_total: roundMoney(orders.filter((order) => order.status !== 'cancelled' && ['unpaid', 'partial'].includes(order.payment_status)).reduce((sum, order) => sum + order.amount_due, 0)),
  };
}

export async function getDailyReport(date = localDateString()) {
  const database = await getDatabase();
  const transaction = database.transaction(['orders', 'expenses'], 'readonly');
  const [allOrders, allExpenses] = await Promise.all([
    transaction.objectStore('orders').getAll(),
    transaction.objectStore('expenses').getAll(),
  ]);
  await transaction.done;
  const orders = allOrders.filter((order) => dateForTimestamp(order.created_at) === date);
  const payments = allOrders.flatMap((order) => order.payments).filter((payment) => dateForTimestamp(payment.received_at) === date);
  const expenses = allExpenses.filter((expense) => expense.date === date);
  const totalRevenue = roundMoney(orders.reduce((sum, order) => sum + order.total_amount, 0));
  const collected = roundMoney(payments.reduce((sum, payment) => sum + payment.amount, 0));
  const expensesTotal = roundMoney(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const statusCounts = orders.reduce((counts, order) => ({ ...counts, [order.status]: (counts[order.status] || 0) + 1 }), {});

  return {
    date,
    total_orders: orders.length,
    walkin_orders: orders.filter((order) => order.source === 'walkin').length,
    whatsapp_orders: orders.filter((order) => order.source === 'whatsapp').length,
    phone_orders: orders.filter((order) => order.source === 'phone').length,
    total_revenue: totalRevenue,
    collected_revenue: collected,
    pending_revenue: roundMoney(totalRevenue - collected),
    cash_collected: roundMoney(payments.filter((payment) => payment.mode === 'cash').reduce((sum, payment) => sum + payment.amount, 0)),
    upi_collected: roundMoney(payments.filter((payment) => payment.mode === 'upi').reduce((sum, payment) => sum + payment.amount, 0)),
    card_collected: roundMoney(payments.filter((payment) => payment.mode === 'card').reduce((sum, payment) => sum + payment.amount, 0)),
    expenses_total: expensesTotal,
    net_revenue: roundMoney(collected - expensesTotal),
    orders_by_status: statusCounts,
  };
}

export async function getSettings() {
  const database = await getDatabase();
  const settings = await database.getAll('settings');
  return settings.filter((setting) => EDITABLE_SETTINGS.has(setting.key));
}

export async function updateSetting(key, value) {
  await requireAdmin();
  if (!EDITABLE_SETTINGS.has(key)) throw new Error('Setting cannot be changed');
  const setting = { key, value: String(value) };
  const database = await getDatabase();
  await database.put('settings', setting);
  return setting;
}

export async function exportBackup() {
  await requireAdmin();
  return exportLocalData();
}

export async function importBackup(backup) {
  await requireAdmin();
  return importLocalData(backup);
}

export async function getDataCounts() {
  return getLocalDataCounts();
}
