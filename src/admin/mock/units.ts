import type { SystemUnit, CustomUnit } from '@/types';
import type { UnitConversion } from '@/types';

export const mockSystemUnits: SystemUnit[] = [
  { id: 'su_1', name: 'Kilogram', abbreviation: 'kg', type: 'Weight', is_system: true },
  { id: 'su_2', name: 'Gram', abbreviation: 'g', type: 'Weight', is_system: true },
  { id: 'su_3', name: 'Milligram', abbreviation: 'mg', type: 'Weight', is_system: true },
  { id: 'su_4', name: 'Litre', abbreviation: 'L', type: 'Volume', is_system: true },
  { id: 'su_5', name: 'Millilitre', abbreviation: 'mL', type: 'Volume', is_system: true },
  { id: 'su_6', name: 'Pieces', abbreviation: 'pcs', type: 'Count', is_system: true },
];

export const mockCustomUnits: CustomUnit[] = [
  { id: 'cu_1', name: 'Tola', abbreviation: 'tola', type: 'Weight', is_system: false, created_by: 'Admin User', created_at: '2024-03-01T10:00:00Z', referenced: true },
  { id: 'cu_2', name: 'Packet', abbreviation: 'pkt', type: 'Count', is_system: false, created_by: 'Admin User', created_at: '2024-03-05T10:00:00Z', referenced: true },
  { id: 'cu_3', name: 'Box', abbreviation: 'box', type: 'Count', is_system: false, created_by: 'Kasim Kadiwala', created_at: '2024-04-01T10:00:00Z', referenced: false },
  { id: 'cu_4', name: 'Dozen', abbreviation: 'dz', type: 'Count', is_system: false, created_by: 'Admin User', created_at: '2024-04-15T10:00:00Z', referenced: true },
  { id: 'cu_5', name: 'Seer', abbreviation: 'seer', type: 'Weight', is_system: false, created_by: 'Admin User', created_at: '2024-05-01T10:00:00Z', referenced: false },
];

export const mockUnitConversions: UnitConversion[] = [
  { id: 'uc_1', from_unit: 'kg', to_unit: 'gram', factor: 1000 },
  { id: 'uc_2', from_unit: 'gram', to_unit: 'kg', factor: 0.001 },
  { id: 'uc_3', from_unit: 'litre', to_unit: 'ml', factor: 1000 },
  { id: 'uc_4', from_unit: 'ml', to_unit: 'litre', factor: 0.001 },
  { id: 'uc_5', from_unit: 'kg', to_unit: 'gram', factor: 1000 },
  { id: 'uc_6', from_unit: 'gram', to_unit: 'pcs', factor: 1 },
  { id: 'uc_7', from_unit: 'kg', to_unit: 'pcs', factor: 1 },
  { id: 'uc_8', from_unit: 'litre', to_unit: 'kg', factor: 1 },
  { id: 'uc_9', from_unit: 'pcs', to_unit: 'gram', factor: 50 },
  { id: 'uc_10', from_unit: 'ml', to_unit: 'gram', factor: 1 },
];
