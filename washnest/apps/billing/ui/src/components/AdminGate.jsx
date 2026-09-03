import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';
import { DEFAULT_ADMIN_PASSWORD, getAuthStatus, loginAdmin, logoutAdmin } from '../api';

export default function AdminGate({ children }) {
  const [status, setStatus] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAuthStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: true, authenticated: false }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 10) {
      toast.error('Use at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const nextStatus = await loginAdmin(password);
      setStatus(nextStatus);
      setPassword('');
      toast.success('Admin unlocked');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setStatus((current) => ({ ...current, authenticated: false }));
    toast.success('Admin locked');
  };

  if (!status) {
    return <div className="admin-loading"><ShieldCheck size={22} aria-hidden="true" /> Checking admin access…</div>;
  }

  if (!status.authenticated) {
    return (
      <section className="admin-gate" aria-labelledby="admin-gate-title">
        <div className="admin-gate__mark"><LockKeyhole size={26} aria-hidden="true" /></div>
        <p className="eyebrow">Protected administration</p>
        <h1 id="admin-gate-title">Unlock admin</h1>
        <p className="admin-gate__intro">Enter the local password to manage bills, prices, and business settings.</p>
        {/* {status.uses_default_password && (
          <p className="admin-gate__default">Default password: <code>{DEFAULT_ADMIN_PASSWORD}</code></p>
        )} */}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-password">Admin password</label>
            <div className="password-input">
              <KeyRound size={18} aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                minLength={10}
                maxLength={128}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button className="btn btn--primary btn--lg admin-gate__submit" type="submit" disabled={submitting}>
            <ShieldCheck size={18} aria-hidden="true" />
            {submitting ? 'Please wait…' : 'Unlock admin'}
          </button>
        </form>
        <p className="admin-gate__footnote">Five failed attempts pause login for 15 minutes on this device.</p>
      </section>
    );
  }

  return (
    <>
      <div className="admin-sessionbar">
        <span><ShieldCheck size={17} aria-hidden="true" /> Admin unlocked</span>
        <button type="button" onClick={handleLogout}><LogOut size={15} aria-hidden="true" /> Lock</button>
      </div>
      {children}
    </>
  );
}