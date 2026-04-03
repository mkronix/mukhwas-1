import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { STAFF_PALETTE_OPTIONS, useStaffUiPalette } from '@/staff/context/StaffUiPaletteContext';
import { Save, Pencil, Plus, Store, ShoppingCart, Bell, Monitor, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsService } from '@/admin/services/SettingsService';
import type { StoreSettings, CommerceRules, NotificationEvent, POSSettingsData, PaymentModeConfig } from '@/types';
import { cn } from '@/lib/utils';

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'America/New_York',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

function StoreTab() {
  const [data, setData] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { SettingsService.getStoreSettings().then(setData); }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try { await SettingsService.updateStoreSettings(data); toast.success('Store settings saved'); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>;

  return (
    <Card className="p-5 border border-border space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Brand Name</label>
          <Input value={data.brand_name} onChange={e => setData({ ...data, brand_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tagline</label>
          <Input value={data.tagline} onChange={e => setData({ ...data, tagline: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Logo URL</label>
          <Input value={data.logo_url} onChange={e => setData({ ...data, logo_url: e.target.value })} placeholder="Upload or paste URL" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Favicon URL</label>
          <Input value={data.favicon_url} onChange={e => setData({ ...data, favicon_url: e.target.value })} placeholder="Upload or paste URL" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Contact Email</label>
          <Input type="email" value={data.contact_email} onChange={e => setData({ ...data, contact_email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Contact Phone</label>
          <Input value={data.contact_phone} onChange={e => setData({ ...data, contact_phone: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Full Address</label>
        <Textarea value={data.address} onChange={e => setData({ ...data, address: e.target.value })} rows={2} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Timezone</label>
        <Select value={data.timezone} onValueChange={v => setData({ ...data, timezone: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
}

function CommerceRulesTab() {
  const [data, setData] = useState<CommerceRules | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { SettingsService.getCommerceRules().then(setData); }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try { await SettingsService.updateCommerceRules(data); toast.success('Commerce rules saved'); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>;

  return (
    <Card className="p-5 border border-border space-y-5">
      <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
        <div>
          <p className="text-sm font-medium text-foreground">Enable COD</p>
          <p className="text-xs text-muted-foreground">Allow cash on delivery payments</p>
        </div>
        <Switch checked={data.cod_enabled} onCheckedChange={v => setData({ ...data, cod_enabled: v })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Free Shipping Threshold (₹)</label>
          <Input type="number" value={data.free_shipping_threshold_paisa / 100} onChange={e => setData({ ...data, free_shipping_threshold_paisa: Number(e.target.value) * 100 })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Default Shipping Charge (₹)</label>
          <Input type="number" value={data.default_shipping_charge_paisa / 100} onChange={e => setData({ ...data, default_shipping_charge_paisa: Number(e.target.value) * 100 })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tax Display Mode</label>
          <Select value={data.tax_display_mode} onValueChange={v => setData({ ...data, tax_display_mode: v as 'inclusive' | 'exclusive' })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inclusive">Inclusive of GST</SelectItem>
              <SelectItem value="exclusive">Exclusive of GST</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Low Stock Threshold (%)</label>
          <Input type="number" value={data.low_stock_threshold_pct} onChange={e => setData({ ...data, low_stock_threshold_pct: Number(e.target.value) })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Return Window (days)</label>
        <Input type="number" value={data.return_window_days} onChange={e => setData({ ...data, return_window_days: Number(e.target.value) })} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Rules'}
        </Button>
      </div>
    </Card>
  );
}

function NotificationsTab() {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState<NotificationEvent | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; body?: string }>({});

  useEffect(() => {
    SettingsService.getNotificationEvents().then(e => { setEvents(e); setLoading(false); });
  }, []);

  const openEdit = (ev: NotificationEvent) => {
    setFieldErrors({});
    setEditEvent(ev); setSubject(ev.subject); setBody(ev.body);
  };

  const handleSave = async () => {
    if (!editEvent) return;
    const err: { subject?: string; body?: string } = {};
    if (!subject.trim()) err.subject = 'Subject is required';
    if (!body.trim()) err.body = 'Body is required';
    if (Object.keys(err).length) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});
    const updated = await SettingsService.updateNotificationEvent(editEvent.id, { subject, body });
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditEvent(null);
    toast.success('Template updated');
  };

  const toggleEnabled = async (ev: NotificationEvent) => {
    const updated = await SettingsService.updateNotificationEvent(ev.id, { email_enabled: !ev.email_enabled });
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    toast.success(`${ev.event_name} ${updated.email_enabled ? 'enabled' : 'disabled'}`);
  };

  const columns: DataTableOneColumn<NotificationEvent>[] = [
    { key: 'event', header: 'Event', render: r => <span className="text-[13px] font-medium text-foreground">{r.event_name}</span> },
    {
      key: 'enabled', header: 'Email',
      render: r => <Switch checked={r.email_enabled} onCheckedChange={() => toggleEnabled(r)} />,
    },
    { key: 'subject', header: 'Subject', render: r => <span className="text-[13px] text-muted-foreground truncate max-w-[200px] block">{r.subject}</span> },
    {
      key: 'actions', header: '',
      render: r => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
      ),
    },
  ];

  return (
    <>
      <DataTableOne columns={columns} data={events} keyExtractor={r => r.id} loading={loading} emptyMessage="No notification events" />
      <ResponsiveModal open={!!editEvent} onOpenChange={v => { if (!v) { setEditEvent(null); setFieldErrors({}); } }} title={`Edit Template: ${editEvent?.event_name ?? ''}`} className="sm:max-w-[550px]">
        <div className="space-y-4 pb-20">
          <ModalFormField label="Subject" error={fieldErrors.subject} description="Shown in the email inbox">
            {(id) => (
              <Input id={id} value={subject} onChange={e => { setSubject(e.target.value); if (fieldErrors.subject) setFieldErrors((p) => ({ ...p, subject: undefined })); }} placeholder="Order confirmation — {{order_id}}" />
            )}
          </ModalFormField>
          <ModalFormField label="Body" error={fieldErrors.body} description="HTML or plain text supported per your mail provider">
            {(id) => (
              <Textarea id={id} value={body} onChange={e => { setBody(e.target.value); if (fieldErrors.body) setFieldErrors((p) => ({ ...p, body: undefined })); }} rows={6} placeholder="Hi {{customer_name}}, …" />
            )}
          </ModalFormField>
          {editEvent && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Available variables:</p>
              <div className="flex flex-wrap gap-1.5">
                {editEvent.variables.map(v => (
                  <Badge key={v} variant="secondary" className="text-[10px] font-mono">{`{{${v}}}`}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditEvent(null)}>Cancel</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </ResponsiveModal>
    </>
  );
}

function POSSettingsTab() {
  const [data, setData] = useState<POSSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { SettingsService.getPOSSettings().then(setData); }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try { await SettingsService.updatePOSSettings(data); toast.success('POS settings saved'); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>;

  const formatOpts = [
    { value: 'standard', label: 'Standard' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'minimal', label: 'Minimal' },
  ];

  return (
    <Card className="p-5 border border-border space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Receipt Header</label>
          <Textarea value={data.receipt_header} onChange={e => setData({ ...data, receipt_header: e.target.value })} rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Receipt Footer</label>
          <Textarea value={data.receipt_footer} onChange={e => setData({ ...data, receipt_footer: e.target.value })} rows={2} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Default Payment Mode</label>
          <Select value={data.default_payment_mode} onValueChange={v => setData({ ...data, default_payment_mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Session Timeout (min)</label>
          <Input type="number" value={data.session_timeout_minutes} onChange={e => setData({ ...data, session_timeout_minutes: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">PIN Lockout Attempts</label>
          <Input type="number" value={data.pin_lockout_attempts} onChange={e => setData({ ...data, pin_lockout_attempts: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Lockout Duration (min)</label>
          <Input type="number" value={data.lockout_duration_minutes} onChange={e => setData({ ...data, lockout_duration_minutes: Number(e.target.value) })} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
          <div>
            <p className="text-sm font-medium text-foreground">Cash Drawer Prompt</p>
            <p className="text-xs text-muted-foreground">Prompt before opening drawer</p>
          </div>
          <Switch checked={data.cash_drawer_prompt} onCheckedChange={v => setData({ ...data, cash_drawer_prompt: v })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Payslip Format</label>
          <Select value={data.payslip_format} onValueChange={v => setData({ ...data, payslip_format: v as POSSettingsData['payslip_format'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{formatOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Supplier Bill Format</label>
          <Select value={data.supplier_bill_format} onValueChange={v => setData({ ...data, supplier_bill_format: v as POSSettingsData['supplier_bill_format'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{formatOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Export Bill Format</label>
          <Select value={data.export_bill_format} onValueChange={v => setData({ ...data, export_bill_format: v as POSSettingsData['export_bill_format'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{formatOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save POS Settings'}
        </Button>
      </div>
    </Card>
  );
}

function PaymentModesSection() {
  const [modes, setModes] = useState<PaymentModeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newMode, setNewMode] = useState({ mode: '', label: '', description: '', is_for_pos: false, is_for_storefront: false, is_active: true });
  const [createErrors, setCreateErrors] = useState<{ mode?: string; label?: string }>({});

  useEffect(() => { SettingsService.getPaymentModes().then(m => { setModes(m); setLoading(false); }); }, []);

  const toggleField = async (pm: PaymentModeConfig, field: 'is_active' | 'is_for_pos' | 'is_for_storefront') => {
    const updated = await SettingsService.updatePaymentMode(pm.id, { [field]: !pm[field] });
    setModes(prev => prev.map(m => m.id === updated.id ? updated : m));
    toast.success(`${pm.label} updated`);
  };

  const handleCreate = async () => {
    const err: { mode?: string; label?: string } = {};
    if (!newMode.mode.trim()) err.mode = 'Mode key is required';
    if (!newMode.label.trim()) err.label = 'Label is required';
    if (Object.keys(err).length) {
      setCreateErrors(err);
      return;
    }
    setCreateErrors({});
    const created = await SettingsService.createPaymentMode(newMode);
    setModes(prev => [...prev, created]);
    setShowCreate(false);
    setNewMode({ mode: '', label: '', description: '', is_for_pos: false, is_for_storefront: false, is_active: true });
    toast.success(`${created.label} created`);
  };

  const surfaceLabel = (pm: PaymentModeConfig) => {
    const parts: string[] = [];
    if (pm.is_for_pos) parts.push('POS');
    if (pm.is_for_storefront) parts.push('Storefront');
    return parts.length > 0 ? parts.join(' & ') : 'None';
  };

  return (
    <Card className="p-5 border border-border mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Payment Modes</h3>
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Mode
        </Button>
      </div>
      <div className="space-y-3">
        {modes.map(pm => (
          <div key={pm.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{pm.label}</p>
              <p className="text-xs text-muted-foreground">{pm.description || surfaceLabel(pm)}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <Switch checked={pm.is_for_pos} onCheckedChange={() => toggleField(pm, 'is_for_pos')} />
                <span className="text-[9px] text-muted-foreground">POS</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Switch checked={pm.is_for_storefront} onCheckedChange={() => toggleField(pm, 'is_for_storefront')} />
                <span className="text-[9px] text-muted-foreground">Store</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Switch checked={pm.is_active} onCheckedChange={() => toggleField(pm, 'is_active')} />
                <span className="text-[9px] text-muted-foreground">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ResponsiveModal open={showCreate} onOpenChange={v => { if (!v) { setShowCreate(false); setCreateErrors({}); } }} title="Add Payment Mode" className="sm:max-w-[420px]">
        <div className="space-y-4 p-1">
          <ModalFormField label="Mode Key" error={createErrors.mode} description="Stable identifier used in code / APIs">
            {(id) => (
              <Input id={id} value={newMode.mode} onChange={e => { setNewMode({ ...newMode, mode: e.target.value }); if (createErrors.mode) setCreateErrors((p) => ({ ...p, mode: undefined })); }} placeholder="wallet" autoFocus />
            )}
          </ModalFormField>
          <ModalFormField label="Label" error={createErrors.label} description="Customer-facing name">
            {(id) => (
              <Input id={id} value={newMode.label} onChange={e => { setNewMode({ ...newMode, label: e.target.value }); if (createErrors.label) setCreateErrors((p) => ({ ...p, label: undefined })); }} placeholder="Wallet Pay" />
            )}
          </ModalFormField>
          <ModalFormField label="Description" description="Optional helper text">
            {(id) => (
              <Input id={id} value={newMode.description} onChange={e => setNewMode({ ...newMode, description: e.target.value })} placeholder="Pay with stored balance" />
            )}
          </ModalFormField>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={newMode.is_for_pos} onCheckedChange={v => setNewMode({ ...newMode, is_for_pos: v })} />
              <span className="text-sm text-foreground">POS</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newMode.is_for_storefront} onCheckedChange={v => setNewMode({ ...newMode, is_for_storefront: v })} />
              <span className="text-sm text-foreground">Storefront</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </ResponsiveModal>
    </Card>
  );
}

function AppearanceTab() {
  const { palette, setPalette } = useStaffUiPalette();
  return (
    <Card className="p-5 border border-border space-y-4">
      <p className="text-sm text-muted-foreground">
        Accent colors for the admin and POS staff apps only. The storefront keeps its own look.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STAFF_PALETTE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setPalette(opt.id)}
            className={cn(
              'rounded-lg border p-3 text-left text-sm transition-colors',
              palette === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
            )}
          >
            <span className="font-medium text-foreground">{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      <Tabs defaultValue="store">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full max-w-3xl gap-1 h-auto py-2">
          <TabsTrigger value="store" className="gap-1.5 text-xs"><Store className="h-3.5 w-3.5 hidden sm:block" />Store</TabsTrigger>
          <TabsTrigger value="commerce" className="gap-1.5 text-xs"><ShoppingCart className="h-3.5 w-3.5 hidden sm:block" />Commerce</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5 hidden sm:block" />Notifications</TabsTrigger>
          <TabsTrigger value="pos" className="gap-1.5 text-xs"><Monitor className="h-3.5 w-3.5 hidden sm:block" />POS</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs"><Palette className="h-3.5 w-3.5 hidden sm:block" />Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="store" className="mt-4">
          <StoreTab />
          <PaymentModesSection />
        </TabsContent>
        <TabsContent value="commerce" className="mt-4"><CommerceRulesTab /></TabsContent>
        <TabsContent value="notifications" className="mt-4"><NotificationsTab /></TabsContent>
        <TabsContent value="pos" className="mt-4"><POSSettingsTab /></TabsContent>
        <TabsContent value="appearance" className="mt-4"><AppearanceTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
