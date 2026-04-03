import type { RecipeRecord, RecipeIngredientRecord } from '@/types';

const mkIngredient = (id: string, rmId: string, name: string, qty: number, unit: string, cost: number): RecipeIngredientRecord => ({
  id, raw_material_id: rmId, raw_material_name: name, quantity: qty, unit, cost_per_unit_paisa: cost,
});

export const mockRecipes: RecipeRecord[] = [
  {
    id: 'rec_1', name: 'Classic Saunf Recipe', product_id: 'prod_1', variant_id: 'v_1a', variant_label: 'Saunf Mukhwas – 100g',
    output_quantity: 100, output_unit: 'g', version: 3, status: 'active', notes: 'Classic blend, top seller',
    created_by: 'Admin User', updated_at: '2024-06-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_1', 'rm_1', 'Fennel Seeds (Saunf)', 80, 'g', 1440),
      mkIngredient('ri_2', 'rm_11', 'Sugar', 15, 'g', 68),
      mkIngredient('ri_3', 'rm_10', 'Cardamom (Elaichi)', 5, 'g', 1250),
    ],
    versions: [
      { version: 1, changed_at: '2024-01-15T10:00:00Z', changed_by: 'Admin User', diff_summary: 'Initial version', ingredients: [mkIngredient('ri_v1_1', 'rm_1', 'Fennel Seeds (Saunf)', 85, 'g', 1530), mkIngredient('ri_v1_2', 'rm_11', 'Sugar', 15, 'g', 68)] },
      { version: 2, changed_at: '2024-03-20T10:00:00Z', changed_by: 'Kasim Kadiwala', diff_summary: 'Added Cardamom, reduced Fennel from 85g to 82g', ingredients: [mkIngredient('ri_v2_1', 'rm_1', 'Fennel Seeds (Saunf)', 82, 'g', 1476), mkIngredient('ri_v2_2', 'rm_11', 'Sugar', 15, 'g', 68), mkIngredient('ri_v2_3', 'rm_10', 'Cardamom (Elaichi)', 3, 'g', 750)] },
    ],
  },
  {
    id: 'rec_2', name: 'Roasted Ajwain Blend', product_id: 'prod_2', variant_id: 'v_2a', variant_label: 'Roasted Ajwain Mix – 100g',
    output_quantity: 100, output_unit: 'g', version: 2, status: 'active', notes: 'Digestive focus blend',
    created_by: 'Admin User', updated_at: '2024-05-15T10:00:00Z',
    ingredients: [
      mkIngredient('ri_4', 'rm_2', 'Ajwain Seeds', 70, 'g', 1750),
      mkIngredient('ri_5', 'rm_12', 'Rock Salt', 20, 'g', 40),
      mkIngredient('ri_6', 'rm_1', 'Fennel Seeds (Saunf)', 10, 'g', 180),
    ],
    versions: [
      { version: 1, changed_at: '2024-02-01T10:00:00Z', changed_by: 'Admin User', diff_summary: 'Initial version with 75g Ajwain', ingredients: [mkIngredient('ri_v1_4', 'rm_2', 'Ajwain Seeds', 75, 'g', 1875), mkIngredient('ri_v1_5', 'rm_12', 'Rock Salt', 25, 'g', 50)] },
    ],
  },
  {
    id: 'rec_3', name: 'Meetha Paan Mix', product_id: 'prod_3', variant_id: 'v_3a', variant_label: 'Meetha Paan Mukhwas – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: '',
    created_by: 'Kasim Kadiwala', updated_at: '2024-04-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_7', 'rm_8', 'Gulkand', 30, 'g', 3600),
      mkIngredient('ri_8', 'rm_13', 'Tutti Frutti', 20, 'g', 600),
      mkIngredient('ri_9', 'rm_7', 'Coconut Flakes', 25, 'g', 375),
      mkIngredient('ri_10', 'rm_1', 'Fennel Seeds (Saunf)', 25, 'g', 450),
    ],
    versions: [],
  },
  {
    id: 'rec_4', name: 'Kesar Badam Premium', product_id: 'prod_4', variant_id: 'v_4a', variant_label: 'Kesar Badam Mix – 100g',
    output_quantity: 100, output_unit: 'g', version: 2, status: 'active', notes: 'Premium segment recipe',
    created_by: 'Admin User', updated_at: '2024-05-20T10:00:00Z',
    ingredients: [
      mkIngredient('ri_11', 'rm_4', 'Saffron (Kesar)', 0.5, 'g', 2500000),
      mkIngredient('ri_12', 'rm_5', 'Almonds (Badam)', 40, 'g', 3200),
      mkIngredient('ri_13', 'rm_1', 'Fennel Seeds (Saunf)', 50, 'g', 900),
      mkIngredient('ri_14', 'rm_11', 'Sugar', 9.5, 'g', 43),
    ],
    versions: [
      { version: 1, changed_at: '2024-03-01T10:00:00Z', changed_by: 'Admin User', diff_summary: 'Initial version with 0.3g saffron', ingredients: [mkIngredient('ri_v1_11', 'rm_4', 'Saffron (Kesar)', 0.3, 'g', 1500000), mkIngredient('ri_v1_12', 'rm_5', 'Almonds (Badam)', 45, 'g', 3600), mkIngredient('ri_v1_13', 'rm_1', 'Fennel Seeds (Saunf)', 45, 'g', 810), mkIngredient('ri_v1_14', 'rm_11', 'Sugar', 9.7, 'g', 44)] },
    ],
  },
  {
    id: 'rec_5', name: 'Til Gul Special', product_id: 'prod_5', variant_id: 'v_5a', variant_label: 'Til Gul Mukhwas – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: 'Festive blend',
    created_by: 'Admin User', updated_at: '2024-03-15T10:00:00Z',
    ingredients: [
      mkIngredient('ri_15', 'rm_3', 'Sesame Seeds (Til)', 60, 'g', 720),
      mkIngredient('ri_16', 'rm_15', 'Jaggery (Gur)', 35, 'g', 210),
      mkIngredient('ri_17', 'rm_10', 'Cardamom (Elaichi)', 5, 'g', 1250),
    ],
    versions: [],
  },
  {
    id: 'rec_6', name: 'Dry Fruit Supreme Blend', product_id: 'prod_6', variant_id: 'v_6a', variant_label: 'Dry Fruit Supreme – 200g',
    output_quantity: 200, output_unit: 'g', version: 1, status: 'active', notes: '',
    created_by: 'Admin User', updated_at: '2024-04-10T10:00:00Z',
    ingredients: [
      mkIngredient('ri_18', 'rm_5', 'Almonds (Badam)', 60, 'g', 4800),
      mkIngredient('ri_19', 'rm_6', 'Cashew Nuts (Kaju)', 50, 'g', 4750),
      mkIngredient('ri_20', 'rm_1', 'Fennel Seeds (Saunf)', 70, 'g', 1260),
      mkIngredient('ri_21', 'rm_10', 'Cardamom (Elaichi)', 20, 'g', 5000),
    ],
    versions: [],
  },
  {
    id: 'rec_7', name: 'Rose Petal Saunf', product_id: 'prod_7', variant_id: 'v_7a', variant_label: 'Rose Petal Mukhwas – 100g',
    output_quantity: 100, output_unit: 'g', version: 3, status: 'active', notes: 'Floral notes, customer favorite',
    created_by: 'Admin User', updated_at: '2024-06-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_22', 'rm_1', 'Fennel Seeds (Saunf)', 65, 'g', 1170),
      mkIngredient('ri_23', 'rm_9', 'Rose Petals', 20, 'g', 4000),
      mkIngredient('ri_24', 'rm_11', 'Sugar', 15, 'g', 68),
    ],
    versions: [
      { version: 1, changed_at: '2024-01-20T10:00:00Z', changed_by: 'Admin User', diff_summary: 'Initial: 70g fennel, 15g rose', ingredients: [mkIngredient('r_v1', 'rm_1', 'Fennel Seeds (Saunf)', 70, 'g', 1260), mkIngredient('r_v2', 'rm_9', 'Rose Petals', 15, 'g', 3000), mkIngredient('r_v3', 'rm_11', 'Sugar', 15, 'g', 68)] },
      { version: 2, changed_at: '2024-04-10T10:00:00Z', changed_by: 'Kasim Kadiwala', diff_summary: 'Increased rose to 18g, fennel to 67g', ingredients: [mkIngredient('r_v4', 'rm_1', 'Fennel Seeds (Saunf)', 67, 'g', 1206), mkIngredient('r_v5', 'rm_9', 'Rose Petals', 18, 'g', 3600), mkIngredient('r_v6', 'rm_11', 'Sugar', 15, 'g', 68)] },
    ],
  },
  {
    id: 'rec_8', name: 'Jeera Goli Recipe', product_id: 'prod_10', variant_id: 'v_10a', variant_label: 'Jeera Goli – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: 'Tangy blend with black salt',
    created_by: 'Sehzad Khan', updated_at: '2024-05-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_25', 'rm_2', 'Ajwain Seeds', 50, 'g', 1250),
      mkIngredient('ri_26', 'rm_12', 'Rock Salt', 30, 'g', 60),
      mkIngredient('ri_27', 'rm_11', 'Sugar', 20, 'g', 90),
    ],
    versions: [],
  },
  {
    id: 'rec_9', name: 'Coconut Paan', product_id: 'prod_8', variant_id: 'v_8a', variant_label: 'Calcutta Paan Masala – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'inactive', notes: 'Discontinued',
    created_by: 'Admin User', updated_at: '2024-04-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_28', 'rm_14', 'Betel Nut', 40, 'g', 1800),
      mkIngredient('ri_29', 'rm_7', 'Coconut Flakes', 30, 'g', 450),
      mkIngredient('ri_30', 'rm_8', 'Gulkand', 20, 'g', 2400),
      mkIngredient('ri_31', 'rm_10', 'Cardamom (Elaichi)', 10, 'g', 2500),
    ],
    versions: [],
  },
  {
    id: 'rec_10', name: 'Elaichi Dana Mix', product_id: 'prod_extra_0', variant_id: 'v_extra_0', variant_label: 'Elaichi Dana – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: '',
    created_by: 'Admin User', updated_at: '2024-05-10T10:00:00Z',
    ingredients: [
      mkIngredient('ri_32', 'rm_10', 'Cardamom (Elaichi)', 60, 'g', 15000),
      mkIngredient('ri_33', 'rm_11', 'Sugar', 40, 'g', 180),
    ],
    versions: [],
  },
  {
    id: 'rec_11', name: 'Mint Saunf Fresh', product_id: 'prod_extra_3', variant_id: 'v_extra_3', variant_label: 'Mint Saunf – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: '',
    created_by: 'Kasim Kadiwala', updated_at: '2024-05-20T10:00:00Z',
    ingredients: [
      mkIngredient('ri_34', 'rm_1', 'Fennel Seeds (Saunf)', 75, 'g', 1350),
      mkIngredient('ri_35', 'rm_11', 'Sugar', 20, 'g', 90),
      mkIngredient('ri_36', 'rm_10', 'Cardamom (Elaichi)', 5, 'g', 1250),
    ],
    versions: [],
  },
  {
    id: 'rec_12', name: 'Pista Mukhwas Premium', product_id: 'prod_extra_8', variant_id: 'v_extra_8', variant_label: 'Pista Mukhwas – 100g',
    output_quantity: 100, output_unit: 'g', version: 1, status: 'active', notes: '',
    created_by: 'Admin User', updated_at: '2024-06-01T10:00:00Z',
    ingredients: [
      mkIngredient('ri_37', 'rm_6', 'Cashew Nuts (Kaju)', 30, 'g', 2850),
      mkIngredient('ri_38', 'rm_1', 'Fennel Seeds (Saunf)', 50, 'g', 900),
      mkIngredient('ri_39', 'rm_11', 'Sugar', 20, 'g', 90),
    ],
    versions: [],
  },
];
