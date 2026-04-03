import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/admin/auth/useAdminAuth';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-xl">M</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to Mukhwas Commerce OS</p>
      </div>
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mukhwas.com" className="pl-10" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-12" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in...' : 'Sign In'}</Button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/admin/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
      </div>
    </div>
  );
};

const AdminForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-success" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Check Your Email</h1>
        <p className="text-sm text-muted-foreground mb-6">We've sent reset instructions to <strong>{email}</strong></p>
        <Link to="/admin/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email to receive reset instructions</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mukhwas.com" className="pl-10" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send Reset Link'}</Button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/admin/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </div>
    </div>
  );
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">This page is under construction.</p>
    </div>
  </div>
);

export { default as AdminDashboard } from './DashboardPage';
export { default as AdminProducts } from './ProductsPage';
export { default as AdminCategories } from './CategoriesPage';
export { default as AdminOrders } from './OrdersPage';
export { default as AdminCustomers } from './CustomersPage';
export { default as AdminContent } from './ContentPage';
export { AdminStaffPage as AdminStaff } from './StaffPage';
export { AdminRolesPage as AdminRoles } from './AdminRolesPage'
export { default as AdminUnits } from './UnitsPage';
export { default as AdminInventoryFinished } from './FinishedGoodsPage';
export { default as AdminInventoryRaw } from './RawMaterialsPage';
export { default as AdminInventoryMovements } from './StockMovementsPage';
export { default as AdminRecipes } from './RecipesPage';
export { default as AdminProduction } from './ProductionPage';
export { default as AdminSuppliers } from './SuppliersPage';
export { default as AdminPurchases } from './PurchasesPage';
export { default as AdminGST } from './GSTPage';
export { default as AdminJournal } from './JournalPage';
export { default as AdminSupplierLedger } from './SupplierLedgerPage';
export { default as AdminCustomerLedger } from './CustomerLedgerPage';
export { default as AdminExpenses } from './ExpensesPage';
export { default as AdminBankReconciliation } from './BankReconciliationPage';
export { default as AdminSalary } from './SalaryPage';
export { default as AdminLeads } from './LeadsPage';
export { default as AdminReports } from './ReportsPage';
export { default as AdminConfig } from './SettingsPage';

export const AdminLogin = AdminLoginPage;
export const AdminForgotPassword = AdminForgotPasswordPage;
export const AdminOrderDetail = () => <PlaceholderPage title="Order Detail" />;
export const AdminReturns = () => <PlaceholderPage title="Returns" />;
export const AdminCoupons = () => <PlaceholderPage title="Coupons" />;
export const AdminPayments = () => <PlaceholderPage title="Payments" />;
