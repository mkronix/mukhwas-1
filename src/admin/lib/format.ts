import { format, parseISO } from 'date-fns';

// Re-export shared formatINR for backward compatibility
export { formatINR, formatPrice } from '@/lib/format';
export { formatINRShort } from '@/lib/format';

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd MMM yyyy, hh:mm a');
}

export const orderStatusConfig: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  placed: { label: 'Placed', color: 'bg-info/10 text-info', variant: 'outline' },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary', variant: 'secondary' },
  packed: { label: 'Packed', color: 'bg-warning/10 text-warning', variant: 'secondary' },
  shipped: { label: 'Shipped', color: 'bg-info/10 text-info', variant: 'default' },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success', variant: 'default' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', variant: 'destructive' },
};

export const paymentStatusConfig: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', variant: 'outline' },
  paid: { label: 'Paid', color: 'bg-success/10 text-success', variant: 'default' },
  partial: { label: 'Partial', color: 'bg-info/10 text-info', variant: 'secondary' },
  failed: { label: 'Failed', color: 'bg-destructive/10 text-destructive', variant: 'destructive' },
  refunded: { label: 'Refunded', color: 'bg-muted text-muted-foreground', variant: 'destructive' },
};

export const stockStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  in_stock: { label: 'In Stock', variant: 'default' },
  low_stock: { label: 'Low Stock', variant: 'secondary' },
  out_of_stock: { label: 'Out of Stock', variant: 'destructive' },
};

export const productionStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planned: { label: 'Planned', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  partially_completed: { label: 'Partial', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const purchaseStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  sent: { label: 'Sent', variant: 'secondary' },
  received: { label: 'Received', variant: 'secondary' },
  billed: { label: 'Billed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const leadStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'New', variant: 'outline' },
  contacted: { label: 'Contacted', variant: 'secondary' },
  qualified: { label: 'Qualified', variant: 'default' },
  converted: { label: 'Converted', variant: 'default' },
  lost: { label: 'Lost', variant: 'destructive' },
};

export function toCsvBlob(headers: string[], rows: string[][]): Blob {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  return new Blob([csv], { type: 'text/csv' });
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
