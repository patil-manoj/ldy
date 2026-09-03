import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSettings, updateSetting } from '../api';

const SETTING_LABELS = {
  shop_name: 'Shop Name',
  shop_phone: 'Shop Phone',
  shop_address: 'Shop Address',
  gst_number: 'GST Number (GSTIN)',
  gst_enabled: 'GST Enabled (true/false)',
  gst_rate: 'GST Rate (%)',
  express_multiplier: 'Express Price Multiplier',
  min_order_value: 'Minimum Order Value (₹)',
  default_delivery_charge: 'Default Delivery Charge (₹)',
  next_order_number: 'Next Order Number',
  financial_year: 'Financial Year (e.g. 2526)',
};

const SETTING_GROUPS = {
  'Shop Info': ['shop_name', 'shop_phone', 'shop_address'],
  'GST & Tax': ['gst_enabled', 'gst_number', 'gst_rate'],
  'Pricing Rules': ['express_multiplier', 'min_order_value', 'default_delivery_charge'],
  'System': ['next_order_number', 'financial_year'],
};

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [edited, setEdited] = useState({});

  useEffect(() => {
    getSettings().then(list => {
      const map = {};
      list.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
      setEdited(map);
    }).catch(console.error);
  }, []);

  const handleSave = async (key) => {
    if (edited[key] === settings[key]) return;
    try {
      await updateSetting(key, edited[key]);
      setSettings(s => ({ ...s, [key]: edited[key] }));
      toast.success(`${SETTING_LABELS[key] || key} updated`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {Object.entries(SETTING_GROUPS).map(([group, keys]) => (
        <div className="card" key={group} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{group}</h3>
          {keys.map(key => (
            <div className="form-row" key={key} style={{ marginBottom: '.75rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label>{SETTING_LABELS[key] || key}</label>
                <input className="form-input" value={edited[key] || ''} onChange={e => setEdited(s => ({ ...s, [key]: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 0 }}>
                <button
                  className={`btn btn--sm ${edited[key] !== settings[key] ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => handleSave(key)}
                  disabled={edited[key] === settings[key]}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="card" style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
        <h3 style={{ color: '#991b1b', marginBottom: '.5rem' }}>About</h3>
        <p style={{ color: '#7f1d1d', fontSize: '.9rem' }}>
          Wash Nest Billing v2.0 — Local offline billing system for laundry businesses in India.
          <br />All data is stored locally in SQLite. No internet required for core operations.
        </p>
      </div>
    </>
  );
}
