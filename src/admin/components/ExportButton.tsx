import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { SettingsService } from '@/admin/services/SettingsService';

interface ExportButtonProps {
  onExportCSV: () => Promise<string[][]>;
  onExportPDF?: () => Promise<void>;
  headers: string[];
  fileName: string;
  disabled?: boolean;
}

function toCsvBlob(headers: string[], rows: string[][]): Blob {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  return new Blob([csv], { type: 'text/csv' });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function generatePdfBlob(title: string, headers: string[], rows: string[][], brandName: string): Promise<Blob> {
  let content = `${brandName}\n${'='.repeat(brandName.length)}\n\n${title}\nGenerated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
  content += headers.join(' | ') + '\n';
  content += headers.map(() => '---').join(' | ') + '\n';
  rows.forEach(row => { content += row.join(' | ') + '\n'; });
  content += `\nTotal Records: ${rows.length}`;
  return new Blob([content], { type: 'text/plain' });
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportPDF,
  headers,
  fileName,
  disabled,
}) => {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleCSV = async () => {
    setExporting('csv');
    try {
      const rows = await onExportCSV();
      const settings = await SettingsService.getStoreSettings();
      const brandHeaders = [`${settings.brand_name} — ${fileName}`, `Generated: ${new Date().toLocaleDateString('en-IN')}`, ''];
      const csv = [brandHeaders.join(','), headers.join(','), ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      downloadBlob(new Blob([csv], { type: 'text/csv' }), `${fileName.replace(/\s+/g, '_').toLowerCase()}.csv`);
    } finally {
      setExporting(null);
    }
  };

  const handlePDF = async () => {
    setExporting('pdf');
    try {
      if (onExportPDF) {
        await onExportPDF();
      } else {
        const rows = await onExportCSV();
        const settings = await SettingsService.getStoreSettings();
        const blob = await generatePdfBlob(fileName, headers, rows, settings.brand_name);
        downloadBlob(blob, `${fileName.replace(/\s+/g, '_').toLowerCase()}.txt`);
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={disabled || !!exporting}>
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV} className="gap-2 text-xs cursor-pointer">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF} className="gap-2 text-xs cursor-pointer">
          <FileText className="h-3.5 w-3.5" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
