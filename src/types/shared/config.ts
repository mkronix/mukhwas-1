import type { TaxType } from './enums';

export interface SystemConfig {
    id: string;
    key: string;
    value: string;
    surface: 'storefront' | 'admin' | 'pos' | 'global';
    updated_at: string;
}

export interface GSTConfig {
    id: string;
    business_gstin: string;
    business_name: string;
    business_address: string;
    state_code: string;
    default_tax_type: TaxType;
    is_composition_scheme: boolean;
    enable_gst_on_sales: boolean;
    enable_itc_tracking: boolean;
    rounding_precision: number;
    rounding_method: 'normal' | 'bankers';
    updated_at: string;
}