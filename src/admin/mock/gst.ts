import type { GSTConfig, GSTReportRow, GSTConfigForm } from '@/types';

export const mockGSTConfig: GSTConfig = {
  id: 'gst_1',
  business_gstin: '24AABCM1234A1Z5',
  business_name: 'Mukhwas Commerce Pvt Ltd',
  business_address: '12 Spice Lane, Unjha, Gujarat 384170',
  state_code: '24',
  default_tax_type: 'intra_state',
  is_composition_scheme: false,
  enable_gst_on_sales: true,
  enable_itc_tracking: true,
  rounding_precision: 2,
  rounding_method: 'normal',
  updated_at: '2024-06-01T10:00:00Z',
};

const months = ['April', 'May', 'June'];
const monthDates = ['2024-04', '2024-05', '2024-06'];

function generateRows(isOutward: boolean): GSTReportRow[] {
  const rows: GSTReportRow[] = [];
  const names = isOutward
    ? ['Rajesh Kumar', 'Anita Patel', 'Suresh Jain', 'Meena Shah', 'Deepak Gupta', 'Nisha Desai', 'Arjun Reddy', 'Pooja Sharma']
    : ['Patel Spices Co.', 'Sharma Dry Fruits', 'Gujarat Masala Works', 'Kashmir Saffron House', 'Rajasthan Nuts Ltd.', 'Kerala Coconut Traders', 'Delhi Gulkand House', 'Mysore Cardamom Farm'];
  const gstins = isOutward ? [] : ['24AABCP1234A1Z5', '07AABCS5678B1Z3', '24AABCG9012C1Z1', '01AABCK3456D1Z7', '08AABCR7890E1Z4', '32AABCK1234F1Z2', '07AABCD5678G1Z9', '29AABCM9012H1Z6'];

  for (let m = 0; m < 3; m++) {
    for (let i = 0; i < 8; i++) {
      const taxable = (50000 + (i * 15000) + (m * 5000)) * 100;
      const slab = ['5', '12', '5', '18', '12', '5', '18', '5'][i];
      const rate = Number(slab) / 100;
      const gst = Math.round(taxable * rate);
      rows.push({
        id: `gst_${isOutward ? 'o' : 'i'}_${m}_${i}`,
        invoice_number: isOutward ? `INV-${monthDates[m].replace('-', '')}-${i + 1}` : `BILL-${monthDates[m].replace('-', '')}-${i + 1}`,
        date: `${monthDates[m]}-${String(i * 3 + 2).padStart(2, '0')}T10:00:00Z`,
        party_name: names[i],
        party_gstin: isOutward ? undefined : gstins[i],
        hsn_code: ['0909', '0802', '1207', '2007', '0801', '0910', '2106', '0908'][i],
        gst_slab: slab,
        taxable_paisa: taxable,
        cgst_paisa: Math.round(gst / 2),
        sgst_paisa: Math.round(gst / 2),
        igst_paisa: 0,
        total_paisa: taxable + gst,
        itc_eligible: isOutward ? undefined : true,
      });
    }
  }
  return rows;
}

export const mockGSTR1Data = generateRows(true);
export const mockGSTR2Data = generateRows(false);

export const mockITCSummary = {
  total_available_paisa: 4850000,
  total_utilized_paisa: 3200000,
  balance_paisa: 1650000,
  monthly: [
    { month: 'April 2024', available_paisa: 1500000, utilized_paisa: 1200000 },
    { month: 'May 2024', available_paisa: 1700000, utilized_paisa: 1000000 },
    { month: 'June 2024', available_paisa: 1650000, utilized_paisa: 1000000 },
  ],
};

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' }, { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' }, { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' }, { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' }, { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' }, { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' }, { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' }, { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' }, { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' }, { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' }, { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' }, { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' }, { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' }, { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' }, { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' }, { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];
