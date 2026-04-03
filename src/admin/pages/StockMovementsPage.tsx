import React, { useState, useMemo } from 'react';
import { useStockMovements } from '@/admin/hooks/useInventory';
import { DataTableOne } from '@/components/ui/data-table';
import type { DataTableOneColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import type { StockMovementRecord } from '@/types';

const typeColors: Record<string, string> = {
  purchase_receipt: 'bg-success/10 text-success',
  production_in: 'bg-primary/10 text-primary',
  production_out: 'bg-warning/10 text-warning',
  sale: 'bg-info/10 text-info',
  pos_sale: 'bg-info/10 text-info',
  manual_adjustment: 'bg-muted text-muted-foreground',
  reversal: 'bg-destructive/10 text-destructive',
};

const typeLabels: Record<string, string> = {
  purchase_receipt: 'Purchase Receipt',
  production_in: 'Production In',
  production_out: 'Production Out',
  sale: 'Sale',
  pos_sale: 'POS Sale',
  manual_adjustment: 'Adjustment',
  reversal: 'Reversal',
};

const StockMovementsPage: React.FC = () => {
  const { movements: data, loading } = useStockMovements();
  const [filterType, setFilterType] = useState('all');
  const [filterItemType, setFilterItemType] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = data;
    if (filterType !== 'all') list = list.filter(r => r.movement_type === filterType);
    if (filterItemType !== 'all') list = list.filter(r => r.item_type === filterItemType);
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.item_name.toLowerCase().includes(q)); }
    return list;
  }, [data, filterType, filterItemType, search]);

  const exportCSV = async () => {
    const header = 'Date,Type,Item,Item Type,Qty Change,Before,After,Unit,Reference,By\n';
    const rows = filtered.map(r => `${format(new Date(r.timestamp), 'yyyy-MM-dd HH:mm')},${typeLabels[r.movement_type]},${r.item_name},${r.item_type},${r.quantity_change},${r.stock_before},${r.stock_after},${r.unit},${r.reference_label},${r.performed_by}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'stock-movements.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableOneColumn<StockMovementRecord>[] = [
    { key: 'time', header: 'Date & Time', sortable: true, sortValue: r => new Date(r.timestamp).getTime(),
      render: r => <span className="text-[13px] text-muted-foreground whitespace-nowrap">{format(new Date(r.timestamp), 'dd MMM yyyy, HH:mm')}</span> },
    { key: 'type', header: 'Type', render: r => <Badge variant="secondary" className={`text-[10px] ${typeColors[r.movement_type]}`}>{typeLabels[r.movement_type]}</Badge> },
    { key: 'item', header: 'Item', render: r => <span className="text-[13px] font-medium text-foreground">{r.item_name}</span> },
    { key: 'itemType', header: 'Item Type', render: r => <Badge variant="outline" className="text-[10px]">{r.item_type === 'finished_good' ? 'FG' : 'RM'}</Badge> },
    { key: 'qty', header: 'Qty Change', sortable: true, sortValue: r => r.quantity_change, render: r => (
      <span className={`text-[13px] font-semibold ${r.quantity_change > 0 ? 'text-success' : 'text-destructive'}`}>
        {r.quantity_change > 0 ? '+' : ''}{r.quantity_change}
      </span>
    )},
    { key: 'before', header: 'Before', render: r => <span className="text-[13px] text-muted-foreground">{r.stock_before}</span> },
    { key: 'after', header: 'After', render: r => <span className="text-[13px] text-muted-foreground">{r.stock_after}</span> },
    { key: 'unit', header: 'Unit', render: r => <span className="text-[13px] text-muted-foreground">{r.unit}</span> },
    { key: 'ref', header: 'Reference', render: r => <span className="text-[11px] text-primary font-mono">{r.reference_label}</span> },
    { key: 'by', header: 'By', render: r => <span className="text-[13px] text-muted-foreground">{r.performed_by}</span> },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Stock Movements</h2>
      <DataTableOne columns={columns} data={filtered} keyExtractor={r => r.id} loading={loading} emptyMessage="No movements"
        exportOptions={{ onExportCsv: exportCSV }}
        toolbarFilters={<Input placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-48 text-xs" />}
        filters={[
          { key: 'type', label: 'Movement Type', value: filterType, options: Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l })), onChange: setFilterType },
          { key: 'itemType', label: 'Item Type', value: filterItemType, options: [{ label: 'Finished Good', value: 'finished_good' }, { label: 'Raw Material', value: 'raw_material' }], onChange: setFilterItemType },
        ]}
      />
    </div>
  );
};

export default StockMovementsPage;
