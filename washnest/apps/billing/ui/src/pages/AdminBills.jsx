import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ReceiptText, Search, Trash2, TriangleAlert } from 'lucide-react';
import { deleteOrder, getOrders } from '../api';
import { formatMoney } from '../lib/billing';

export default function AdminBills() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await getOrders({ search: search.trim(), limit: 200 }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    load();
  };

  const handleDelete = async (order) => {
    if (!confirm(`Permanently delete ${order.order_number}? This cannot be undone.`)) return;
    setDeletingId(order.id);
    try {
      await deleteOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      toast.success(`${order.order_number} deleted`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-bills-page">
      <div className="page-header">
        <div>
          <p className="eyebrow"><ReceiptText size={14} aria-hidden="true" /> Protected administration</p>
          <h1>Manage bills</h1>
        </div>
      </div>

      <div className="admin-delete-note">
        <TriangleAlert size={18} aria-hidden="true" />
        <span>Deleting a bill also removes its payments and history, then recalculates the customer totals.</span>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <div className="form-group admin-bills-search">
          <label htmlFor="admin-bill-search">Find a bill</label>
          <div className="input-with-icon">
            <Search size={17} aria-hidden="true" />
            <input
              id="admin-bill-search"
              className="form-input"
              placeholder="Bill number, customer, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <button className="btn btn--primary admin-bills-search-button" type="submit">Search</button>
      </form>

      <div className="card">
        {loading ? <p>Loading…</p> : orders.length === 0 ? (
          <p className="empty">No bills found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Bill</th><th>Customer</th><th>Total</th><th>Paid</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><Link to={`/orders/${order.id}`}><strong>{order.order_number}</strong></Link></td>
                    <td><div>{order.customer?.name || '—'}</div><small>{order.customer?.phone || ''}</small></td>
                    <td>{formatMoney(order.total_amount)}</td>
                    <td>{formatMoney(order.amount_paid)}</td>
                    <td><span className={`badge badge--${order.status}`}>{order.status.replace(/_/g, ' ')}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn--danger btn--sm" type="button" onClick={() => handleDelete(order)} disabled={deletingId === order.id}>
                        <Trash2 size={15} aria-hidden="true" /> {deletingId === order.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}