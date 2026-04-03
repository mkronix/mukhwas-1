export interface CMSSlider {
    id: string;
    title: string;
    image_url: string;
    link_url?: string;
    sort_order: number;
    is_active: boolean;
}

export interface CMSBanner {
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    link_url?: string;
    position: string;
    is_active: boolean;
}

export interface CMSFeaturedSection {
    id: string;
    title: string;
    type: 'category' | 'product' | 'custom';
    reference_ids: string[];
    sort_order: number;
    is_active: boolean;
}

export interface NotificationTemplate {
    id: string;
    key: string;
    channel: 'email' | 'sms' | 'push';
    subject?: string;
    body: string;
    variables: string[];
    is_active: boolean;
}