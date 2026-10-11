/**
 * Ephemeral order store for webhook → status handoff on warm instances.
 * Authoritative paid status always comes from Stripe/Vipps APIs in order-status.
 */

export type PaymentProvider = 'stripe' | 'vipps';
export type OrderPaidStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown';

export interface OrderRecord {
  orderId: string;
  provider: PaymentProvider;
  providerRef: string;
  amountOre: number;
  currency: 'NOK';
  status: OrderPaidStatus;
  customerEmail?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, string>;
}

const globalStore = globalThis as typeof globalThis & {
  __ltOrders?: Map<string, OrderRecord>;
};

function store(): Map<string, OrderRecord> {
  if (!globalStore.__ltOrders) {
    globalStore.__ltOrders = new Map();
  }
  return globalStore.__ltOrders;
}

export function saveOrder(order: OrderRecord): void {
  store().set(order.orderId, order);
  if (order.providerRef) {
    store().set(`${order.provider}:${order.providerRef}`, order);
  }
}

export function getOrder(orderId: string): OrderRecord | undefined {
  return store().get(orderId);
}

export function getOrderByProviderRef(
  provider: PaymentProvider,
  ref: string
): OrderRecord | undefined {
  return store().get(`${provider}:${ref}`);
}

export function markOrderPaid(
  orderId: string,
  status: OrderPaidStatus = 'paid'
): OrderRecord | undefined {
  const order = store().get(orderId);
  if (!order) return undefined;
  const updated: OrderRecord = {
    ...order,
    status,
    updatedAt: new Date().toISOString(),
  };
  saveOrder(updated);
  return updated;
}

export function nokToOre(nok: number): number {
  return Math.round(nok * 100);
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `lt-${ts}-${rand}`;
}
