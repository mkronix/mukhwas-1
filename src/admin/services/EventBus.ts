export const EVENT_TYPES = {
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  PURCHASE_BILL_CREATED: 'PURCHASE_BILL_CREATED',
  PURCHASE_BILL_PAID: 'PURCHASE_BILL_PAID',
  PURCHASE_RETURN_CREATED: 'PURCHASE_RETURN_CREATED',
  SUPPLIER_PAYMENT_MADE: 'SUPPLIER_PAYMENT_MADE',
  EXPENSE_RECORDED: 'EXPENSE_RECORDED',
  PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED',
  PRODUCTION_CANCELLED: 'PRODUCTION_CANCELLED',
  BANK_TRANSACTION_IMPORTED: 'BANK_TRANSACTION_IMPORTED',
  STOCK_ADJUSTED: 'STOCK_ADJUSTED',
  POS_TRANSACTION_COMPLETED: 'POS_TRANSACTION_COMPLETED',
  POS_SESSION_CLOSED: 'POS_SESSION_CLOSED',
  SALARY_DISBURSED: 'SALARY_DISBURSED',
  ADVANCE_PAID: 'ADVANCE_PAID',
  ADVANCE_RECOVERED: 'ADVANCE_RECOVERED',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
export type EventHandler<T = unknown> = (payload: T) => void;

class AdminEventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private log: { type: EventType; payload: unknown; timestamp: number }[] = [];

  dispatch<T>(type: EventType, payload: T): void {
    this.log.push({ type, payload, timestamp: Date.now() });
    this.handlers.get(type)?.forEach(handler => handler(payload));
  }

  subscribe<T>(type: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler as EventHandler);
    return () => this.unsubscribe(type, handler);
  }

  unsubscribe<T>(type: EventType, handler: EventHandler<T>): void {
    this.handlers.get(type)?.delete(handler as EventHandler);
  }

  getLog() {
    return [...this.log];
  }
}

export const EventBus = new AdminEventBus();
