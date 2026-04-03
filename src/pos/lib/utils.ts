export function generateReceiptNumber(): string {
  const counter = parseInt(localStorage.getItem('pos_receipt_counter') || '1000', 10);
  const next = counter + 1;
  localStorage.setItem('pos_receipt_counter', String(next));
  return `RCT-${next}`;
}

export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}
