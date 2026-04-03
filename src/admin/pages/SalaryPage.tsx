import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DatePicker } from '@/admin/components/DatePicker';
import { AdminSalaryService } from '@/admin/services/SalaryService';
import { StaffService } from '@/admin/services/StaffService';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn, DataTableOneFilter } from '@/components/ui/data-table';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { format, getDaysInMonth } from 'date-fns';
import type { Staff } from '@/types';
import type { SalaryStructureRecord, SalaryRecord } from '@/types';

const fmt = (p: number) => `₹${(p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const SalaryPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('calculate');

  const [selectedStaff, setSelectedStaff] = useState('');
  const [structure, setStructure] = useState<SalaryStructureRecord | null>(null);
  const [advanceBalance, setAdvanceBalance] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [daysWorked, setDaysWorked] = useState('');
  const [overtime, setOvertime] = useState('');
  const [advanceDeduction, setAdvanceDeduction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRecord, setExportRecord] = useState<SalaryRecord | null>(null);

  const [historyStaff, setHistoryStaff] = useState('all');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const s = await StaffService.getAll();
      setStaff(s);
    } finally { setLoading(false); }
  }, []);

  const loadRecords = useCallback(async () => {
    const r = await AdminSalaryService.getSalaryRecords(historyStaff === 'all' ? undefined : historyStaff);
    setRecords(r);
  }, [historyStaff]);

  useEffect(() => { loadStaff(); }, [loadStaff]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  useEffect(() => {
    if (!selectedStaff) { setStructure(null); setAdvanceBalance(0); return; }
    (async () => {
      const [s, a] = await Promise.all([AdminSalaryService.getCurrentStructure(selectedStaff), AdminSalaryService.getOutstandingAdvance(selectedStaff)]);
      setStructure(s); setAdvanceBalance(a);
    })();
  }, [selectedStaff]);

  const daysInMonth = useMemo(() => {
    if (!periodStart) return 30;
    const d = new Date(periodStart);
    return getDaysInMonth(d);
  }, [periodStart]);

  const days = parseFloat(daysWorked) || 0;
  const otPaisa = Math.round((parseFloat(overtime) || 0) * 100);
  const advDed = Math.min(Math.round((parseFloat(advanceDeduction) || 0) * 100), advanceBalance);

  const earned = useMemo(() => {
    if (!structure || days <= 0) return 0;
    if (structure.type === 'fixed_monthly') {
      const dailyRate = Math.round(structure.amount_paisa / daysInMonth);
      return dailyRate * days;
    }
    return structure.amount_paisa * days;
  }, [structure, days, daysInMonth]);

  const dailyRate = useMemo(() => {
    if (!structure) return 0;
    return structure.type === 'fixed_monthly' ? Math.round(structure.amount_paisa / daysInMonth) : structure.amount_paisa;
  }, [structure, daysInMonth]);

  const netPayable = earned + otPaisa - advDed;

  const handleGenerate = async () => {
    if (!selectedStaff || !periodStart || !periodEnd || days <= 0 || !structure) { toast.error('Fill all required fields'); return; }
    setGenerating(true);
    try {
      const staffMember = staff.find(s => s.id === selectedStaff);
      const record = await AdminSalaryService.saveSalaryRecord({
        staff_id: selectedStaff, staff_name: staffMember?.name || '', period_start: periodStart, period_end: periodEnd,
        days_worked: days, salary_type: structure.type, base_rate_paisa: structure.amount_paisa,
        earned_paisa: earned, overtime_paisa: otPaisa, advance_deducted_paisa: advDed, net_payable_paisa: netPayable, calculated_by: 'staff_1',
      });
      toast.success('Salary slip generated');
      setExportRecord(record); setExportOpen(true);
      loadRecords();
    } finally { setGenerating(false); }
  };

  const downloadCsv = (r: SalaryRecord) => {
    const csv = `Staff,Period,Days Worked,Type,Base Rate,Earned,Overtime,Advance Deducted,Net Payable\n${r.staff_name},${r.period_start} to ${r.period_end},${r.days_worked},${r.salary_type},${r.base_rate_paisa / 100},${r.earned_paisa / 100},${r.overtime_paisa / 100},${r.advance_deducted_paisa / 100},${r.net_payable_paisa / 100}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `salary_${r.staff_name.replace(/\s/g, '_')}_${r.period_start}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const historyColumns: DataTableOneColumn<SalaryRecord>[] = [
    ...(historyStaff === 'all' ? [{ key: 'staff', header: 'Staff', sortable: true, sortValue: (r: SalaryRecord) => r.staff_name, render: (r: SalaryRecord) => <span className="text-[13px] font-medium text-foreground">{r.staff_name}</span> }] : []),
    { key: 'period', header: 'Period', render: r => <span className="text-[13px]">{format(new Date(r.period_start), 'dd MMM')} – {format(new Date(r.period_end), 'dd MMM yyyy')}</span> },
    { key: 'days', header: 'Days', render: r => <span className="text-[13px]">{r.days_worked}</span> },
    { key: 'type', header: 'Type', render: r => <Badge variant="outline" className="text-[10px]">{r.salary_type === 'fixed_monthly' ? 'Monthly' : 'Daily'}</Badge> },
    { key: 'earned', header: 'Earned', align: 'right', render: r => <span className="text-[13px]">{fmt(r.earned_paisa)}</span> },
    { key: 'ot', header: 'OT', align: 'right', render: r => <span className="text-[13px]">{r.overtime_paisa ? fmt(r.overtime_paisa) : '—'}</span> },
    { key: 'adv', header: 'Adv. Ded.', align: 'right', render: r => <span className="text-[13px] text-destructive">{r.advance_deducted_paisa ? fmt(r.advance_deducted_paisa) : '—'}</span> },
    { key: 'net', header: 'Net Payable', align: 'right', render: r => <span className="text-[13px] font-semibold text-foreground">{fmt(r.net_payable_paisa)}</span> },
    { key: 'dl', header: '', render: r => <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setExportRecord(r); setExportOpen(true); }}><Download className="h-3.5 w-3.5" /></Button> },
  ];

  const totalNetPayable = records.reduce((s, r) => s + r.net_payable_paisa, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Salary Management</h2>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="calculate">Calculate Salary</TabsTrigger><TabsTrigger value="history">Salary History</TabsTrigger></TabsList>

        <TabsContent value="calculate" className="space-y-4 mt-4">
          <div className="max-w-xs">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Select Staff</label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger><SelectValue placeholder="Choose staff member" /></SelectTrigger>
              <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {structure && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card><CardContent className="p-4 space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Current Structure</p>
                  <p className="text-sm font-medium text-foreground">{structure.type === 'fixed_monthly' ? 'Monthly' : 'Daily Rate'}: {fmt(structure.amount_paisa)}</p>
                  <p className="text-xs text-muted-foreground">Effective from {format(new Date(structure.effective_from), 'dd MMM yyyy')}</p>
                </CardContent></Card>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Period Start</label><DatePicker value={periodStart} onChange={setPeriodStart} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Period End</label><DatePicker value={periodEnd} onChange={setPeriodEnd} /></div>
                </div>
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Days Worked</label><Input type="number" value={daysWorked} onChange={e => setDaysWorked(e.target.value)} placeholder="e.g. 25" /></div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Calculation Preview</p>
                  {structure.type === 'fixed_monthly' && (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Monthly Salary</span><span>{fmt(structure.amount_paisa)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Days in Month</span><span>{daysInMonth}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Daily Rate</span><span>{fmt(dailyRate)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Days Worked</span><span>{days}</span></div>
                    </div>
                  )}
                  {structure.type === 'daily_rate' && (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Daily Rate</span><span>{fmt(structure.amount_paisa)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Days Worked</span><span>{days}</span></div>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 space-y-1 text-sm">
                    <div className="flex justify-between font-medium"><span>Earned Salary</span><span>{fmt(earned)}</span></div>
                  </div>

                  <div className="space-y-2">
                    <div><label className="text-xs text-muted-foreground">Overtime (₹)</label><Input type="number" value={overtime} onChange={e => setOvertime(e.target.value)} placeholder="0.00" className="h-8 text-sm" /></div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Outstanding Advance</span><span>{fmt(advanceBalance)}</span></div>
                    <div><label className="text-xs text-muted-foreground">Advance Deduction (₹)</label><Input type="number" value={advanceDeduction} onChange={e => setAdvanceDeduction(e.target.value)} placeholder="0.00" max={advanceBalance / 100} className="h-8 text-sm" /></div>
                  </div>

                  <div className="border-t-2 border-border pt-3">
                    <div className="flex justify-between items-center"><span className="text-sm font-semibold text-foreground">Net Payable</span><span className="text-2xl font-bold text-primary">{fmt(netPayable)}</span></div>
                  </div>

                  <Button className="w-full gap-2 mt-2" onClick={handleGenerate} disabled={generating || days <= 0}>
                    <Calculator className="h-4 w-4" />{generating ? 'Generating...' : 'Generate Salary Slip'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="max-w-xs">
              <Select value={historyStaff} onValueChange={setHistoryStaff}>
                <SelectTrigger><SelectValue placeholder="All Staff" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!loading && records.length > 0 && (
            <Card><CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Salary Paid</p>
              <p className="text-xl font-bold mt-1 text-foreground">{fmt(totalNetPayable)}</p>
            </CardContent></Card>
          )}

          <DataTableOne columns={historyColumns} data={records} keyExtractor={r => r.id} loading={loading} emptyMessage="No salary records" />
        </TabsContent>
      </Tabs>

      <ResponsiveModal open={exportOpen} onOpenChange={setExportOpen} title="Salary Slip">
        {exportRecord && (
          <>
            <div className="space-y-4 pb-20">
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-center border-b border-border pb-3"><p className="text-lg font-bold text-foreground">Salary Slip</p><p className="text-xs text-muted-foreground">Mukhwas Commerce OS</p></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Staff:</span> <span className="font-medium">{exportRecord.staff_name}</span></div>
                  <div><span className="text-muted-foreground">Period:</span> <span className="font-medium">{format(new Date(exportRecord.period_start), 'dd MMM')} – {format(new Date(exportRecord.period_end), 'dd MMM yyyy')}</span></div>
                  <div><span className="text-muted-foreground">Days Worked:</span> <span className="font-medium">{exportRecord.days_worked}</span></div>
                  <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{exportRecord.salary_type === 'fixed_monthly' ? 'Monthly' : 'Daily Rate'}</span></div>
                </div>
                <div className="border-t border-border pt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Base Rate</span><span>{fmt(exportRecord.base_rate_paisa)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Earned Salary</span><span>{fmt(exportRecord.earned_paisa)}</span></div>
                  {exportRecord.overtime_paisa > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Overtime</span><span className="text-success">+{fmt(exportRecord.overtime_paisa)}</span></div>}
                  {exportRecord.advance_deducted_paisa > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Advance Deducted</span><span className="text-destructive">-{fmt(exportRecord.advance_deducted_paisa)}</span></div>}
                </div>
                <div className="border-t-2 border-border pt-2"><div className="flex justify-between items-center"><span className="text-sm font-bold">Net Payable</span><span className="text-xl font-bold text-primary">{fmt(exportRecord.net_payable_paisa)}</span></div></div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => downloadCsv(exportRecord)} className="gap-1.5"><Download className="h-4 w-4" />CSV</Button>
              <Button onClick={() => { toast.success('Excel export ready for SheetJS integration'); }} className="gap-1.5"><Download className="h-4 w-4" />Excel</Button>
            </div>
          </>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default SalaryPage;
