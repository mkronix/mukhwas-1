import type { FinishedGoodRecord, RawMaterialRecord, StockMovementRecord } from '@/types';
import type { MovementType } from '@/types';

function getStatus(stock: number, reorder: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= reorder) return 'low_stock';
  return 'in_stock';
}

const fgNames: [string, string, string, string, string, number, number, number, string][] = [
  ['prod_1', 'Saunf Mukhwas', 'v_1a', '100g', 'SAUNF-100', 150, 20, 1800000, 'cat_1'],
  ['prod_1', 'Saunf Mukhwas', 'v_1b', '250g', 'SAUNF-250', 80, 15, 2240000, 'cat_1'],
  ['prod_1', 'Saunf Mukhwas', 'v_1c', '500g', 'SAUNF-500', 40, 10, 2080000, 'cat_1'],
  ['prod_2', 'Roasted Ajwain Mix', 'v_2a', '100g', 'AJWN-100', 200, 25, 3000000, 'cat_5'],
  ['prod_2', 'Roasted Ajwain Mix', 'v_2b', '250g', 'AJWN-250', 90, 15, 3150000, 'cat_5'],
  ['prod_3', 'Meetha Paan Mukhwas', 'v_3a', '100g', 'PAAN-100', 5, 20, 90000, 'cat_3'],
  ['prod_3', 'Meetha Paan Mukhwas', 'v_3b', '250g', 'PAAN-250', 0, 10, 0, 'cat_3'],
  ['prod_4', 'Kesar Badam Mix', 'v_4a', '100g', 'KBMX-100', 60, 10, 2700000, 'cat_2'],
  ['prod_4', 'Kesar Badam Mix', 'v_4b', '250g', 'KBMX-250', 25, 5, 2625000, 'cat_2'],
  ['prod_5', 'Til Gul Mukhwas', 'v_5a', '100g', 'TILG-100', 120, 20, 1680000, 'cat_1'],
  ['prod_6', 'Dry Fruit Supreme', 'v_6a', '200g', 'DFSUP-200', 35, 8, 1925000, 'cat_4'],
  ['prod_6', 'Dry Fruit Supreme', 'v_6b', '500g', 'DFSUP-500', 12, 5, 1500000, 'cat_4'],
  ['prod_7', 'Rose Petal Mukhwas', 'v_7a', '100g', 'ROSE-100', 95, 15, 2090000, 'cat_2'],
  ['prod_8', 'Calcutta Paan Masala', 'v_8a', '100g', 'CPAN-100', 0, 20, 0, 'cat_3'],
  ['prod_9', 'Festival Gift Box', 'v_9a', 'Standard', 'FGBOX-STD', 20, 5, 1998000, 'cat_6'],
  ['prod_9', 'Festival Gift Box', 'v_9b', 'Premium', 'FGBOX-PRM', 8, 3, 1519200, 'cat_6'],
  ['prod_10', 'Jeera Goli', 'v_10a', '100g', 'JGOL-100', 300, 50, 2400000, 'cat_5'],
  ['prod_10', 'Jeera Goli', 'v_10b', '250g', 'JGOL-250', 150, 30, 2700000, 'cat_5'],
];

export const mockFinishedGoods: FinishedGoodRecord[] = fgNames.map(([pid, pname, vid, vname, sku, stock, reorder, value, catId], i) => ({
  id: `fg_${i + 1}`,
  product_id: pid,
  product_name: pname,
  variant_id: vid,
  variant_name: vname,
  sku,
  category_id: catId,
  current_stock: stock,
  unit: 'g',
  reorder_level: reorder,
  stock_value_paisa: value,
  inventory_mode: (['prod_2', 'prod_7'].includes(pid) ? 'recipe_realtime' : 'finished_goods') as 'finished_goods' | 'recipe_realtime',
  last_movement_date: `2024-0${6 - (i % 5)}-${15 + (i % 10)}T10:00:00Z`,
  status: getStatus(stock, reorder),
}));

const extraFG: FinishedGoodRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `fg_${19 + i}`,
  product_id: `prod_extra_${i}`,
  product_name: ['Elaichi Dana', 'Supari Mix', 'Coconut Shred', 'Mint Saunf', 'Chandan Mukhwas', 'Gulkand Mix', 'Tulsi Mukhwas', 'Aam Papad Bites', 'Pista Mukhwas', 'Banarasi Paan', 'Thandai Mix', 'Khus Khus Mix'][i],
  variant_id: `v_extra_${i}`,
  variant_name: '100g',
  sku: `EXT-${100 + i}`,
  category_id: `cat_${(i % 6) + 1}`,
  current_stock: [45, 0, 180, 8, 200, 15, 3, 90, 0, 55, 120, 7][i],
  unit: 'g',
  reorder_level: [10, 20, 30, 15, 25, 10, 10, 20, 15, 10, 25, 10][i],
  stock_value_paisa: [675000, 0, 2700000, 160000, 3000000, 300000, 60000, 1350000, 0, 825000, 1800000, 140000][i],
  inventory_mode: 'finished_goods' as const,
  last_movement_date: `2024-0${(i % 5) + 2}-${10 + i}T10:00:00Z`,
  status: getStatus([45, 0, 180, 8, 200, 15, 3, 90, 0, 55, 120, 7][i], [10, 20, 30, 15, 25, 10, 10, 20, 15, 10, 25, 10][i]),
}));

