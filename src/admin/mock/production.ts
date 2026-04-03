import type { ProductionOrderRecord } from '@/types';
import type { ProductionStatus } from '@/types';

export const mockProductionOrders: ProductionOrderRecord[] = [
  {
    id: 'po_1', order_number: 'PROD-2001', recipe_id: 'rec_1', recipe_name: 'Classic Saunf Recipe', recipe_version: 3,
    product_variant: 'Saunf Mukhwas – 100g', planned_quantity: 500, actual_quantity: 500, unit: 'g',
    status: 'completed', scheduled_date: '2024-06-01', started_at: '2024-06-01T09:00:00Z', completed_at: '2024-06-01T15:00:00Z',
    assigned_staff_id: 'staff_2', assigned_staff_name: 'Kasim Kadiwala', created_by: 'Admin User', created_at: '2024-05-30T10:00:00Z',
    materials: [
      { id: 'pm_1', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 400, actual_used: 400, unit: 'g', status: 'consumed' },
      { id: 'pm_2', raw_material_id: 'rm_11', raw_material_name: 'Sugar', reserved_quantity: 75, actual_used: 75, unit: 'g', status: 'consumed' },
      { id: 'pm_3', raw_material_id: 'rm_10', raw_material_name: 'Cardamom (Elaichi)', reserved_quantity: 25, actual_used: 25, unit: 'g', status: 'consumed' },
    ],
    activity_log: [
      { id: 'al_1', timestamp: '2024-05-30T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
      { id: 'al_2', timestamp: '2024-06-01T09:00:00Z', action: 'Production started', performed_by: 'Kasim Kadiwala' },
      { id: 'al_3', timestamp: '2024-06-01T15:00:00Z', action: 'Production completed – 500g produced', performed_by: 'Kasim Kadiwala' },
    ],
  },
  {
    id: 'po_2', order_number: 'PROD-2002', recipe_id: 'rec_2', recipe_name: 'Roasted Ajwain Blend', recipe_version: 2,
    product_variant: 'Roasted Ajwain Mix – 100g', planned_quantity: 300, actual_quantity: 0, unit: 'g',
    status: 'in_progress', scheduled_date: '2024-06-15', started_at: '2024-06-15T08:00:00Z',
    assigned_staff_id: 'staff_2', assigned_staff_name: 'Kasim Kadiwala', created_by: 'Admin User', created_at: '2024-06-13T10:00:00Z',
    materials: [
      { id: 'pm_4', raw_material_id: 'rm_2', raw_material_name: 'Ajwain Seeds', reserved_quantity: 210, actual_used: 0, unit: 'g', status: 'reserved' },
      { id: 'pm_5', raw_material_id: 'rm_12', raw_material_name: 'Rock Salt', reserved_quantity: 60, actual_used: 0, unit: 'g', status: 'reserved' },
      { id: 'pm_6', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 30, actual_used: 0, unit: 'g', status: 'reserved' },
    ],
    activity_log: [
      { id: 'al_4', timestamp: '2024-06-13T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
      { id: 'al_5', timestamp: '2024-06-15T08:00:00Z', action: 'Production started', performed_by: 'Kasim Kadiwala' },
    ],
  },
  {
    id: 'po_3', order_number: 'PROD-2003', recipe_id: 'rec_3', recipe_name: 'Meetha Paan Mix', recipe_version: 1,
    product_variant: 'Meetha Paan Mukhwas – 100g', planned_quantity: 200, actual_quantity: 0, unit: 'g',
    status: 'planned', scheduled_date: '2024-06-20',
    assigned_staff_id: 'staff_3', assigned_staff_name: 'Sehzad Khan', created_by: 'Admin User', created_at: '2024-06-14T10:00:00Z',
    materials: [
      { id: 'pm_7', raw_material_id: 'rm_8', raw_material_name: 'Gulkand', reserved_quantity: 60, actual_used: 0, unit: 'g', status: 'reserved' },
      { id: 'pm_8', raw_material_id: 'rm_13', raw_material_name: 'Tutti Frutti', reserved_quantity: 40, actual_used: 0, unit: 'g', status: 'reserved' },
      { id: 'pm_9', raw_material_id: 'rm_7', raw_material_name: 'Coconut Flakes', reserved_quantity: 50, actual_used: 0, unit: 'g', status: 'reserved' },
      { id: 'pm_10', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 50, actual_used: 0, unit: 'g', status: 'reserved' },
    ],
    activity_log: [
      { id: 'al_6', timestamp: '2024-06-14T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
    ],
  },
  {
    id: 'po_4', order_number: 'PROD-2004', recipe_id: 'rec_4', recipe_name: 'Kesar Badam Premium', recipe_version: 2,
    product_variant: 'Kesar Badam Mix – 100g', planned_quantity: 100, actual_quantity: 80, unit: 'g',
    status: 'partially_completed', scheduled_date: '2024-06-10', started_at: '2024-06-10T09:00:00Z', completed_at: '2024-06-10T16:00:00Z',
    assigned_staff_id: 'staff_2', assigned_staff_name: 'Kasim Kadiwala', created_by: 'Admin User', created_at: '2024-06-08T10:00:00Z',
    materials: [
      { id: 'pm_11', raw_material_id: 'rm_4', raw_material_name: 'Saffron (Kesar)', reserved_quantity: 0.5, actual_used: 0.4, unit: 'g', status: 'consumed' },
      { id: 'pm_12', raw_material_id: 'rm_5', raw_material_name: 'Almonds (Badam)', reserved_quantity: 40, actual_used: 32, unit: 'g', status: 'consumed' },
      { id: 'pm_13', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 50, actual_used: 40, unit: 'g', status: 'consumed' },
      { id: 'pm_14', raw_material_id: 'rm_11', raw_material_name: 'Sugar', reserved_quantity: 9.5, actual_used: 7.6, unit: 'g', status: 'consumed' },
    ],
    activity_log: [
      { id: 'al_7', timestamp: '2024-06-08T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
      { id: 'al_8', timestamp: '2024-06-10T09:00:00Z', action: 'Production started', performed_by: 'Kasim Kadiwala' },
      { id: 'al_9', timestamp: '2024-06-10T16:00:00Z', action: 'Partially completed – 80g of 100g produced', performed_by: 'Kasim Kadiwala' },
    ],
  },
  {
    id: 'po_5', order_number: 'PROD-2005', recipe_id: 'rec_5', recipe_name: 'Til Gul Special', recipe_version: 1,
    product_variant: 'Til Gul Mukhwas – 100g', planned_quantity: 1000, actual_quantity: 1000, unit: 'g',
    status: 'completed', scheduled_date: '2024-05-25', started_at: '2024-05-25T08:00:00Z', completed_at: '2024-05-25T17:00:00Z',
    assigned_staff_id: 'staff_3', assigned_staff_name: 'Sehzad Khan', created_by: 'Admin User', created_at: '2024-05-23T10:00:00Z',
    materials: [
      { id: 'pm_15', raw_material_id: 'rm_3', raw_material_name: 'Sesame Seeds (Til)', reserved_quantity: 600, actual_used: 600, unit: 'g', status: 'consumed' },
      { id: 'pm_16', raw_material_id: 'rm_15', raw_material_name: 'Jaggery (Gur)', reserved_quantity: 350, actual_used: 350, unit: 'g', status: 'consumed' },
      { id: 'pm_17', raw_material_id: 'rm_10', raw_material_name: 'Cardamom (Elaichi)', reserved_quantity: 50, actual_used: 50, unit: 'g', status: 'consumed' },
    ],
    activity_log: [
      { id: 'al_10', timestamp: '2024-05-23T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
      { id: 'al_11', timestamp: '2024-05-25T08:00:00Z', action: 'Production started', performed_by: 'Sehzad Khan' },
      { id: 'al_12', timestamp: '2024-05-25T17:00:00Z', action: 'Production completed – 1000g produced', performed_by: 'Sehzad Khan' },
    ],
  },
  {
    id: 'po_6', order_number: 'PROD-2006', recipe_id: 'rec_7', recipe_name: 'Rose Petal Saunf', recipe_version: 3,
    product_variant: 'Rose Petal Mukhwas – 100g', planned_quantity: 400, actual_quantity: 0, unit: 'g',
    status: 'cancelled', scheduled_date: '2024-06-05',
    assigned_staff_id: 'staff_2', assigned_staff_name: 'Kasim Kadiwala', created_by: 'Admin User', created_at: '2024-06-03T10:00:00Z',
    materials: [
      { id: 'pm_18', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 260, actual_used: 0, unit: 'g', status: 'released' },
      { id: 'pm_19', raw_material_id: 'rm_9', raw_material_name: 'Rose Petals', reserved_quantity: 80, actual_used: 0, unit: 'g', status: 'released' },
      { id: 'pm_20', raw_material_id: 'rm_11', raw_material_name: 'Sugar', reserved_quantity: 60, actual_used: 0, unit: 'g', status: 'released' },
    ],
    activity_log: [
      { id: 'al_13', timestamp: '2024-06-03T10:00:00Z', action: 'Production order created', performed_by: 'Admin User' },
      { id: 'al_14', timestamp: '2024-06-04T14:00:00Z', action: 'Order cancelled – Rose petals supply delayed', performed_by: 'Admin User' },
    ],
  },
  {
    id: 'po_7', order_number: 'PROD-2007', recipe_id: 'rec_6', recipe_name: 'Dry Fruit Supreme Blend', recipe_version: 1,
    product_variant: 'Dry Fruit Supreme – 200g', planned_quantity: 150, actual_quantity: 150, unit: 'g',
    status: 'completed', scheduled_date: '2024-05-20', started_at: '2024-05-20T09:00:00Z', completed_at: '2024-05-20T14:00:00Z',
    assigned_staff_id: 'staff_3', assigned_staff_name: 'Sehzad Khan', created_by: 'Kasim Kadiwala', created_at: '2024-05-18T10:00:00Z',
    materials: [
      { id: 'pm_21', raw_material_id: 'rm_5', raw_material_name: 'Almonds (Badam)', reserved_quantity: 45, actual_used: 45, unit: 'g', status: 'consumed' },
      { id: 'pm_22', raw_material_id: 'rm_6', raw_material_name: 'Cashew Nuts (Kaju)', reserved_quantity: 37.5, actual_used: 37.5, unit: 'g', status: 'consumed' },
      { id: 'pm_23', raw_material_id: 'rm_1', raw_material_name: 'Fennel Seeds (Saunf)', reserved_quantity: 52.5, actual_used: 52.5, unit: 'g', status: 'consumed' },
      { id: 'pm_24', raw_material_id: 'rm_10', raw_material_name: 'Cardamom (Elaichi)', reserved_quantity: 15, actual_used: 15, unit: 'g', status: 'consumed' },
    ],
    activity_log: [
      { id: 'al_15', timestamp: '2024-05-18T10:00:00Z', action: 'Production order created', performed_by: 'Kasim Kadiwala' },
      { id: 'al_16', timestamp: '2024-05-20T09:00:00Z', action: 'Production started', performed_by: 'Sehzad Khan' },
      { id: 'al_17', timestamp: '2024-05-20T14:00:00Z', action: 'Production completed – 150g produced', performed_by: 'Sehzad Khan' },
    ],
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `po_${8 + i}`, order_number: `PROD-200${8 + i}`,
    recipe_id: `rec_${(i % 8) + 1}`,
    recipe_name: ['Classic Saunf Recipe', 'Roasted Ajwain Blend', 'Meetha Paan Mix', 'Kesar Badam Premium', 'Til Gul Special', 'Dry Fruit Supreme Blend', 'Rose Petal Saunf', 'Jeera Goli Recipe'][i % 8],
    recipe_version: [3, 2, 1, 2, 1, 1, 3, 1][i % 8],
    product_variant: ['Saunf Mukhwas – 100g', 'Roasted Ajwain Mix – 100g', 'Meetha Paan Mukhwas – 100g', 'Kesar Badam Mix – 100g', 'Til Gul Mukhwas – 100g', 'Dry Fruit Supreme – 200g', 'Rose Petal Mukhwas – 100g', 'Jeera Goli – 100g'][i % 8],
    planned_quantity: [200, 300, 150, 50, 500, 100, 250, 400][i % 8],
    actual_quantity: i < 4 ? [200, 300, 150, 50][i] : 0,
    unit: 'g',
    status: (['completed', 'completed', 'completed', 'completed', 'planned', 'planned', 'planned', 'planned'] as ProductionStatus[])[i],
    scheduled_date: `2024-0${i < 4 ? 5 : 6}-${10 + i * 2}`,
    started_at: i < 4 ? `2024-05-${10 + i * 2}T09:00:00Z` : undefined,
    completed_at: i < 4 ? `2024-05-${10 + i * 2}T16:00:00Z` : undefined,
    assigned_staff_id: i % 2 === 0 ? 'staff_2' : 'staff_3',
    assigned_staff_name: i % 2 === 0 ? 'Kasim Kadiwala' : 'Sehzad Khan',
    created_by: 'Admin User',
    created_at: `2024-0${i < 4 ? 5 : 6}-${8 + i * 2}T10:00:00Z`,
    materials: [],
    activity_log: [
      { id: `al_e_${i}_1`, timestamp: `2024-0${i < 4 ? 5 : 6}-${8 + i * 2}T10:00:00Z`, action: 'Production order created', performed_by: 'Admin User' },
    ],
  })),
];
