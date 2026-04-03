import React, { useState, useMemo } from 'react';
import { mockPOSTransactions, mockPOSClosingReports, posStaff } from '@/pos/mock';
import { formatINR } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type TabKey = 'today' | 'week' | 'month';

const tabRanges: Record<TabKey, () => { start: Date; end: Date }> = {
  today: () => {
    const s = new Date(); s.setHours(0,0,0,0);
    const e = new Date(); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  week: () => {
    const e = new Date(); e.setHours(23,59,59,999);
    const s = new Date(e); s.setDate(s.getDate() - 6); s.setHours(0,0,0,0);
    return { start: s, end: e };
  },
  month: () => {
    const e = new Date(); e.setHours(23,59,59,999);
    const s = new Date(e); s.setDate(s.getDate() - 29); s.setHours(0,0,0,0);
    return { start: s, end: e };
  },
};

export const POSReportsPage: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('today');

  const { start, end } = tabRanges[tab]();
  const txns = useMemo(() => mockPOSTransactions.filter(t => {
    const d = new Date(t.timestamp);
    return d >= start && d <= end;
  }), [tab]);

  const totalRevenue = txns.reduce((s, t) => s + t.total_paisa, 0);
  const avgTxn = txns.length > 0 ? Math.round(totalRevenue / txns.length) : 0;
  const closings = useMemo(() => mockPOSClosingReports.filter(c => {
    const d = new Date(c.timestamp);
    return d >= start && d <= end;
  }), [tab]);
  const totalVariance = closings.reduce((s, c) => s + c.variance_paisa, 0);

  const chartData = useMemo(() => {
    if (tab === 'today') {
      const hourMap = new Map<number, number>();
      for (let h = 6; h <= 22; h++) hourMap.set(h, 0);
      txns.forEach(t => {
        const h = new Date(t.timestamp).getHours();
        hourMap.set(h, (hourMap.get(h) || 0) + t.total_paisa);
      });
      return [...hourMap.entries()].map(([hour, amount]) => ({
        label: `${hour}:00`,
        revenue: amount / 100,
      }));
    } else {
      const dayMap = new Map<string, number>();
      const current = new Date(start);
      while (current <= end) {
        dayMap.set(current.toISOString().split('T')[0], 0);
        current.setDate(current.getDate() + 1);
      }
      txns.forEach(t => {
        const d = new Date(t.timestamp).toISOString().split('T')[0];
        dayMap.set(d, (dayMap.get(d) || 0) + t.total_paisa);
      });
      return [...dayMap.entries()].map(([date, amount]) => ({
        label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: amount / 100,
      }));
    }
  }, [txns, tab]);

  const staffName = (id: string) => posStaff.find(s => s.id === id)?.name || id;

  const exportCSV = () => {
    const rows = [['Time', 'Customer', 'Items', 'Payment', 'Total', 'Receipt'].join(',')];
    txns.forEach(t => {
      rows.push([
        new Date(t.timestamp).toLocaleString('en-IN'),
        t.customer_name || 'Walk-in',
        String(t.items.reduce((s, i) => s + i.quantity, 0)),
        t.payment_mode,
        (t.total_paisa / 100).toFixed(2),
        t.id,
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-transactions-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), color: 'text-primary' },
    { label: 'Transactions', value: String(txns.length), color: 'text-foreground' },
    { label: 'Avg Transaction', value: formatINR(avgTxn), color: 'text-foreground' },
    { label: 'Cash Variance', value: `${totalVariance >= 0 ? '+' : ''}${formatINR(totalVariance)}`, color: totalVariance === 0 ? 'text-success' : 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">POS Reports</h1>
        <button onClick={exportCSV} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">Export CSV</button>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(['today', 'week', 'month'] as TabKey[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-4">Revenue {tab === 'today' ? 'by Hour' : 'by Day'}</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Transaction Log</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Customer</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Items</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Payment</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No transactions</td></tr>
              ) : txns.map(t => (
                <tr key={t.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-2.5 text-foreground">{new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2.5 text-foreground">{t.customer_name || 'Walk-in'}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-2.5 capitalize text-foreground">{t.payment_mode}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground">{formatINR(t.total_paisa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Cash Reconciliation History</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cashier</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Expected</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actual</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Variance</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {closings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No records</td></tr>
              ) : closings.map(c => (
                <tr key={c.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-2.5 text-foreground">{new Date(c.timestamp).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-2.5 text-foreground">{staffName(c.staff_id)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatINR(c.expected_cash_paisa)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatINR(c.actual_cash_paisa)}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${c.variance_paisa === 0 ? 'text-success' : 'text-destructive'}`}>
                    {c.variance_paisa >= 0 ? '+' : ''}{formatINR(c.variance_paisa)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.variance_paisa === 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {c.variance_paisa === 0 ? 'Balanced' : 'Variance'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
