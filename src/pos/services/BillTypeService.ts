import env from '@/config/env';

export class BillTypeService {
  static suggestDocumentType(customerGstin?: string): 'tax_invoice' | 'bill_of_supply' {
    if (!env.IS_MOCK_MODE) {
      // In API mode this would be server-determined, but it's a pure utility
    }
    return customerGstin ? 'tax_invoice' : 'bill_of_supply';
  }
}
