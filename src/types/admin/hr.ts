export type SalaryType = 'fixed_monthly' | 'daily_rate';
export type SalaryDisbursementStatus = 'draft' | 'approved' | 'paid';
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface EmployeeSalaryStructure {
    id: string;
    staff_id: string;
    type: SalaryType;
    base_amount_paisa: number;
    allowances_paisa: number;
    deductions_paisa: number;
    effective_from: string;
}

export interface AttendanceRecord {
    id: string;
    staff_id: string;
    date: string;
    check_in?: string;
    check_out?: string;
    status: AttendanceStatus;
    notes?: string;
}

export interface SalaryDisbursement {
    id: string;
    staff_id: string;
    month: string;
    year: number;
    working_days: number;
    present_days: number;
    base_amount_paisa: number;
    allowances_paisa: number;
    deductions_paisa: number;
    advance_recovery_paisa: number;
    net_amount_paisa: number;
    status: SalaryDisbursementStatus;
    paid_at?: string;
    created_at: string;
}

export interface StaffAdvance {
    id: string;
    staff_id: string;
    amount_paisa: number;
    outstanding_paisa: number;
    reason: string;
    approved_by: string;
    created_at: string;
}