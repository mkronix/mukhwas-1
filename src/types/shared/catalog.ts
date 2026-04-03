import type { GSTSlab, InventoryMode } from './enums';

export interface ProductUI {
    card_bg: string;
    name_color: string;
    price_color: string;
    cta_bg: string;
    cta_text: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

export interface Subcategory {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    category_id: string;
    subcategory_id?: string;
    base_price_paisa: number;
    gst_slab: GSTSlab;
    hsn_code: string;
    inventory_mode: InventoryMode;
    is_active: boolean;
    image_url?: string;
    images: string[];
    variants: ProductVariant[];
    ui?: ProductUI;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    sku: string;
    weight_grams: number;
    price_paisa: number;
    compare_at_price_paisa?: number;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
}

export interface ProductBundle {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_paisa: number;
    items: BundleItem[];
    is_active: boolean;
    image_url?: string;
    created_at: string;
}

export interface BundleItem {
    id: string;
    bundle_id: string;
    variant_id: string;
    quantity: number;
}