import React from 'react';
import { useStorefrontReturns } from '@/storefront/hooks/useStorefrontReturns';
import { formatPrice } from '@/lib/format';

const statusColor: Record<string, string> = {
  requested: 'bg-warning-muted text-warning', approved: 'bg-info-muted text-info',
  received: 'bg-info-muted text-info', refunded: 'bg-success-muted text-success', rejected: 'bg-destructive-muted text-destructive',
};

const AccountReturnsPage: React.FC = () => {
  const { returns, loading } = useStorefrontReturns();

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-6">Returns</h1>
      {returns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-bold text-foreground">No returns</p>
          <p className="text-sm text-muted-foreground mt-2">You haven't made any return requests.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {returns.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Return #{r.id.replace('ret_', '')}</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${statusColor[r.status]}`}>{r.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.reason}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>Type: <span className="capitalize">{r.type.replace(/_/g, ' ')}</span></span>
                {r.refund_amount_paisa > 0 && <span>Refund: {formatPrice(r.refund_amount_paisa)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountReturnsPage;
