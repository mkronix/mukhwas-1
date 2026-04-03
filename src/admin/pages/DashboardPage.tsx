import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/admin/hooks/useDashboard';
import { useStaffBasePath } from '@/shared/hooks/useSurface';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingCart, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { formatINRWhole as formatINR } from '@/lib/format';

const CHART_COLORS = [
  'hsl(217, 91%, 60%)', 'hsl(152, 76%, 40%)', 'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)', 'hsl(280, 65%, 60%)', 'hsl(190, 80%, 45%)',
];

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, loading, onClick }) => (
  <Card
    className={`p-5 border border-border ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    {loading ? (
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}% vs last week
          </div>
        )}
      </>
    )}
  </Card>
);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const basePath = useStaffBasePath();
  const { stats, revenueChart, categoryRevenue, lowStockItems, recentOrders, loading } = useDashboard();

  const statusColor: Record<string, string> = {
    placed: 'bg-info/10 text-info', confirmed: 'bg-primary/10 text-primary',
    packed: 'bg-warning/10 text-warning', shipped: 'bg-info/10 text-info',
    delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue" value={stats ? formatINR(stats.todayRevenue) : '—'}
          trend={stats?.revenueTrend} icon={<IndianRupee className="h-4 w-4" />} loading={loading}
        />
        <StatCard
          title="Orders Today" value={stats?.ordersToday?.toString() ?? '—'}
          trend={stats?.ordersTrend} icon={<ShoppingCart className="h-4 w-4" />} loading={loading}
        />
        <StatCard
          title="Low Stock Items" value={stats?.lowStockCount?.toString() ?? '—'}
          icon={<AlertTriangle className="h-4 w-4" />} loading={loading}
          onClick={() => navigate(`${basePath}/products`)}
        />
        <StatCard
          title="Pending Orders" value={stats?.pendingOrders?.toString() ?? '—'}
          icon={<Clock className="h-4 w-4" />} loading={loading}
          onClick={() => navigate(`${basePath}/orders`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-2 p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue (Last 30 Days)</h3>
          </div>
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => format(new Date(v), 'dd')} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${(v/100).toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  labelFormatter={(v) => format(new Date(v), 'MMM dd, yyyy')}
                  formatter={(v: number) => [formatINR(v), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Category</h3>
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryRevenue.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
            <button onClick={() => navigate(`${basePath}/orders`)} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => {
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{order.order_number}</p>
                    <p className="text-[11px] text-muted-foreground">{order.customer_name} · {format(new Date(order.created_at), 'MMM dd, HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-foreground">{formatINR(order.total_paisa)}</span>
                    <Badge variant="secondary" className={`text-[10px] ${statusColor[order.status] ?? ''}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
          </div>
          {lowStockItems.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">All stock levels are healthy</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{item.productName}</p>
                    <p className="text-[11px] text-muted-foreground">{item.variantName} · SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[13px] font-semibold ${item.currentStock === 0 ? 'text-destructive' : 'text-warning'}`}>
                      {item.currentStock} left
                    </p>
                    <p className="text-[11px] text-muted-foreground">Reorder: {item.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
