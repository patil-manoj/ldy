import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Calculator, Database, Download, Hash, Save, ShieldCheck, Upload } from 'lucide-react';
import {
  deleteArchivedOrders,
  exportBackup,
  exportArchivedOrders,
  getDataCounts,
  getSettings,
  importBackup,
  updateSetting,
} from '../api';
import { settingsToObject } from '../lib/billing';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [edited, setEdited] = useState({});
  const [saving, setSaving] = useState(false);
  const [dataCounts, setDataCounts] = useState(null);
  const [transferringData, setTransferringData] = useState(false);
  const [archiveUntil, setArchiveUntil] = useState('');
  const restoreInputRef = useRef(null);

  useEffect(() => {
    getSettings().then((list) => {
      const mappedSettings = settingsToObject(list);
      setSettings(mappedSettings);
      setEdited(mappedSettings);
    }).catch(() => toast.error('Could not load settings'));
    getDataCounts().then(setDataCounts).catch(console.error);
  }, []);

  const updateField = (key, value) => setEdited((current) => ({ ...current, [key]: value }));
  const dirtyKeys = Object.keys(edited).filter((key) => edited[key] !== settings[key]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(dirtyKeys.map((key) => updateSetting(key, edited[key])));
      setSettings({ ...edited });
      toast.success('Business settings saved');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setTransferringData(true);
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `washnest-backup-${backup.exported_at.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTransferringData(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !confirm('Replace all billing records on this device with this backup?')) return;

    setTransferringData(true);
    try {
      const counts = await importBackup(await file.text());
      setDataCounts(counts);
      toast.success('Backup restored. Reloading…');
      setTimeout(() => globalThis.location.reload(), 700);
    } catch (error) {
      toast.error(error instanceof SyntaxError ? 'The selected file is not valid JSON' : error.message);
      setTransferringData(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveUntil) {
      toast.error('Choose an archive date');
      return;
    }
    setTransferringData(true);
    try {
      const archive = await exportArchivedOrders(archiveUntil);
      if (!archive.data.orders.length) throw new Error('No delivered orders found before that date');
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `washnest-orders-archive-${archiveUntil}.json`;
      link.click();
      URL.revokeObjectURL(url);
      if (confirm(`Downloaded ${archive.data.orders.length} orders. Delete them from Supabase?`)) {
        await deleteArchivedOrders(archiveUntil);
        toast.success('Archived orders deleted from Supabase');
        setTimeout(() => globalThis.location.reload(), 700);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTransferringData(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <p className="eyebrow"><ShieldCheck size={14} aria-hidden="true" /> Protected administration</p>
          <h1>Business settings</h1>
        </div>
        <button className="btn btn--primary" type="submit" form="business-settings" disabled={dirtyKeys.length === 0 || saving}>
          <Save size={17} aria-hidden="true" /> {saving ? 'Saving…' : `Save changes${dirtyKeys.length ? ` (${dirtyKeys.length})` : ''}`}
        </button>
      </div>

      <form id="business-settings" onSubmit={handleSave} className="settings-layout">
        <section className="settings-section">
          <div className="settings-section__heading">
            <span><Building2 size={19} aria-hidden="true" /></span>
            <div><h2>Shop details</h2><p>Shown on receipts and customer messages.</p></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shop-name">Business name</label>
              <input id="shop-name" className="form-input" value={edited.shop_name || ''} onChange={(event) => updateField('shop_name', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="shop-phone">Phone number</label>
              <input id="shop-phone" className="form-input" inputMode="tel" value={edited.shop_phone || ''} onChange={(event) => updateField('shop_phone', event.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="shop-address">Business address</label>
            <textarea id="shop-address" className="form-input settings-textarea" rows="3" value={edited.shop_address || ''} onChange={(event) => updateField('shop_address', event.target.value)} />
          </div>
          <label className="settings-toggle">
            <span><strong>Show token number field</strong><small>Keep the optional internal token available when creating bills.</small></span>
            <input type="checkbox" checked={edited.token_number_enabled !== 'false'} onChange={(event) => updateField('token_number_enabled', String(event.target.checked))} />
            <span className="toggle"><span /></span>
          </label>
        </section>

        <section className="settings-section">
          <div className="settings-section__heading">
            <span><Calculator size={19} aria-hidden="true" /></span>
            <div><h2>Billing rules</h2><p>Applied automatically to every new bill.</p></div>
          </div>

          <label className="settings-toggle">
            <span><strong>GST invoicing</strong><small>Add GST and GSTIN to bills when enabled.</small></span>
            <input type="checkbox" checked={edited.gst_enabled === 'true'} onChange={(event) => updateField('gst_enabled', String(event.target.checked))} />
            <span className="toggle"><span /></span>
          </label>

          {edited.gst_enabled === 'true' && (
            <div className="form-row settings-conditional">
              <div className="form-group">
                <label htmlFor="gst-number">GSTIN</label>
                <input id="gst-number" className="form-input" value={edited.gst_number || ''} onChange={(event) => updateField('gst_number', event.target.value.toUpperCase())} />
              </div>
              <div className="form-group">
                <label htmlFor="gst-rate">GST rate (%)</label>
                <input id="gst-rate" type="number" min="0" max="100" step="0.01" className="form-input" value={edited.gst_rate || ''} onChange={(event) => updateField('gst_rate', event.target.value)} />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="express-multiplier">Express multiplier</label>
              <input id="express-multiplier" type="number" min="1" step="0.1" className="form-input" value={edited.express_multiplier || ''} onChange={(event) => updateField('express_multiplier', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="delivery-charge">Default delivery charge (₹)</label>
              <input id="delivery-charge" type="number" min="0" step="1" className="form-input" value={edited.default_delivery_charge || ''} onChange={(event) => updateField('default_delivery_charge', event.target.value)} />
            </div>
          </div>
        </section>

        <details className="settings-section settings-advanced">
          <summary>
            <span><Hash size={19} aria-hidden="true" /></span>
            <span><strong>Bill numbering</strong><small>Change only when starting a new financial sequence.</small></span>
          </summary>
          <div className="form-row settings-advanced__body">
            <div className="form-group">
              <label htmlFor="financial-year">Financial year code</label>
              <input id="financial-year" className="form-input" maxLength="8" value={edited.financial_year || ''} onChange={(event) => updateField('financial_year', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="next-order-number">Next bill number</label>
              <input id="next-order-number" type="number" min="1" className="form-input" value={edited.next_order_number || ''} onChange={(event) => updateField('next_order_number', event.target.value)} />
            </div>
          </div>
        </details>
      </form>

      <section className="settings-section data-section">
        <div className="settings-section__heading">
          <span><Database size={19} aria-hidden="true" /></span>
          <div><h2>Cloud data</h2><p>Billing records stored in Supabase.</p></div>
        </div>
        <div className="data-summary" aria-label="Local record counts">
          <span><strong>{dataCounts?.orders ?? '—'}</strong> bills</span>
          <span><strong>{dataCounts?.customers ?? '—'}</strong> customers</span>
          <span><strong>{dataCounts?.expenses ?? '—'}</strong> expenses</span>
        </div>
        <div className="data-actions">
          <button className="btn btn--primary" type="button" onClick={handleExport} disabled={transferringData}>
            <Download size={17} aria-hidden="true" /> Download backup
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => restoreInputRef.current?.click()} disabled={transferringData}>
            <Upload size={17} aria-hidden="true" /> Restore backup
          </button>
          <input ref={restoreInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={handleRestore} />
        </div>
        <div className="archive-actions">
          <label htmlFor="archive-until">Archive delivered orders through</label>
          <input id="archive-until" type="date" className="form-input" value={archiveUntil} onChange={(event) => setArchiveUntil(event.target.value)} />
          <button className="btn btn--ghost" type="button" onClick={handleArchive} disabled={transferringData}>
            <Download size={17} aria-hidden="true" /> Download and archive orders
          </button>
        </div>
        <p className="data-warning">Verify the downloaded archive before deleting cloud records. Archived orders include items, payments, and status history.</p>
      </section>
    </div>
  );
}
