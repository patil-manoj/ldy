import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Calculator, Database, Download, Hash, KeyRound, Save, ShieldCheck, Upload } from 'lucide-react';
import {
  changeAdminPassword,
  exportBackup,
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
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [dataCounts, setDataCounts] = useState(null);
  const [transferringData, setTransferringData] = useState(false);
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

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwords.next.length < 10) {
      toast.error('Use at least 10 characters for the new password');
      return;
    }
    if (passwords.next !== passwords.confirmation) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await changeAdminPassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirmation: '' });
      toast.success('Admin password changed');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChangingPassword(false);
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

      <section className="settings-section password-section">
        <div className="settings-section__heading">
          <span><KeyRound size={19} aria-hidden="true" /></span>
          <div><h2>Admin password</h2><p>Changing it requires your current password.</p></div>
        </div>
        <form onSubmit={handlePasswordChange}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current-password">Current password</label>
              <input id="current-password" type="password" autoComplete="current-password" className="form-input" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength="10" className="form-input" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <input id="confirm-new-password" type="password" autoComplete="new-password" minLength="10" className="form-input" value={passwords.confirmation} onChange={(event) => setPasswords((current) => ({ ...current, confirmation: event.target.value }))} />
            </div>
          </div>
          <button className="btn btn--ghost" type="submit" disabled={!passwords.current || !passwords.next || changingPassword}>
            <KeyRound size={16} aria-hidden="true" /> {changingPassword ? 'Changing…' : 'Change password'}
          </button>
        </form>
      </section>

      <section className="settings-section data-section">
        <div className="settings-section__heading">
          <span><Database size={19} aria-hidden="true" /></span>
          <div><h2>Local data</h2><p>Billing records stored in this browser.</p></div>
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
        <p className="data-warning">Export before clearing browser data or moving to another device. The admin password is not included.</p>
      </section>
    </div>
  );
}
