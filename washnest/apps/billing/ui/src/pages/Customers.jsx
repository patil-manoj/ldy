import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getCustomers({ search: search || undefined }).then(setCustomers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <>
      <div className="page-header">
        <h1>Customers</h1>
      </div>

      <form onSubmit={handleSearch} className="filters">
        <div className="form-group" style={{ flex: 1, minWidth: 250 }}>
          <label>Search</label>
          <input className="form-input" placeholder="Name, phone, or area..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group" style={{ alignSelf: 'flex-end' }}>
          <button className="btn btn--primary" type="submit">Search</button>
        </div>
      </form>

      <div className="card">
        {loading ? <p>Loading…</p> : customers.length === 0 ? (
          <p className="empty">No customers found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Type</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Outstanding</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <div className="customer-avatar" style={{ width: 30, height: 30, fontSize: '.8rem' }}>{c.name[0]}</div>
                          <strong>{c.name}</strong>
                        </div>
                      </Link>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.area || '—'}</td>
                    <td>{c.customer_type}</td>
                    <td>{c.total_orders}</td>
                    <td>₹{c.total_spent.toLocaleString('en-IN')}</td>
                    <td style={{ color: c.outstanding_balance > 0 ? '#dc2626' : 'inherit' }}>
                      {c.outstanding_balance > 0 ? `₹${c.outstanding_balance.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
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
