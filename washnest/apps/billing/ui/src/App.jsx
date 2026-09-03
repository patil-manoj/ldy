import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import PriceListPage from './pages/PriceListPage';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/orders', icon: '📋', label: 'Orders' },
  { to: '/orders/new', icon: '➕', label: 'New Order' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/prices', icon: '🏷️', label: 'Price List' },
  { to: '/expenses', icon: '🧾', label: 'Expenses' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar__logo">🧺 Wash Nest</div>
          <ul className="sidebar__nav">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                  }
                >
                  <span>{n.icon}</span> <span>{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<NewOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/prices" element={<PriceListPage />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
