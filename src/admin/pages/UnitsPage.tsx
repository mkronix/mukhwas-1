import { UnitService } from '@/admin/services/UnitService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { DataTableOne } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Action, Module } from '@/constant/permissions';
import type { UnitConversion } from '@/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MergedUnit {
  id: string;
  name: string;
  abbreviation: string;
  type: string;
  is_system: boolean;
  created_by?: string;
  created_at?: string;
  referenced?: boolean;
}

const UnitsPage: React.FC = () => {
  const [allUnits, setAllUnits] = useState<MergedUnit[]>([]);
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);

  const [unitModal, setUnitModal] = useState(false);
  const [convModal, setConvModal] = useState(false);
  const [editUnit, setEditUnit] = useState<MergedUnit | null>(null);
  const [formName, setFormName] = useState('');
  const [formAbbr, setFormAbbr] = useState('');
  const [formType, setFormType] = useState<string>('Weight');
  const [convFrom, setConvFrom] = useState('');
  const [convTo, setConvTo] = useState('');
  const [convFactor, setConvFactor] = useState('');
  const [saving, setSaving] = useState(false);
  const [unitErrors, setUnitErrors] = useState<{ name?: string; abbr?: string; type?: string }>({});
  const [convErrors, setConvErrors] = useState<{ from?: string; to?: string; factor?: string }>({});

  const load = async () => {
    setLoading(true);
    const [su, cu, cv] = await Promise.all([
      UnitService.getSystemUnits(),
      UnitService.getCustomUnits(),
      UnitService.getConversions(),
    ]);
    const merged: MergedUnit[] = [
      ...su.map(u => ({ ...u, is_system: true as const })),
      ...cu.map(u => ({ ...u, is_system: false as const, created_by: u.created_by, created_at: u.created_at, referenced: u.referenced })),
    ];
    setAllUnits(merged);
    setConversions(cv);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setUnitErrors({});
    setEditUnit(null);
    setFormName(''); setFormAbbr(''); setFormType('Weight');
    setUnitModal(true);
  };

  const openEdit = (u: MergedUnit) => {
    setUnitErrors({});
    setEditUnit(u);
    setFormName(u.name); setFormAbbr(u.abbreviation); setFormType(u.type);
    setUnitModal(true);
  };

  const saveUnit = async () => {
    const err: typeof unitErrors = {};
    if (!formName.trim()) err.name = 'Name is required';
    if (!formAbbr.trim()) err.abbr = 'Abbreviation is required';
    if (!formType) err.type = 'Select a type';
    if (Object.keys(err).length) { setUnitErrors(err); return; }
    setUnitErrors({});
    setSaving(true);
    try {
      if (editUnit) {
        if (editUnit.is_system) {
          toast.error('System units cannot be edited directly — create a custom override');
        } else {
          await UnitService.updateCustomUnit(editUnit.id, { name: formName, abbreviation: formAbbr, type: formType as 'Weight' | 'Volume' | 'Count' | 'Other' });
          toast.success('Unit updated');
        }
      } else {
        await UnitService.createCustomUnit({ name: formName, abbreviation: formAbbr, type: formType as 'Weight' | 'Volume' | 'Count' | 'Other', created_by: 'Admin User' });
        toast.success('Unit created');
      }
      setUnitModal(false);
      load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const deleteUnit = async (u: MergedUnit) => {
    try {
      if (u.is_system) {
        toast.success('System unit removed');
      } else {
        await UnitService.deleteCustomUnit(u.id);
        toast.success('Unit deleted');
      }
      load();
    } catch { toast.error('Unit is in use and cannot be deleted'); }
  };

  const openCreateConversion = () => {
    setConvErrors({});
    setConvFrom(''); setConvTo(''); setConvFactor('');
    setConvModal(true);
  };

  const saveConversion = async () => {
    const err: typeof convErrors = {};
    if (!convFrom) err.from = 'Select a source unit';
    if (!convTo) err.to = 'Select a target unit';
    if (!convFactor.trim()) err.factor = 'Factor is required';
    else if (Number(convFactor) <= 0 || Number.isNaN(Number(convFactor))) err.factor = 'Enter a positive number';
    if (Object.keys(err).length) { setConvErrors(err); return; }
    setConvErrors({});
    setSaving(true);
    try {
      await UnitService.createConversion({ from_unit: convFrom as UnitConversion['from_unit'], to_unit: convTo as UnitConversion['to_unit'], factor: Number(convFactor) });
      toast.success('Conversion added');
      setConvModal(false);
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setSaving(false); }
  };

  const allAbbreviations = allUnits.map(u => u.abbreviation);

  const unitColumns: DataTableOneColumn<MergedUnit>[] = [
    {
      key: 'name', header: 'Name', sortable: true, sortValue: r => r.name,
      render: r => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{r.name}</span>
          {r.is_system && <Badge variant="outline" className="text-[9px]">System</Badge>}
        </div>
      ),
    },
    { key: 'abbr', header: 'Abbreviation', render: r => <span className="text-[13px] text-muted-foreground">{r.abbreviation}</span> },
    { key: 'type', header: 'Type', render: r => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    { key: 'created_by', header: 'Created By', render: r => <span className="text-[13px] text-muted-foreground">{r.created_by ?? 'System'}</span> },
    {
      key: 'actions', header: '', render: r => (
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard permission={{ module: Module.UNITS, action: Action.UPDATE }}>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
          </PermissionGuard>
          <PermissionGuard permission={{ module: Module.UNITS, action: Action.DELETE }}>

            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteUnit(r)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const convColumns: DataTableOneColumn<UnitConversion>[] = [
    { key: 'from', header: 'From', render: r => <span className="text-[13px] font-medium text-foreground">{r.from_unit}</span> },
    { key: 'to', header: 'To', render: r => <span className="text-[13px] font-medium text-foreground">{r.to_unit}</span> },
    { key: 'factor', header: 'Factor', render: r => <span className="text-[13px] text-muted-foreground">{r.factor}</span> },
    {
      key: 'actions', header: '', render: r => (
        <PermissionGuard permission={{ module: Module.UNITS, action: Action.DELETE }}>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={async () => { await UnitService.deleteConversion(r.id); toast.success('Deleted'); load(); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Units Management</h2>
        <PermissionGuard permission={{ module: Module.UNITS, action: Action.CREATE }}>

          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Unit</span>
          </Button>
        </PermissionGuard>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">All Units</h3>
        <DataTableOne columns={unitColumns} data={allUnits} keyExtractor={r => r.id} loading={loading} emptyMessage="No units" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Unit Conversions</h3>
          <PermissionGuard permission={{ module: Module.UNITS, action: Action.CREATE }}>
            <Button variant="outline" size="sm" onClick={openCreateConversion} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Conversion
            </Button>
          </PermissionGuard>
        </div>
        <DataTableOne columns={convColumns} data={conversions} keyExtractor={r => r.id} loading={loading} emptyMessage="No conversions" />
      </div>

      <ResponsiveModal open={unitModal} onOpenChange={v => { setUnitModal(v); if (!v) setUnitErrors({}); }} title={editUnit ? 'Edit Unit' : 'Add Unit'}>
        <div className="space-y-4 pb-20">
          <ModalFormField label="Name" error={unitErrors.name}>
            {(id) => <Input id={id} placeholder="Kilogram" value={formName} onChange={e => { setFormName(e.target.value); if (unitErrors.name) setUnitErrors(p => ({ ...p, name: undefined })); }} />}
          </ModalFormField>
          <ModalFormField label="Abbreviation" error={unitErrors.abbr} description="Short code used in forms">
            {(id) => <Input id={id} placeholder="kg" value={formAbbr} onChange={e => { setFormAbbr(e.target.value); if (unitErrors.abbr) setUnitErrors(p => ({ ...p, abbr: undefined })); }} />}
          </ModalFormField>
          <ModalFormField label="Type" error={unitErrors.type}>
            {(id) => (
              <Select value={formType} onValueChange={v => { setFormType(v); if (unitErrors.type) setUnitErrors(p => ({ ...p, type: undefined })); }}>
                <SelectTrigger id={id}><SelectValue placeholder="Choose type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight">Weight</SelectItem>
                  <SelectItem value="Volume">Volume</SelectItem>
                  <SelectItem value="Count">Count</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setUnitModal(false)}>Cancel</Button>
          <Button onClick={saveUnit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal open={convModal} onOpenChange={v => { setConvModal(v); if (!v) setConvErrors({}); }} title="Add Unit Conversion">
        <div className="space-y-4 pb-20">
          <ModalFormField label="From unit" error={convErrors.from}>
            {(id) => (
              <Select value={convFrom} onValueChange={v => { setConvFrom(v); if (convErrors.from) setConvErrors(p => ({ ...p, from: undefined })); }}>
                <SelectTrigger id={id}><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {allAbbreviations.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="To unit" error={convErrors.to}>
            {(id) => (
              <Select value={convTo} onValueChange={v => { setConvTo(v); if (convErrors.to) setConvErrors(p => ({ ...p, to: undefined })); }}>
                <SelectTrigger id={id}><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {allAbbreviations.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="Conversion factor" error={convErrors.factor} description="Multiply “from” by this to get “to”">
            {(id) => <Input id={id} type="number" step="any" placeholder="1000" value={convFactor} onChange={e => { setConvFactor(e.target.value); if (convErrors.factor) setConvErrors(p => ({ ...p, factor: undefined })); }} />}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConvModal(false)}>Cancel</Button>
          <Button onClick={saveConversion} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default UnitsPage;
