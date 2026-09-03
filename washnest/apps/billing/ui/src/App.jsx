import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  BarChart3,
  ClipboardList,
  FileX2,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings as SettingsIcon,
  ShieldCheck,
  Tags,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import InvoiceDesk from './pages/InvoiceDesk';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import PriceListPage from './pages/PriceListPage';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminBills from './pages/AdminBills';
import AdminGate from './components/AdminGate';
import { logoutAdmin } from './api';

const ADMIN_ROUTE_PREFIXES = ['/admin', '/prices', '/settings'];

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/orders/new', icon: ReceiptText, label: 'New bill', primary: true },
      { to: '/orders', icon: ClipboardList, label: 'Orders' },
      { to: '/customers', icon: Users, label: 'Customers' },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/expenses', icon: WalletCards, label: 'Expenses' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/bills', icon: FileX2, label: 'Manage bills' },
      { to: '/prices', icon: Tags, label: 'Price list' },
      { to: '/settings', icon: SettingsIcon, label: 'Admin settings' },
    ],
  },
];

export default function App() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const isAdminRoute = ADMIN_ROUTE_PREFIXES.some((prefix) => (
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  ));

  useEffect(() => {
    if (!isAdminRoute) logoutAdmin();
  }, [isAdminRoute]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '8px', color: '#172554', fontWeight: 600 },
        }}
      />
      <div className="layout">
        <header className="mobile-header">
          <div className="brand brand--mobile">
            <span className="brand__mark"><img src="/favicon.png" alt="" /></span>
            <span>Wash Nest</span>
          </div>
          <button className="icon-button" type="button" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu size={22} aria-hidden="true" />
          </button>
        </header>

        <aside className={`sidebar${navOpen ? ' sidebar--open' : ''}`}>
          <div className="sidebar__top">
            <div className="brand">
              <span className="brand__mark"><img src="/favicon.png" alt="" /></span>
              <span className="brand__copy">
                <strong>Wash Nest</strong>
                <small>Billing desk</small>
              </span>
            </div>
            <button className="icon-button sidebar__close" type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation">
              <X size={21} aria-hidden="true" />
            </button>
          </div>

          <nav className="sidebar__nav" aria-label="Main navigation">
            {NAV_GROUPS.map((group) => (
              <div className="nav-group" key={group.label}>
                <p className="nav-group__label">{group.label}</p>
                <ul>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === '/orders' && location.pathname === '/orders/new'}
                          onClick={() => setNavOpen(false)}
                          className={({ isActive }) => [
                            'sidebar__link',
                            item.primary ? 'sidebar__link--primary' : '',
                            isActive ? 'sidebar__link--active' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <Icon size={18} strokeWidth={2} aria-hidden="true" />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="sidebar__footer">
            <ShieldCheck size={17} aria-hidden="true" />
            <span><strong>Local workspace</strong><small>Data stays on this device</small></span>
          </div>
        </aside>

        {navOpen && <button className="nav-scrim" type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation" />}

        <main className="main" id="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<InvoiceDesk />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/admin/bills" element={<AdminGate><AdminBills /></AdminGate>} />
            <Route path="/prices" element={<AdminGate><PriceListPage /></AdminGate>} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<AdminGate><Settings /></AdminGate>} />
          </Routes>
        </main>
      </div>
    </>
  );
}
