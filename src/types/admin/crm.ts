export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone: string;
    source: string;
    status: LeadStatus;
    notes?: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
}