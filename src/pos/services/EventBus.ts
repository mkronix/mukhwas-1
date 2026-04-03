import { EVENT_TYPES, type EventType, type EventHandler } from '@/admin/services/EventBus';

class POSEventBus {
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

export { EVENT_TYPES };
export const EventBus = new POSEventBus();
