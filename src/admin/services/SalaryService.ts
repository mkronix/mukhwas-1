import { mockSalaryStructures, mockStaffAdvances, mockSalaryRecords } from '@/admin/mock/salary';
import type { SalaryStructureRecord, StaffAdvanceRecord, SalaryRecord } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class AdminSalaryService {
  static async getSalaryStructures(staffId: string): Promise<SalaryStructureRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockSalaryStructures.filter(s => s.staff_id === staffId).sort((a, b) => b.effective_from.localeCompare(a.effective_from)); }
    const res = await apiClient.get<SalaryStructureRecord[]>(`/salary/structures`, { staff_id: staffId });
    return res.data;
  }

  static async getCurrentStructure(staffId: string): Promise<SalaryStructureRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); const structs = mockSalaryStructures.filter(s => s.staff_id === staffId).sort((a, b) => b.effective_from.localeCompare(a.effective_from)); return structs[0] || null; }
    const res = await apiClient.get<SalaryStructureRecord>(`/salary/structures/current`, { staff_id: staffId });
    return res.data;
  }

  static async saveSalaryStructure(data: Omit<SalaryStructureRecord, 'id' | 'created_at'>): Promise<SalaryStructureRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const record: SalaryStructureRecord = { ...data, id: `ss_${Date.now()}`, created_at: new Date().toISOString() }; mockSalaryStructures.push(record); return record; }
    const res = await apiClient.post<SalaryStructureRecord>('/salary/structures', data);
    return res.data;
  }

  static async getAdvances(staffId: string): Promise<StaffAdvanceRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockStaffAdvances.filter(a => a.staff_id === staffId); }
    const res = await apiClient.get<StaffAdvanceRecord[]>(`/salary/advances`, { staff_id: staffId });
    return res.data;
  }

  static async getOutstandingAdvance(staffId: string): Promise<number> {
    if (env.IS_MOCK_MODE) { await delay(); return mockStaffAdvances.filter(a => a.staff_id === staffId).reduce((sum, a) => sum + a.outstanding_paisa, 0); }
    const res = await apiClient.get<{ outstanding: number }>(`/salary/advances/outstanding`, { staff_id: staffId });
    return res.data.outstanding;
  }

  static async giveAdvance(data: Omit<StaffAdvanceRecord, 'id' | 'outstanding_paisa' | 'created_at'>): Promise<StaffAdvanceRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const record: StaffAdvanceRecord = { ...data, id: `adv_${Date.now()}`, outstanding_paisa: data.amount_paisa, created_at: new Date().toISOString() }; mockStaffAdvances.push(record); return record; }
    const res = await apiClient.post<StaffAdvanceRecord>('/salary/advances', data);
    return res.data;
  }

  static async getSalaryRecords(staffId?: string): Promise<SalaryRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); const records = staffId ? mockSalaryRecords.filter(r => r.staff_id === staffId) : [...mockSalaryRecords]; return records.sort((a, b) => b.period_start.localeCompare(a.period_start)); }
    const res = await apiClient.get<SalaryRecord[]>('/salary/records', staffId ? { staff_id: staffId } : undefined);
    return res.data;
  }

  static async saveSalaryRecord(data: Omit<SalaryRecord, 'id' | 'created_at'>): Promise<SalaryRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const record: SalaryRecord = { ...data, id: `sal_${Date.now()}`, created_at: new Date().toISOString() };
      mockSalaryRecords.push(record);
      if (data.advance_deducted_paisa > 0) {
        const advances = mockStaffAdvances.filter(a => a.staff_id === data.staff_id && a.outstanding_paisa > 0);
        let remaining = data.advance_deducted_paisa;
        for (const adv of advances) { if (remaining <= 0) break; const deduct = Math.min(adv.outstanding_paisa, remaining); adv.outstanding_paisa -= deduct; remaining -= deduct; }
      }
      return record;
    }
    const res = await apiClient.post<SalaryRecord>('/salary/records', data);
    return res.data;
  }
}
