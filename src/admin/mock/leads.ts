import type { Lead } from '@/types';

export const mockLeads: Lead[] = [
  { id: 'lead_1', name: 'Rajesh Gupta', email: 'rajesh@gmail.com', phone: '9812345670', source: 'contact_form', status: 'new', notes: 'Interested in bulk orders for wedding', created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
  { id: 'lead_2', name: 'Sunita Mehta', email: 'sunita.m@yahoo.com', phone: '9812345671', source: 'contact_form', status: 'contacted', notes: 'Asked about custom packaging', assigned_to: 'staff_2', created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-19T10:00:00Z' },
  { id: 'lead_3', name: 'Vikram Singh', email: 'vikram.s@hotmail.com', phone: '9812345672', source: 'contact_form', status: 'qualified', notes: 'Corporate gifting inquiry — 500 boxes', assigned_to: 'staff_1', created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-17T10:00:00Z' },
  { id: 'lead_4', name: 'Pooja Reddy', email: 'pooja.r@outlook.com', phone: '9812345673', source: 'contact_form', status: 'converted', notes: 'Placed first order MKW-1010', assigned_to: 'staff_2', created_at: '2026-03-10T10:00:00Z', updated_at: '2026-03-14T10:00:00Z' },
  { id: 'lead_5', name: 'Arun Joshi', email: 'arun.j@gmail.com', phone: '9812345674', source: 'contact_form', status: 'lost', notes: 'Price too high for wholesale', assigned_to: 'staff_1', created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-08T10:00:00Z' },
  { id: 'lead_6', name: 'Kavita Patel', email: 'kavita.p@gmail.com', phone: '9812345675', source: 'phone', status: 'new', notes: 'Wants to become a reseller', created_at: '2026-03-22T08:00:00Z', updated_at: '2026-03-22T08:00:00Z' },
  { id: 'lead_7', name: 'Deepak Sharma', email: 'deepak.s@company.com', phone: '9812345676', source: 'referral', status: 'contacted', notes: 'Referred by existing customer', assigned_to: 'staff_6', created_at: '2026-03-21T14:00:00Z', updated_at: '2026-03-22T09:00:00Z' },
  { id: 'lead_8', name: 'Neha Agarwal', email: 'neha.a@gmail.com', phone: '9812345677', source: 'contact_form', status: 'new', notes: 'Asked about sugar-free options', created_at: '2026-03-23T11:00:00Z', updated_at: '2026-03-23T11:00:00Z' },
  { id: 'lead_9', name: 'Manish Kapoor', email: 'manish.k@biz.com', phone: '9812345678', source: 'storefront', status: 'qualified', notes: 'Hotel chain — monthly supply needed', assigned_to: 'staff_1', created_at: '2026-03-12T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'lead_10', name: 'Ritu Deshmukh', email: 'ritu.d@gmail.com', phone: '9812345679', source: 'contact_form', status: 'contacted', notes: 'Diwali gifting requirements', assigned_to: 'staff_2', created_at: '2026-03-19T10:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
];
