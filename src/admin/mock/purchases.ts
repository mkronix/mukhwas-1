import type { PurchaseOrderRecord, PurchaseBillRecord, PurchaseReturnRecord, POLineItem } from '@/types';
import type { PurchaseOrderStatus, PaymentStatus, PurchaseReturnStatus } from '@/types';

function mkLineItem(i: number, rmId: string, name: string, qty: number, price: number, hsn: string, slab: string): POLineItem {
  const taxable = qty * price;
  const gstRate = Number(slab) / 100;
  const gst = Math.round(taxable * gstRate);
  return {
    id: `pli_${i}`, raw_material_id: rmId, raw_material_name: name, quantity: qty, unit: 'kg',
    unit_price_paisa: price, hsn_code: hsn, gst_slab: slab,
    taxable_paisa: taxable, gst_amount_paisa: gst, total_paisa: taxable + gst,
  };
}

const poData: { sup: string; supName: string; items: POLineItem[]; status: PurchaseOrderStatus }[] = [
  { sup: 'sup_1', supName: 'Patel Spices Co.', status: 'billed', items: [mkLineItem(1, 'rm_1', 'Fennel Seeds (Saunf)', 100, 18000, '0909', '5'), mkLineItem(2, 'rm_2', 'Ajwain Seeds', 50, 25000, '0910', '5')] },
  { sup: 'sup_2', supName: 'Sharma Dry Fruits', status: 'received', items: [mkLineItem(3, 'rm_5', 'Almonds (Badam)', 20, 80000, '0802', '12'), mkLineItem(4, 'rm_6', 'Cashew Nuts (Kaju)', 15, 95000, '0801', '12')] },
  { sup: 'sup_4', supName: 'Kashmir Saffron House', status: 'sent', items: [mkLineItem(5, 'rm_4', 'Saffron (Kesar)', 0.5, 5000000, '0910', '5')] },
  { sup: 'sup_3', supName: 'Gujarat Masala Works', status: 'draft', items: [mkLineItem(6, 'rm_3', 'Sesame Seeds (Til)', 80, 12000, '1207', '5')] },
  { sup: 'sup_5', supName: 'Rajasthan Nuts Ltd.', status: 'billed', items: [mkLineItem(7, 'rm_5', 'Almonds (Badam)', 30, 80000, '0802', '12'), mkLineItem(8, 'rm_6', 'Cashew Nuts (Kaju)', 25, 95000, '0801', '12')] },
  { sup: 'sup_6', supName: 'Kerala Coconut Traders', status: 'received', items: [mkLineItem(9, 'rm_7', 'Coconut Flakes', 50, 15000, '0801', '5')] },
  { sup: 'sup_7', supName: 'Delhi Gulkand House', status: 'billed', items: [mkLineItem(10, 'rm_8', 'Gulkand', 20, 120000, '2007', '18'), mkLineItem(11, 'rm_13', 'Tutti Frutti', 10, 30000, '2106', '18')] },
  { sup: 'sup_8', supName: 'Mysore Cardamom Farm', status: 'cancelled', items: [mkLineItem(12, 'rm_10', 'Cardamom (Elaichi)', 5, 250000, '0908', '5')] },
  { sup: 'sup_1', supName: 'Patel Spices Co.', status: 'billed', items: [mkLineItem(13, 'rm_1', 'Fennel Seeds (Saunf)', 200, 18000, '0909', '5')] },
  { sup: 'sup_2', supName: 'Sharma Dry Fruits', status: 'sent', items: [mkLineItem(14, 'rm_5', 'Almonds (Badam)', 10, 80000, '0802', '12')] },
  { sup: 'sup_1', supName: 'Patel Spices Co.', status: 'draft', items: [mkLineItem(15, 'rm_2', 'Ajwain Seeds', 40, 25000, '0910', '5')] },
  { sup: 'sup_3', supName: 'Gujarat Masala Works', status: 'received', items: [mkLineItem(16, 'rm_12', 'Rock Salt', 100, 2000, '2501', '0')] },
  { sup: 'sup_5', supName: 'Rajasthan Nuts Ltd.', status: 'sent', items: [mkLineItem(17, 'rm_6', 'Cashew Nuts (Kaju)', 20, 95000, '0801', '12')] },
  { sup: 'sup_7', supName: 'Delhi Gulkand House', status: 'received', items: [mkLineItem(18, 'rm_8', 'Gulkand', 15, 120000, '2007', '18')] },
  { sup: 'sup_4', supName: 'Kashmir Saffron House', status: 'billed', items: [mkLineItem(19, 'rm_4', 'Saffron (Kesar)', 0.3, 5000000, '0910', '5')] },
  { sup: 'sup_6', supName: 'Kerala Coconut Traders', status: 'draft', items: [mkLineItem(20, 'rm_7', 'Coconut Flakes', 30, 15000, '0801', '5')] },
  { sup: 'sup_1', supName: 'Patel Spices Co.', status: 'received', items: [mkLineItem(21, 'rm_1', 'Fennel Seeds (Saunf)', 150, 18000, '0909', '5'), mkLineItem(22, 'rm_12', 'Rock Salt', 50, 2000, '2501', '0')] },
  { sup: 'sup_2', supName: 'Sharma Dry Fruits', status: 'billed', items: [mkLineItem(23, 'rm_5', 'Almonds (Badam)', 25, 80000, '0802', '12')] },
  { sup: 'sup_3', supName: 'Gujarat Masala Works', status: 'sent', items: [mkLineItem(24, 'rm_3', 'Sesame Seeds (Til)', 60, 12000, '1207', '5')] },
  { sup: 'sup_7', supName: 'Delhi Gulkand House', status: 'billed', items: [mkLineItem(25, 'rm_8', 'Gulkand', 10, 120000, '2007', '18')] },
];

