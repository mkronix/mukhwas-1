import type { SupplierRecord } from '@/types';

export const mockSuppliers: SupplierRecord[] = [
  {
    id: 'sup_1', name: 'Patel Spices Co.', contact_person: 'Rajesh Patel', phone: '9876001001', email: 'rajesh@patelspices.com',
    address: '45 Spice Market, Unjha, Gujarat 384170', gstin: '24AABCP1234A1Z5', pan: 'AABCP1234A',
    payment_terms: 'net_30', is_active: true, bank_name: 'State Bank of India', account_number: '30012345678',
    ifsc_code: 'SBIN0001234', account_holder: 'Patel Spices Co.', outstanding_paisa: 4500000,
    last_purchase_date: '2024-06-10T10:00:00Z', linked_materials_count: 3, created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'sup_2', name: 'Sharma Dry Fruits', contact_person: 'Vikram Sharma', phone: '9876001002', email: 'vikram@sharmadryfruits.in',
    address: '12 Khari Baoli, Delhi 110006', gstin: '07AABCS5678B1Z3', pan: 'AABCS5678B',
    payment_terms: 'net_45', is_active: true, bank_name: 'HDFC Bank', account_number: '50100123456789',
    ifsc_code: 'HDFC0001234', account_holder: 'Sharma Dry Fruits Pvt Ltd', outstanding_paisa: 8200000,
    last_purchase_date: '2024-06-05T10:00:00Z', linked_materials_count: 4, created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'sup_3', name: 'Gujarat Masala Works', contact_person: 'Dinesh Mehta', phone: '9876001003', email: 'dinesh@gujaratmasala.com',
    address: '78 Industrial Area, Ahmedabad, Gujarat 380015', gstin: '24AABCG9012C1Z1', pan: 'AABCG9012C',
    payment_terms: 'net_30', is_active: true, bank_name: 'ICICI Bank', account_number: '12340567890123',
    ifsc_code: 'ICIC0001234', account_holder: 'Gujarat Masala Works', outstanding_paisa: 1200000,
    last_purchase_date: '2024-05-28T10:00:00Z', linked_materials_count: 2, created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'sup_4', name: 'Kashmir Saffron House', contact_person: 'Abdul Rashid', phone: '9876001004', email: 'rashid@kashmirsaffron.in',
    address: '3 Dal Gate, Srinagar, J&K 190001', gstin: '01AABCK3456D1Z7', pan: 'AABCK3456D',
    payment_terms: 'immediate', is_active: true, bank_name: 'J&K Bank', account_number: '0123456789012',
    ifsc_code: 'JAKA0001234', account_holder: 'Kashmir Saffron House', outstanding_paisa: 15000000,
    last_purchase_date: '2024-06-01T10:00:00Z', linked_materials_count: 1, created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'sup_5', name: 'Rajasthan Nuts Ltd.', contact_person: 'Suresh Agarwal', phone: '9876001005', email: 'suresh@rajnuts.com',
    address: '22 Station Road, Jaipur, Rajasthan 302001', gstin: '08AABCR7890E1Z4', pan: 'AABCR7890E',
    payment_terms: 'net_60', is_active: true, bank_name: 'Bank of Baroda', account_number: '78901234567890',
    ifsc_code: 'BARB0001234', account_holder: 'Rajasthan Nuts Ltd', outstanding_paisa: 3400000,
    last_purchase_date: '2024-05-20T10:00:00Z', linked_materials_count: 2, created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'sup_6', name: 'Kerala Coconut Traders', contact_person: 'Thomas Kurian', phone: '9876001006', email: 'thomas@keralacoconut.com',
    address: '9 Fort Cochin, Kochi, Kerala 682001', gstin: '32AABCK1234F1Z2', pan: 'AABCK1234F',
    payment_terms: 'net_30', is_active: true, bank_name: 'Federal Bank', account_number: '11223344556677',
    ifsc_code: 'FDRL0001234', account_holder: 'Kerala Coconut Traders', outstanding_paisa: 750000,
    last_purchase_date: '2024-05-15T10:00:00Z', linked_materials_count: 1, created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'sup_7', name: 'Delhi Gulkand House', contact_person: 'Manoj Kumar', phone: '9876001007', email: 'manoj@gulkandhouse.in',
    address: '56 Chandni Chowk, Delhi 110006', gstin: '07AABCD5678G1Z9', pan: 'AABCD5678G',
    payment_terms: 'net_15', is_active: true, bank_name: 'Punjab National Bank', account_number: '22334455667788',
    ifsc_code: 'PUNB0001234', account_holder: 'Delhi Gulkand House', outstanding_paisa: 2100000,
    last_purchase_date: '2024-06-08T10:00:00Z', linked_materials_count: 2, created_at: '2024-03-10T10:00:00Z',
  },
  {
    id: 'sup_8', name: 'Mysore Cardamom Farm', contact_person: 'Ravi Gowda', phone: '9876001008', email: 'shahin@mysorecard.com',
    address: '15 Agrahara, Mysore, Karnataka 570001', gstin: '29AABCM9012H1Z6', pan: 'AABCM9012H',
    payment_terms: 'net_30', is_active: false, bank_name: 'Canara Bank', account_number: '33445566778899',
    ifsc_code: 'CNRB0001234', account_holder: 'Mysore Cardamom Farm', outstanding_paisa: 0,
    last_purchase_date: '2024-04-01T10:00:00Z', linked_materials_count: 1, created_at: '2024-03-20T10:00:00Z',
  },
];
