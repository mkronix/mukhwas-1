export interface CustomerAddress {
    id: string;
    customer_id: string;
    type: 'home' | 'work' | 'other';
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    is_verified: boolean;
    avatar_url?: string;
    addresses: CustomerAddress[];
    created_at: string;
    updated_at: string;
}