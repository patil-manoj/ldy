import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getPriceList, createPrice, updatePrice, deletePrice } from '../api';
import { SERVICES, SERVICE_LABELS } from '../lib/billing';

const CATEGORIES = ['clothing', 'bedding', 'household', 'accessories'];

export default function PriceListPage() {
  const [prices, setPrices] = useState([]);
  const [activeTab, setActiveTab] = useState('wash_fold');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ service_type: 'wash_fold', item_name: '', category: 'clothing', price: '', price_per_kg: '', is_per_kg: false });

  const load = () => getPriceList({ active_only: false }).then(setPrices).catch(console.error);
  useEffect(() => { load(); }, []);

  const filtered = prices.filter(p => p.service_type === activeTab);

  const openAdd = () => {
    setEditItem(null);
    setForm({ service_type: activeTab, item_name: '', category: 'clothing', price: '', price_per_kg: '', is_per_kg: false });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ service_type: item.service_type, item_name: item.item_name, category: item.category || 'clothing', price: String(item.price), price_per_kg: item.price_per_kg ? String(item.price_per_kg) : '', is_per_kg: item.is_per_kg });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.item_name.trim() || !form.price) return toast.error('Name and price are required');
    const payload = { ...form, price: Number(form.price), price_per_kg: form.price_per_kg ? Number(form.price_per_kg) : null, active: true };
    try {
      if (editItem) {
        await updatePrice(editItem.id, payload);
        toast.success('Price updated');
      } else {
        await createPrice(payload);
        toast.success('Price added');
      }
      setShowModal(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Deactivate "${item.item_name}"?`)) return;
    try {
      await deletePrice(item.id);
      toast.success('Deactivated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Price List</h1>
        <button className="btn btn--primary" type="button" onClick={openAdd}><Plus size={17} aria-hidden="true" /> Add item</button>
      </div>

      <div className="tabs">
        {SERVICES.map(s => (
          <button key={s} className={`tab ${activeTab === s ? 'tab--active' : ''}`} onClick={() => setActiveTab(s)}>
            {SERVICE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty">No prices for this service</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Price (₹)</th><th>Per KG</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ opacity: p.active ? 1 : 0.5 }}>
                    <td><strong>{p.item_name}</strong></td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>{p.is_per_kg ? `₹${p.price_per_kg}/kg` : '—'}</td>
                    <td><span className={`badge badge--${p.active ? 'paid' : 'cancelled'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}>Edit</button>
                        {p.active && <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p)}>Deactivate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Price' : 'Add Price'}</h2>
            <div className="form-group">
              <label>Service Type</label>
              <select className="form-select" value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}>
                {SERVICES.map(s => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Item Name</label><input className="form-input" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} /></div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Price (₹ per unit)</label><input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="form-group"><label>Price per KG (₹)</label><input className="form-input" type="number" value={form.price_per_kg} onChange={e => setForm(f => ({ ...f, price_per_kg: e.target.value }))} /></div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <input type="checkbox" checked={form.is_per_kg} onChange={e => setForm(f => ({ ...f, is_per_kg: e.target.checked }))} />
                Charge per KG (weight-based)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>{editItem ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