mockFinishedGoods.push(...extraFG);

const rawMatNames = [
  'Fennel Seeds (Saunf)', 'Ajwain Seeds', 'Sesame Seeds (Til)', 'Saffron (Kesar)', 'Almonds (Badam)',
  'Cashew Nuts (Kaju)', 'Coconut Flakes', 'Gulkand', 'Rose Petals', 'Cardamom (Elaichi)',
  'Sugar', 'Rock Salt', 'Tutti Frutti', 'Betel Nut', 'Jaggery (Gur)',
];

export const mockRawMaterials: RawMaterialRecord[] = rawMatNames.map((name, i) => ({
  id: `rm_${i + 1}`,
  name,
  description: `High quality ${name.toLowerCase()} for mukhwas production`,
  current_stock: [500, 200, 350, 2, 50, 40, 80, 30, 10, 15, 1000, 300, 20, 60, 100][i],
  unit: i === 3 ? 'g' : 'kg',
  reorder_level: [100, 50, 80, 1, 10, 10, 20, 10, 5, 5, 200, 50, 10, 20, 30][i],
  preferred_supplier_id: `sup_${(i % 8) + 1}`,
  preferred_supplier_name: ['Patel Spices Co.', 'Sharma Dry Fruits', 'Gujarat Masala Works', 'Kashmir Saffron House', 'Rajasthan Nuts Ltd.', 'Kerala Coconut Traders', 'Delhi Gulkand House', 'Mysore Cardamom Farm'][i % 8],
  hsn_code: ['0909', '0910', '1207', '0910', '0802', '0801', '0801', '2007', '0603', '0908', '1701', '2501', '2106', '0802', '1701'][i],
  gst_slab: ['5', '5', '5', '5', '12', '12', '5', '18', '5', '5', '5', '0', '18', '18', '5'][i],
  last_purchase_date: `2024-0${(i % 4) + 3}-${10 + i}T10:00:00Z`,
  cost_per_unit_paisa: [18000, 25000, 12000, 5000000, 80000, 95000, 15000, 120000, 200000, 250000, 4500, 2000, 30000, 45000, 6000][i],
  status: getStatus(
    [500, 200, 350, 2, 50, 40, 80, 30, 10, 15, 1000, 300, 20, 60, 100][i],
    [100, 50, 80, 1, 10, 10, 20, 10, 5, 5, 200, 50, 10, 20, 30][i]
  ),
  linked_suppliers: [
    { supplier_id: `sup_${(i % 8) + 1}`, supplier_name: ['Patel Spices Co.', 'Sharma Dry Fruits', 'Gujarat Masala Works', 'Kashmir Saffron House', 'Rajasthan Nuts Ltd.', 'Kerala Coconut Traders', 'Delhi Gulkand House', 'Mysore Cardamom Farm'][i % 8], is_preferred: true },
    ...(i % 3 === 0 ? [{ supplier_id: `sup_${((i + 2) % 8) + 1}`, supplier_name: ['Patel Spices Co.', 'Sharma Dry Fruits', 'Gujarat Masala Works', 'Kashmir Saffron House', 'Rajasthan Nuts Ltd.', 'Kerala Coconut Traders', 'Delhi Gulkand House', 'Mysore Cardamom Farm'][(i + 2) % 8], is_preferred: false }] : []),
  ],
}));

const movementTypes: MovementType[] = ['purchase_receipt', 'production_in', 'production_out', 'sale', 'pos_sale', 'manual_adjustment', 'reversal'];

export const mockStockMovements: StockMovementRecord[] = Array.from({ length: 50 }, (_, i) => {
  const mt = movementTypes[i % 7];
  const isRaw = mt === 'purchase_receipt' || mt === 'production_out';
  const isPositive = ['purchase_receipt', 'production_in', 'manual_adjustment', 'reversal'].includes(mt);
  const qty = [50, 100, 25, 10, 5, 30, 15, 200, 75, 8][i % 10];
  const stockBefore = 100 + (i * 7) % 300;
  return {
    id: `mv_${i + 1}`,
    timestamp: new Date(2024, (i % 6) + 1, (i % 28) + 1, 10 + (i % 8), i % 60).toISOString(),
    movement_type: mt,
    item_name: isRaw ? mockRawMaterials[i % 15].name : mockFinishedGoods[i % 18].product_name,
    item_type: (isRaw ? 'raw_material' : 'finished_good') as 'finished_good' | 'raw_material',
    quantity_change: isPositive ? qty : -qty,
    stock_before: stockBefore,
    stock_after: isPositive ? stockBefore + qty : stockBefore - qty,
    unit: isRaw ? 'kg' : 'g',
    reference: `REF-${1000 + i}`,
    reference_label: ['PO-1001', 'PROD-2001', 'PROD-2001', 'ORD-3001', 'POS-4001', 'ADJ-5001', 'REV-6001'][i % 7],
    performed_by: ['Admin User', 'Kasim Kadiwala', 'Sehzad Khan', 'Sana Mirza'][i % 4],
  };
});
