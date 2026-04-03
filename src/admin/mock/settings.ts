import type { StoreSettings, CommerceRules, NotificationEvent, POSSettingsData, PaymentModeConfig } from '@/types';

export const mockStoreSettings: StoreSettings = {
  brand_name: 'The Mukhwas Company',
  tagline: 'Premium Mouth Fresheners',
  logo_url: '',
  favicon_url: '',
  contact_email: 'hello@themukhwascompany.com',
  contact_phone: '+91 98765 43210',
  address: 'The Mukhwas Company, Andheri West, Mumbai, Maharashtra 400058',
  timezone: 'Asia/Kolkata',
};

export const mockCommerceRules: CommerceRules = {
  cod_enabled: true,
  free_shipping_threshold_paisa: 49900,
  default_shipping_charge_paisa: 4900,
  tax_display_mode: 'inclusive',
  low_stock_threshold_pct: 20,
  return_window_days: 7,
};

export const mockNotificationEvents: NotificationEvent[] = [
  { id: 'notif_1', event_key: 'order_confirmation', event_name: 'Order Confirmation', email_enabled: true, subject: 'Your order #{{order_number}} is confirmed!', body: 'Hi {{customer_name}}, thank you for your order.', variables: ['customer_name', 'order_number', 'order_total', 'order_date'] },
  { id: 'notif_2', event_key: 'order_status_update', event_name: 'Order Status Update', email_enabled: true, subject: 'Order #{{order_number}} — {{new_status}}', body: 'Your order status has been updated to {{new_status}}.', variables: ['customer_name', 'order_number', 'new_status', 'tracking_url'] },
  { id: 'notif_3', event_key: 'account_verification', event_name: 'Account Verification', email_enabled: true, subject: 'Verify your email', body: 'Click the link to verify: {{verification_link}}', variables: ['customer_name', 'verification_link'] },
  { id: 'notif_4', event_key: 'password_reset', event_name: 'Password Reset', email_enabled: true, subject: 'Reset your password', body: 'Click to reset: {{reset_link}}', variables: ['customer_name', 'reset_link'] },
  { id: 'notif_5', event_key: 'low_stock_alert', event_name: 'Low Stock Alert', email_enabled: false, subject: 'Low stock: {{product_name}}', body: '{{product_name}} ({{variant_name}}) has {{current_stock}} units left.', variables: ['product_name', 'variant_name', 'current_stock', 'reorder_level'] },
  { id: 'notif_6', event_key: 'production_complete', event_name: 'Production Order Complete', email_enabled: false, subject: 'Production #{{order_id}} completed', body: 'Production order {{order_id}} has been completed.', variables: ['order_id', 'recipe_name', 'quantity_produced'] },
];

export const mockPOSSettings: POSSettingsData = {
  receipt_header: 'The Mukhwas Company\nAndheri West, Mumbai',
  receipt_footer: 'Thank you! Visit again.',
  default_payment_mode: 'cash',
  session_timeout_minutes: 30,
  pin_lockout_attempts: 5,
  lockout_duration_minutes: 15,
  cash_drawer_prompt: true,
  payslip_format: 'standard',
  supplier_bill_format: 'standard',
  export_bill_format: 'standard',
};

export const mockPaymentModes: PaymentModeConfig[] = [
  { id: 'pm_1', mode: 'cash', label: 'Cash', description: 'Cash payments at counter', is_for_pos: true, is_for_storefront: false, is_active: true },
  { id: 'pm_2', mode: 'upi', label: 'UPI', description: 'UPI payments via QR or ID', is_for_pos: true, is_for_storefront: true, is_active: true },
  { id: 'pm_3', mode: 'card', label: 'Card', description: 'Credit/debit card payments', is_for_pos: true, is_for_storefront: true, is_active: true },
  { id: 'pm_4', mode: 'net_banking', label: 'Net Banking', description: 'Online bank transfer', is_for_pos: false, is_for_storefront: true, is_active: true },
  { id: 'pm_5', mode: 'cod', label: 'Cash on Delivery', description: 'Pay when order is delivered', is_for_pos: false, is_for_storefront: true, is_active: true },
];