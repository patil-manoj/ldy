import { requireSupabase } from './supabaseClient';

const TABLES = {
  customers: 'customers',
  orders: 'orders',
  prices: 'prices',
  expenses: 'expenses',
  settings: 'settings',
};

async function selectRows(storeName) {
  const client = requireSupabase();

  if (storeName !== 'orders') {
    const { data, error } = await client
      .from(TABLES[storeName])
      .select('*');

    if (error) throw error;
    return data;
  }

  const { data: orders, error } = await client
    .from('orders')
    .select('*, customers(*)');

  if (error) throw error;

  const ids = orders.map((order) => order.id);

  if (!ids.length) return [];

  const [items, payments, history] = await Promise.all([
    client.from('order_items').select('*').in('order_id', ids),
    client.from('payments').select('*').in('order_id', ids),
    client.from('order_status_history').select('*').in('order_id', ids),
  ]);

  if (items.error) throw items.error;
  if (payments.error) throw payments.error;
  if (history.error) throw history.error;

  return orders.map(({ customers, ...order }) => ({
    ...order,
    customer: customers,
    items: items.data.filter((item) => item.order_id === order.id),
    payments: payments.data.filter((payment) => payment.order_id === order.id),
    status_history: history.data.filter((entry) => entry.order_id === order.id),
  }));
}

async function getRow(storeName, key) {
  const rows = await selectRows(storeName);

  return rows.find(
    (row) => String(row.id ?? row.key) === String(key)
  );
}

async function upsertOrder(order) {
  const client = requireSupabase();

  const {
    items = [],
    payments = [],
    status_history: history = [],
    customer: _customer,
    customers: _customers,
    ...orderRow
  } = order;

  const { data, error } = await client
    .from('orders')
    .upsert(orderRow)
    .select()
    .single();

  if (error) throw error;

  for (const [table, rows] of [
    ['order_items', items],
    ['payments', payments],
    ['order_status_history', history],
  ]) {
    if (rows.length) {
      const { error: childError } = await client
        .from(table)
        .upsert(
          rows.map((row) => ({
            ...row,
            order_id: data.id,
          }))
        );

      if (childError) throw childError;
    }
  }

  return data.id;
}

async function upsertRow(storeName, value) {
  if (storeName === 'orders') {
    return upsertOrder(value);
  }

  const { data, error } = await requireSupabase()
    .from(TABLES[storeName])
    .upsert(value)
    .select()
    .single();

  if (error) throw error;

  return data.id ?? data.key;
}

class RemoteTransaction {
  constructor(storeNames) {
    this.storeNames = Array.isArray(storeNames)
      ? storeNames
      : [storeNames];

    this.operations = [];
  }

  objectStore(name) {
    return new RemoteStore(name, this);
  }

  get store() {
    return this.objectStore(this.storeNames[0]);
  }

  stage(storeName, operation, value) {
    this.operations.push({
      storeName,
      operation,
      value,
    });
  }

  async get(storeName, key) {
    return getRow(storeName, key);
  }

  async commit() {
    for (const operation of this.operations) {
      if (operation.operation === 'upsert') {
        await upsertRow(
          operation.storeName,
          operation.value
        );
      }

      if (operation.operation === 'clear') {
        const { error } = await requireSupabase()
          .from(TABLES[operation.storeName])
          .delete()
          .not('id', 'is', null);

        if (error) throw error;
      }

      if (operation.operation === 'delete') {
        const { error } = await requireSupabase()
          .from(TABLES[operation.storeName])
          .delete()
          .eq('id', operation.value);

        if (error) throw error;
      }
    }
  }
}

class RemoteStore {
  constructor(name, transaction) {
    this.name = name;
    this.transaction = transaction;
  }

  get(key) {
    return this.transaction.get(this.name, key);
  }

  getAll() {
    return selectRows(this.name);
  }

  async count() {
    return (await this.getAll()).length;
  }

  index(indexName) {
    return {
      get: async (value) =>
        (await this.getAll()).find(
          (row) => row[indexName] === value
        ),

      getAll: async (value) =>
        (await this.getAll()).filter(
          (row) => row[indexName] === value
        ),

      getKey: async (value) =>
        (await this.getAll()).find(
          (row) => row[indexName] === value
        )?.id,
    };
  }

  async add(value) {
    const id = await upsertRow(this.name, value);

    if (id != null) {
      value.id = id;
    }

    return id;
  }

  put(value) {
    this.transaction.stage(
      this.name,
      'upsert',
      value
    );

    return Promise.resolve(value.id ?? value.key);
  }

  delete(key) {
    this.transaction.stage(
      this.name,
      'delete',
      key
    );

    return Promise.resolve();
  }

  clear() {
    this.transaction.stage(
      this.name,
      'clear'
    );

    return Promise.resolve();
  }
}

export function createRemoteDatabase() {
  return {
    get: getRow,

    getAll: selectRows,

    getFromIndex: async (storeName, indexName, value) =>
      (await selectRows(storeName)).find(
        (row) => row[indexName] === value
      ),

    add: upsertRow,

    put: upsertRow,

    delete: async (storeName, key) => {
      const { error } = await requireSupabase()
        .from(TABLES[storeName])
        .delete()
        .eq('id', key);

      if (error) throw error;
    },

    transaction: (storeNames) => {
      const transaction = new RemoteTransaction(storeNames);

      Object.defineProperty(transaction, 'done', {
        get: () => transaction.commit(),
      });

      return transaction;
    },
  };
}
