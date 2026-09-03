import { openDB } from 'idb';
import { DEFAULT_PRICES, DEFAULT_SETTINGS } from './defaultData';

const DATABASE_NAME = 'washnest-billing';
const DATABASE_VERSION = 2;
const BACKUP_FORMAT = 'washnest-browser-backup';
const BACKUP_VERSION = 1;

export const BUSINESS_STORES = ['customers', 'orders', 'prices', 'expenses', 'settings'];

let activeDatabase;

const databasePromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database, oldVersion, _newVersion, transaction) {
    if (oldVersion < 1) {
      const customers = database.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
      customers.createIndex('phone', 'phone', { unique: true });
      customers.createIndex('created_at', 'created_at');

      const orders = database.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
      orders.createIndex('customer_id', 'customer_id');
      orders.createIndex('status', 'status');
      orders.createIndex('created_at', 'created_at');
      orders.createIndex('payment_status', 'payment_status');

      database.createObjectStore('prices', { keyPath: 'id', autoIncrement: true });

      const expenses = database.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      expenses.createIndex('date', 'date');

      database.createObjectStore('settings', { keyPath: 'key' });
      database.createObjectStore('auth', { keyPath: 'key' });

      const priceStore = transaction.objectStore('prices');
      DEFAULT_PRICES.forEach((price) => priceStore.put(price));

      const settingStore = transaction.objectStore('settings');
      Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => settingStore.put({ key, value }));
    }

    if (oldVersion < 2) {
      transaction.objectStore('orders').createIndex('order_number', 'order_number', { unique: true });
    }
  },
  blocking() {
    activeDatabase?.close();
  },
}).then((database) => {
  activeDatabase = database;
  return database;
});

export function getDatabase() {
  return databasePromise;
}

export async function exportLocalData() {
  const database = await getDatabase();
  const transaction = database.transaction(BUSINESS_STORES, 'readonly');
  const entries = await Promise.all(BUSINESS_STORES.map(async (storeName) => [
    storeName,
    await transaction.objectStore(storeName).getAll(),
  ]));
  await transaction.done;

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    data: Object.fromEntries(entries),
  };
}

export async function importLocalData(backup) {
  const parsed = typeof backup === 'string' ? JSON.parse(backup) : backup;
  if (!parsed || parsed.format !== BACKUP_FORMAT || parsed.version !== BACKUP_VERSION || !parsed.data) {
    throw new Error('This is not a valid Wash Nest backup');
  }

  BUSINESS_STORES.forEach((storeName) => {
    if (!Array.isArray(parsed.data[storeName])) {
      throw new Error(`Backup is missing ${storeName}`);
    }
  });

  const settings = new Map(Object.entries(DEFAULT_SETTINGS));
  parsed.data.settings.forEach((setting) => {
    if (setting && typeof setting.key === 'string') settings.set(setting.key, String(setting.value ?? ''));
  });

  const restoredData = {
    ...parsed.data,
    settings: Array.from(settings, ([key, value]) => ({ key, value })),
  };

  const database = await getDatabase();
  const transaction = database.transaction(BUSINESS_STORES, 'readwrite');
  const requests = [];

  BUSINESS_STORES.forEach((storeName) => {
    const store = transaction.objectStore(storeName);
    requests.push(store.clear());
    restoredData[storeName].forEach((record) => requests.push(store.put(record)));
  });

  await Promise.all([...requests, transaction.done]);
  return Object.fromEntries(BUSINESS_STORES.map((storeName) => [storeName, restoredData[storeName].length]));
}

export async function getLocalDataCounts() {
  const database = await getDatabase();
  const transaction = database.transaction(BUSINESS_STORES, 'readonly');
  const entries = await Promise.all(BUSINESS_STORES.map(async (storeName) => [
    storeName,
    await transaction.objectStore(storeName).count(),
  ]));
  await transaction.done;
  return Object.fromEntries(entries);
}