import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">This page is under construction.</p>
    </div>
  </div>
);

export { POSLoginPage as POSLogin } from './POSLoginPage';
export { POSTerminalPage as POSTerminal } from './POSTerminalPage';
export { POSReportsPage as POSReports } from './POSReportsPage';

export const POSSales = () => <PlaceholderPage title="Sales Invoices" />;
export const POSSaleDetail = () => <PlaceholderPage title="Invoice Detail" />;
export const POSSalesReturns = () => <PlaceholderPage title="Sales Returns" />;
export const POSSalesReturnDetail = () => <PlaceholderPage title="Sales Return Detail" />;
export const POSPurchases = () => <PlaceholderPage title="Purchases" />;
export const POSPurchaseDetail = () => <PlaceholderPage title="Purchase Detail" />;
export const POSPurchaseReturns = () => <PlaceholderPage title="Purchase Returns" />;
export const POSPurchaseReturnDetail = () => <PlaceholderPage title="Purchase Return Detail" />;
export const POSInventoryFinished = () => <PlaceholderPage title="Finished Goods" />;
export const POSInventoryRaw = () => <PlaceholderPage title="Raw Materials" />;
export const POSInventoryMovements = () => <PlaceholderPage title="Stock Movements" />;
export const POSRecipes = () => <PlaceholderPage title="Recipes" />;
export const POSProduction = () => <PlaceholderPage title="Production Orders" />;
export const POSProductionDetail = () => <PlaceholderPage title="Production Detail" />;
export const POSSuppliers = () => <PlaceholderPage title="Suppliers" />;
export const POSRawMaterials = () => <PlaceholderPage title="Raw Materials Master" />;
export const POSEmployees = () => <PlaceholderPage title="Employees" />;
export const POSEmployeeDetail = () => <PlaceholderPage title="Employee Detail" />;
export const POSAttendance = () => <PlaceholderPage title="Attendance" />;
export const POSSalary = () => <PlaceholderPage title="Salary" />;
export const POSJournal = () => <PlaceholderPage title="Journal Entries" />;
export const POSSupplierLedger = () => <PlaceholderPage title="Supplier Ledger" />;
export const POSCustomerLedger = () => <PlaceholderPage title="Customer Ledger" />;
export const POSExpenses = () => <PlaceholderPage title="Expenses" />;
export const POSBank = () => <PlaceholderPage title="Bank Reconciliation" />;
export const POSGST = () => <PlaceholderPage title="GST" />;
export const POSCoupons = () => <PlaceholderPage title="Coupons" />;
export const POSUnits = () => <PlaceholderPage title="Units" />;
export const POSStaff = () => <PlaceholderPage title="Staff" />;
export const POSRoles = () => <PlaceholderPage title="Roles & Permissions" />;
export const POSClosingReport = () => <PlaceholderPage title="Daily Closing" />;