export const mockPurchaseOrders: PurchaseOrderRecord[] = poData.map((po, i) => {
  const subtotal = po.items.reduce((s, it) => s + it.taxable_paisa, 0);
  const gst = po.items.reduce((s, it) => s + it.gst_amount_paisa, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const month = pad((i % 5) + 2);
  const orderDay = pad((i % 20) + 5);
  const deliveryDay = pad((i % 20) + 15);
  return {
    id: `po_pur_${i + 1}`, po_number: `PO-${1001 + i}`,
    supplier_id: po.sup, supplier_name: po.supName,
    order_date: `2024-${month}-${orderDay}T10:00:00Z`,
    expected_delivery: `2024-${month}-${deliveryDay}T10:00:00Z`,
    items: po.items, status: po.status, notes: '',
    subtotal_paisa: subtotal, cgst_paisa: Math.round(gst / 2), sgst_paisa: Math.round(gst / 2),
    total_paisa: subtotal + gst, created_by: 'Admin User',
  };
});

const billedPOs = mockPurchaseOrders.filter(po => po.status === 'billed');

export const mockPurchaseBills: PurchaseBillRecord[] = billedPOs.map((po, i) => {
  const isPaid = i < 4;
  const isPartial = i === 4 || i === 5;
  const paidAmt = isPaid ? po.total_paisa : isPartial ? Math.round(po.total_paisa * 0.5) : 0;
  return {
    id: `bill_${i + 1}`, bill_number: `BILL-${2001 + i}`, po_id: po.id, po_number: po.po_number,
    supplier_id: po.supplier_id, supplier_name: po.supplier_name,
    supplier_gstin: ['24AABCP1234A1Z5', '07AABCS5678B1Z3', '24AABCG9012C1Z1', '01AABCK3456D1Z7', '08AABCR7890E1Z4', '32AABCK1234F1Z2', '07AABCD5678G1Z9', '29AABCM9012H1Z6'][i % 8],
    bill_date: po.order_date, due_date: po.expected_delivery,
    items: po.items, subtotal_paisa: po.subtotal_paisa, cgst_paisa: po.cgst_paisa, sgst_paisa: po.sgst_paisa, total_paisa: po.total_paisa,
    payment_status: (isPaid ? 'paid' : isPartial ? 'partial' : 'pending') as PaymentStatus,
    paid_amount_paisa: paidAmt,
    payments: isPaid ? [{ id: `pay_${i}`, amount_paisa: po.total_paisa, date: po.expected_delivery, mode: 'bank_transfer', reference: `REF-${3000 + i}` }]
      : isPartial ? [{ id: `pay_${i}`, amount_paisa: paidAmt, date: po.expected_delivery, mode: 'upi', reference: `REF-${3000 + i}` }] : [],
  };
});

export const mockPurchaseReturns: PurchaseReturnRecord[] = [
  { id: 'pr_1', return_id: 'RET-P001', bill_id: 'bill_1', bill_number: 'BILL-2001', supplier_id: 'sup_1', supplier_name: 'Patel Spices Co.', return_date: '2024-06-12T10:00:00Z', items: [{ raw_material_name: 'Fennel Seeds (Saunf)', quantity: 10, unit: 'kg', amount_paisa: 180000 }], total_paisa: 189000, reason: 'Quality below standards', status: 'credited' as PurchaseReturnStatus },
  { id: 'pr_2', return_id: 'RET-P002', bill_id: 'bill_2', bill_number: 'BILL-2002', supplier_id: 'sup_5', supplier_name: 'Rajasthan Nuts Ltd.', return_date: '2024-06-08T10:00:00Z', items: [{ raw_material_name: 'Almonds (Badam)', quantity: 5, unit: 'kg', amount_paisa: 400000 }], total_paisa: 448000, reason: 'Damaged packaging', status: 'approved' as PurchaseReturnStatus },
  { id: 'pr_3', return_id: 'RET-P003', bill_id: 'bill_3', bill_number: 'BILL-2003', supplier_id: 'sup_1', supplier_name: 'Patel Spices Co.', return_date: '2024-05-25T10:00:00Z', items: [{ raw_material_name: 'Fennel Seeds (Saunf)', quantity: 20, unit: 'kg', amount_paisa: 360000 }], total_paisa: 378000, reason: 'Wrong variety supplied', status: 'sent' as PurchaseReturnStatus },
  { id: 'pr_4', return_id: 'RET-P004', bill_id: 'bill_4', bill_number: 'BILL-2004', supplier_id: 'sup_4', supplier_name: 'Kashmir Saffron House', return_date: '2024-06-05T10:00:00Z', items: [{ raw_material_name: 'Saffron (Kesar)', quantity: 0.05, unit: 'g', amount_paisa: 250000 }], total_paisa: 262500, reason: 'Adulterated product', status: 'requested' as PurchaseReturnStatus },
  { id: 'pr_5', return_id: 'RET-P005', bill_id: 'bill_5', bill_number: 'BILL-2005', supplier_id: 'sup_7', supplier_name: 'Delhi Gulkand House', return_date: '2024-05-30T10:00:00Z', items: [{ raw_material_name: 'Gulkand', quantity: 3, unit: 'kg', amount_paisa: 360000 }], total_paisa: 424800, reason: 'Expired stock received', status: 'credited' as PurchaseReturnStatus },
];
