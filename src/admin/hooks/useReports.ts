import { useState, useEffect, useCallback } from 'react';
import type { ReportSummary, SalesReportRow, InventoryReportRow, ProductionReportRow, ProcurementReportRow, FinancialReportRow, StaffReportRow } from '@/admin/services/ReportService';
import { ReportService } from '@/admin/services/ReportService';

export function useReports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setReports(await ReportService.getAllReports()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { reports, loading, refresh: fetch };
}

export function useReportData() {
  const [salesData, setSalesData] = useState<SalesReportRow[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReportRow[]>([]);
  const [productionData, setProductionData] = useState<ProductionReportRow[]>([]);
  const [procurementData, setProcurementData] = useState<ProcurementReportRow[]>([]);
  const [financialData, setFinancialData] = useState<FinancialReportRow[]>([]);
  const [staffData, setStaffData] = useState<StaffReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, i, p, pr, f, st] = await Promise.all([
        ReportService.getSalesData(),
        ReportService.getInventoryData(),
        ReportService.getProductionData(),
        ReportService.getProcurementData(),
        ReportService.getFinancialData(),
        ReportService.getStaffData(),
      ]);
      setSalesData(s);
      setInventoryData(i);
      setProductionData(p);
      setProcurementData(pr);
      setFinancialData(f);
      setStaffData(st);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { salesData, inventoryData, productionData, procurementData, financialData, staffData, loading, refresh: fetch };
}
