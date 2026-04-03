import React, { useState, useEffect } from 'react';
import { AdminGSTService } from '@/admin/services/AdminGSTService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { IndianRupee, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import type { GSTReportRow, GSTConfigForm } from '@/types';
import { INDIAN_STATES } from '@/constant/indianStates';
import env from '@/config/env';

const formatINR = (p: number) => `₹${(p / 100).toLocaleString('en-IN')}`;

const GSTPage: React.FC = () => {
  const [config, setConfig] = useState<GSTConfigForm>({ is_registered: true, gstin: '', business_name: '', state: 'Gujarat', state_code: '24', default_tax_type: 'intra_state', gst_on_sales: true, itc_tracking: true, rounding_precision: 2, rounding_method: 'normal' });
  const [gstr1, setGstr1] = useState<GSTReportRow[]>([]);
  const [gstr2, setGstr2] = useState<GSTReportRow[]>([]);
  const [itc, setItc] = useState({ total_available_paisa: 0, total_utilized_paisa: 0, balance_paisa: 0, monthly: [] as { month: string; available_paisa: number; utilized_paisa: number }[] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cfg, r1, r2, itcData] = await Promise.all([AdminGSTService.getConfig(), AdminGSTService.getGSTR1(), AdminGSTService.getGSTR2(), AdminGSTService.getITCSummary()]);
      setConfig({ is_registered: true, gstin: cfg.business_gstin, business_name: cfg.business_name, state: INDIAN_STATES.find(s => s.code === cfg.state_code)?.name || '', state_code: cfg.state_code, default_tax_type: cfg.default_tax_type, gst_on_sales: true, itc_tracking: true, rounding_precision: 2, rounding_method: 'normal' });
      setGstr1(r1); setGstr2(r2); setItc(itcData); setLoading(false);
    };
    load();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try { await AdminGSTService.updateConfig(config); toast.success('GST config saved'); }
    catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const filteredR1 = filterMonth === 'all' ? gstr1 : gstr1.filter(r => r.date.startsWith(filterMonth));
  const filteredR2 = filterMonth === 'all' ? gstr2 : gstr2.filter(r => r.date.startsWith(filterMonth));

  const sumField = (rows: GSTReportRow[], f: keyof GSTReportRow) => rows.reduce((s, r) => s + (r[f] as number), 0);

  const reportColumns: DataTableOneColumn<GSTReportRow>[] = [
    { key: 'inv', header: 'Invoice', render: r => <span className="text-[13px] font-mono text-primary">{r.invoice_number}</span> },
    { key: 'date', header: 'Date', render: r => <span className="text-[13px] text-muted-foreground">{format(new Date(r.date), 'dd MMM yyyy')}</span> },
    { key: 'party', header: 'Party', render: r => <span className="text-[13px] font-medium">{r.party_name}</span> },
    { key: 'hsn', header: 'HSN', render: r => <span className="text-[11px] font-mono text-muted-foreground">{r.hsn_code}</span> },
    { key: 'slab', header: 'Slab', render: r => <Badge variant="outline" className="text-[10px]">{r.gst_slab}%</Badge> },
    { key: 'taxable', header: 'Taxable', render: r => <span className="text-[13px]">{formatINR(r.taxable_paisa)}</span> },
    { key: 'cgst', header: 'CGST', render: r => <span className="text-[13px] text-muted-foreground">{formatINR(r.cgst_paisa)}</span> },
    { key: 'sgst', header: 'SGST', render: r => <span className="text-[13px] text-muted-foreground">{formatINR(r.sgst_paisa)}</span> },
    { key: 'total', header: 'Total', render: r => <span className="text-[13px] font-medium">{formatINR(r.total_paisa)}</span> },
  ];

  const monthOptions = [{ label: 'April 2024', value: '2024-04' }, { label: 'May 2024', value: '2024-05' }, { label: 'June 2024', value: '2024-06' }];

  const showDevTabs = env.IS_DEV_MODE;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">GST</h2>
      <Tabs defaultValue="config">
        <TabsList><TabsTrigger value="config">Configuration</TabsTrigger>{showDevTabs && <><TabsTrigger value="gstr1">GSTR-1</TabsTrigger><TabsTrigger value="gstr2">GSTR-2</TabsTrigger><TabsTrigger value="itc">ITC Summary</TabsTrigger></>}</TabsList>

        <TabsContent value="config" className="mt-4 max-w-xl space-y-4">
          <div className="flex items-center gap-3"><Switch checked={config.is_registered} onCheckedChange={v => setConfig(p => ({ ...p, is_registered: v }))} /><span className="text-sm">GST Registered</span></div>
          {config.is_registered && <>
            <Input placeholder="GSTIN" value={config.gstin} onChange={e => setConfig(p => ({ ...p, gstin: e.target.value }))} />
            <Input placeholder="Business Legal Name" value={config.business_name} onChange={e => setConfig(p => ({ ...p, business_name: e.target.value }))} />
            <Select value={config.state_code} onValueChange={v => { const st = INDIAN_STATES.find(s => s.code === v); setConfig(p => ({ ...p, state_code: v, state: st?.name || '' })); }}>
              <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
            </Select>
            <Select value={config.default_tax_type} onValueChange={v => setConfig(p => ({ ...p, default_tax_type: v as 'intra_state' | 'inter_state' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="intra_state">Intra-State (CGST + SGST)</SelectItem><SelectItem value="inter_state">Inter-State (IGST)</SelectItem></SelectContent>
            </Select>
            <div className="flex items-center gap-3"><Switch checked={config.gst_on_sales} onCheckedChange={v => setConfig(p => ({ ...p, gst_on_sales: v }))} /><span className="text-sm">Enable GST on Sales</span></div>
            <div className="flex items-center gap-3"><Switch checked={config.itc_tracking} onCheckedChange={v => setConfig(p => ({ ...p, itc_tracking: v }))} /><span className="text-sm">Enable ITC Tracking</span></div>
          </>}
          <Button onClick={saveConfig} disabled={saving}>{saving ? 'Saving...' : 'Save Configuration'}</Button>
        </TabsContent>

        <TabsContent value="gstr1" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{ l: 'Taxable Value', v: sumField(filteredR1, 'taxable_paisa') }, { l: 'CGST', v: sumField(filteredR1, 'cgst_paisa') }, { l: 'SGST', v: sumField(filteredR1, 'sgst_paisa') }, { l: 'IGST', v: sumField(filteredR1, 'igst_paisa') }].map(s => (
              <Card key={s.l} className="p-4"><p className="text-[11px] text-muted-foreground">{s.l}</p><p className="text-lg font-bold text-foreground">{formatINR(s.v)}</p></Card>
            ))}
          </div>
          <DataTableOne columns={reportColumns} data={filteredR1} keyExtractor={r => r.id} loading={loading} emptyMessage="No data"
            filters={[{ key: 'month', label: 'Month', value: filterMonth, options: monthOptions, onChange: setFilterMonth }]}
          />
        </TabsContent>

        <TabsContent value="gstr2" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{ l: 'Taxable Value', v: sumField(filteredR2, 'taxable_paisa') }, { l: 'CGST', v: sumField(filteredR2, 'cgst_paisa') }, { l: 'SGST', v: sumField(filteredR2, 'sgst_paisa') }, { l: 'IGST', v: sumField(filteredR2, 'igst_paisa') }].map(s => (
              <Card key={s.l} className="p-4"><p className="text-[11px] text-muted-foreground">{s.l}</p><p className="text-lg font-bold text-foreground">{formatINR(s.v)}</p></Card>
            ))}
          </div>
          <DataTableOne columns={reportColumns} data={filteredR2} keyExtractor={r => r.id} loading={loading} emptyMessage="No data"
            filters={[{ key: 'month', label: 'Month', value: filterMonth, options: monthOptions, onChange: setFilterMonth }]}
          />
        </TabsContent>

        <TabsContent value="itc" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4"><p className="text-[11px] text-muted-foreground">ITC Available</p><p className="text-lg font-bold text-success">{formatINR(itc.total_available_paisa)}</p></Card>
            <Card className="p-4"><p className="text-[11px] text-muted-foreground">ITC Utilized</p><p className="text-lg font-bold text-foreground">{formatINR(itc.total_utilized_paisa)}</p></Card>
            <Card className="p-4"><p className="text-[11px] text-muted-foreground">ITC Balance</p><p className="text-lg font-bold text-primary">{formatINR(itc.balance_paisa)}</p></Card>
          </div>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-4">Monthly ITC Trend</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itc.monthly.map(m => ({ month: m.month.split(' ')[0], available: m.available_paisa / 100, utilized: m.utilized_paisa / 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-[11px]" />
                  <YAxis className="text-[11px]" />
                  <ReTooltip />
                  <Bar dataKey="available" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Available" />
                  <Bar dataKey="utilized" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Utilized" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-[13px]"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3">Month</th><th className="text-right p-3">Available</th><th className="text-right p-3">Utilized</th><th className="text-right p-3">Balance</th></tr></thead>
              <tbody>{itc.monthly.map(m => <tr key={m.month} className="border-b last:border-0"><td className="p-3">{m.month}</td><td className="p-3 text-right">{formatINR(m.available_paisa)}</td><td className="p-3 text-right">{formatINR(m.utilized_paisa)}</td><td className="p-3 text-right font-medium">{formatINR(m.available_paisa - m.utilized_paisa)}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSTPage;
