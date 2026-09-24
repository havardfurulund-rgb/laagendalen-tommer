import Stripe from 'stripe';
import type { TrustedProduct } from './catalog';
import type { DeliveryMode } from './delivery';
import type { PaymentProvider } from './orders';

export interface CartLineInput {
  id: string;
  quantity: number;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface ComputedLine {
  product: TrustedProduct;
  quantity: number;
  lineVareOre: number;
  linePantOre: number;
}

export interface ComputedOrder {
  lines: ComputedLine[];
  vareOre: number;
  pantOre: number;
  fraktOre: number;
  amountOre: number;
  mode: DeliveryMode;
  postalCode: string;
  deliveryLabel: string;
}

export function vippsConfigured(): boolean {
  const sub =
    process.env.VIPPS_SUBSCRIPTION_KEY ||
    process.env.VIPPS_OCP_APIM_SUBSCRIPTION_KEY;
  return Boolean(
    process.env.VIPPS_CLIENT_ID &&
      process.env.VIPPS_CLIENT_SECRET &&
      sub &&
      process.env.VIPPS_MSN
  );
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Resolve provider: CHECKOUT_PROVIDER override, else Stripe if key set (CoS GO),
 * else Vipps if keys set. Secrets are server-only — never VITE_*.
 */
export function resolveProvider(): PaymentProvider | null {
  const forced = (process.env.CHECKOUT_PROVIDER || '').toLowerCase().trim();
  if (forced === 'stripe') {
    return stripeConfigured() ? 'stripe' : null;
  }
  if (forced === 'vipps') {
    return vippsConfigured() ? 'vipps' : null;
  }
  if (stripeConfigured()) return 'stripe';
  if (vippsConfigured()) return 'vipps';
  return null;
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY mangler');
  return new Stripe(key);
}

function vippsBaseUrl(): string {
  return (
    process.env.VIPPS_API_URL ||
    process.env.VIPPS_API_BASE ||
    'https://apitest.vipps.no'
  ).replace(/\/$/, '');
}

function vippsSubscriptionKey(): string {
  return (
    process.env.VIPPS_SUBSCRIPTION_KEY ||
    process.env.VIPPS_OCP_APIM_SUBSCRIPTION_KEY ||
    ''
  );
}

export async function getVippsAccessToken(): Promise<string> {
  const clientId = process.env.VIPPS_CLIENT_ID!;
  const clientSecret = process.env.VIPPS_CLIENT_SECRET!;
  const sub = vippsSubscriptionKey();
  const res = await fetch(`${vippsBaseUrl()}/accesstoken/get`, {
    method: 'POST',
    headers: {
      client_id: clientId,
      client_secret: clientSecret,
      'Ocp-Apim-Subscription-Key': sub,
      'Merchant-Serial-Number': process.env.VIPPS_MSN || '',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vipps access token feilet (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Vipps access_token mangler i respons');
  return data.access_token;
}

export interface CreatePaymentResult {
  redirectUrl: string;
  providerRef: string;
  provider: PaymentProvider;
}

export async function createStripeCheckout(params: {
  orderId: string;
  computed: ComputedOrder;
  customer: CustomerInput;
  successUrl: string;
  cancelUrl: string;
}): Promise<CreatePaymentResult> {
  const stripe = getStripe();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of params.computed.lines) {
    line_items.push({
      quantity: line.quantity,
      price_data: {
        currency: 'nok',
        unit_amount: Math.round(line.product.price * 100),
        product_data: {
          name: line.product.name,
          metadata: { productId: line.product.id },
        },
      },
    });
    if (line.product.pant > 0) {
      line_items.push({
        quantity: line.quantity,
        price_data: {
          currency: 'nok',
          unit_amount: Math.round(line.product.pant * 100),
          product_data: {
            name: `Pant — ${line.product.name}`,
            metadata: { productId: line.product.id, type: 'pant' },
          },
        },
      });
    }
  }

  if (params.computed.fraktOre > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'nok',
        unit_amount: params.computed.fraktOre,
        product_data: {
          name: `Frakt (${params.computed.deliveryLabel})`,
          metadata: { type: 'shipping' },
        },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Do NOT set payment_method_types — use dynamic payment methods
    line_items,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customer.email,
    client_reference_id: params.orderId,
    metadata: {
      orderId: params.orderId,
      mode: params.computed.mode,
      postalCode: params.computed.postalCode,
      customerName: params.customer.name,
      customerPhone: params.customer.phone,
      customerAddress: params.customer.address || '',
      amountOre: String(params.computed.amountOre),
    },
  });

  if (!session.url) {
    throw new Error('Stripe Checkout Session mangler url');
  }

  return {
    redirectUrl: session.url,
    providerRef: session.id,
    provider: 'stripe',
  };
}

export async function createVippsPayment(params: {
  orderId: string;
  computed: ComputedOrder;
  customer: CustomerInput;
  returnUrl: string;
}): Promise<CreatePaymentResult> {
  const token = await getVippsAccessToken();
  const sub = vippsSubscriptionKey();
  const msn = process.env.VIPPS_MSN!;
  const phoneDigits = params.customer.phone.replace(/\D/g, '');
  const phoneNumber =
    phoneDigits.length === 8
      ? `47${phoneDigits}`
      : phoneDigits.startsWith('47')
        ? phoneDigits
        : phoneDigits;

  const body = {
    amount: {
      currency: 'NOK',
      value: params.computed.amountOre,
    },
    paymentMethod: { type: 'WALLET' },
    reference: params.orderId,
    returnUrl: params.returnUrl,
    userFlow: 'WEB_REDIRECT',
    paymentDescription: `Lågendalen Tømmer — ${params.orderId}`,
    customer: phoneNumber ? { phoneNumber } : undefined,
    metadata: {
      orderId: params.orderId,
      email: params.customer.email,
      name: params.customer.name,
    },
  };

  const res = await fetch(`${vippsBaseUrl()}/epayment/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': sub,
      'Merchant-Serial-Number': msn,
      'Idempotency-Key': params.orderId,
      'Vipps-System-Name': 'laagendalen-tommer',
      'Vipps-System-Version': '1.1.0',
      'Vipps-System-Plugin-Name': 'webshop',
      'Vipps-System-Plugin-Version': '1.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vipps create payment feilet (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { redirectUrl?: string; reference?: string };
  if (!data.redirectUrl) {
    throw new Error('Vipps respons mangler redirectUrl');
  }

  return {
    redirectUrl: data.redirectUrl,
    providerRef: data.reference || params.orderId,
    provider: 'vipps',
  };
}

export async function fetchStripeSessionStatus(sessionId: string): Promise<{
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown';
  amountOre: number | null;
  raw: string;
}> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentStatus = session.payment_status;
  let status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown' = 'unknown';
  if (paymentStatus === 'paid') status = 'paid';
  else if (session.status === 'expired') status = 'cancelled';
  else if (paymentStatus === 'unpaid') status = 'pending';
  return {
    status,
    amountOre: session.amount_total,
    raw: paymentStatus || session.status || 'unknown',
  };
}

export async function fetchVippsPaymentStatus(reference: string): Promise<{
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown';
  amountOre: number | null;
  raw: string;
}> {
  const token = await getVippsAccessToken();
  const sub = vippsSubscriptionKey();
  const msn = process.env.VIPPS_MSN!;
  const res = await fetch(
    `${vippsBaseUrl()}/epayment/v1/payments/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': sub,
        'Merchant-Serial-Number': msn,
        'Vipps-System-Name': 'laagendalen-tommer',
        'Vipps-System-Version': '1.1.0',
        'Vipps-System-Plugin-Name': 'webshop',
        'Vipps-System-Plugin-Version': '1.0.0',
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vipps get payment feilet (${res.status}): ${text}`);
  }
  const data = (await res.json()) as {
    state?: string;
    aggregate?: { authorizedAmount?: { value?: number } };
    amount?: { value?: number };
  };
  const state = (data.state || '').toUpperCase();
  let status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown' = 'unknown';
  if (state === 'AUTHORIZED' || state === 'CAPTURED') status = 'paid';
  else if (state === 'ABORTED' || state === 'EXPIRED' || state === 'TERMINATED')
    status = 'cancelled';
  else if (state === 'CREATED') status = 'pending';
  else if (state.includes('FAIL')) status = 'failed';

  return {
    status,
    amountOre: data.aggregate?.authorizedAmount?.value ?? data.amount?.value ?? null,
    raw: state || 'unknown',
  };
}
