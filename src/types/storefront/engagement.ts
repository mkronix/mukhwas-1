export interface Wishlist {
    id: string;
    customer_id: string;
    variant_id: string;
    added_at: string;
}

export interface CustomerReview {
    id: string;
    customer_id: string;
    product_id: string;
    rating: number;
    title?: string;
    body?: string;
    is_approved: boolean;
    created_at: string;
}