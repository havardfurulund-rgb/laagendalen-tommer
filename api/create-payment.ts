import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTrustedProduct, ORDER_INBOX_PRIMARY, ORDER_INBOX_FALLBACK } from './_lib/catalog.js';
import { getDeliveryQuote, type DeliveryMode } from './_lib/delivery.js';
import {
  generateOrderId,
  nokToOre,
  saveOrder,
  type OrderRecord,
} from './_lib/orders.js';
import {
  createStripeCheckout,
  createVippsPayment,
  resolveProvider,
  type CartLineInput,
  type CustomerInput,
  type ComputedLine,
  type ComputedOrder,
} from './_lib/providers.js';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function computeOrder(
  items: CartLineInput[],
  mode: DeliveryMode,
  postalCode: string
): ComputedOrder | { error: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Kurven er tom' };
  }

  const lines: ComputedLine[] = [];
  let vareOre = 0;
  let pantOre = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    if (!item.id || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      return { error: `Ugyldig linje for produkt ${item.id}` };
    }
    const product = getTrustedProduct(String(item.id));
    if (!product) {
      return { error: `Ukjent produkt: ${item.id}` };
    }
    const lineVareOre = nokToOre(product.price) * qty;
    const linePantOre = nokToOre(product.pant) * qty;
    vareOre += lineVareOre;
    pantOre += linePantOre;
    lines.push({ product, quantity: qty, lineVareOre, linePantOre });
  }

  const delivery = getDeliveryQuote(postalCode || '', mode);
  if (mode === 'home' && delivery.zone === null) {
    return { error: 'Oppgi gyldig postnummer innenfor leveringssone, eller velg hent selv' };
  }

  const fraktOre = nokToOre(delivery.cost);
  const amountOre = vareOre + pantOre + fraktOre;
  if (amountOre < 100) {
    return { error: 'Beløp for lavt' };
  }

  return {
    lines,
    vareOre,
    pantOre,
    fraktOre,
    amountOre,
    mode,
    postalCode: postalCode || '',
    deliveryLabel: delivery.label,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const items = body.items as CartLineInput[];
    const mode = (body.mode === 'pickup' ? 'pickup' : 'home') as DeliveryMode;
    const postalCode = String(body.postalCode || '');
    const customer = body.customer as CustomerInput;
    const successUrl = String(body.successUrl || '');
    const cancelUrl = String(body.cancelUrl || '');

    if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.email?.trim()) {
      return res.status(400).json({ error: 'Navn, telefon og e-post er påkrevd' });
    }
    if (mode === 'home' && !customer.address?.trim()) {
      return res.status(400).json({ error: 'Leveringsadresse er påkrevd for hjemlevering' });
    }
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'successUrl og cancelUrl er påkrevd' });
    }

    const computed = computeOrder(items, mode, postalCode);
    if ('error' in computed) {
      return res.status(400).json({ error: computed.error });
    }

    const provider = resolveProvider();
    if (!provider) {
      return res.status(503).json({
        error: 'Betaling ikke konfigurert — mangler env',
        detail:
          'Sett STRIPE_SECRET_KEY (midlertidig) eller VIPPS_CLIENT_ID/SECRET/SUBSCRIPTION_KEY/MSN i Vercel env.',
      });
    }

    const orderId = generateOrderId();
    const now = new Date().toISOString();

    let result;
    if (provider === 'stripe') {
      const successWithParams = successUrl.includes('?')
        ? `${successUrl}&session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(orderId)}`
        : `${successUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(orderId)}`;
      result = await createStripeCheckout({
        orderId,
        computed,
        customer,
        successUrl: successWithParams,
        cancelUrl,
      });
    } else {
      const returnUrl = successUrl.includes('?')
        ? `${successUrl}&orderId=${encodeURIComponent(orderId)}&provider=vipps`
        : `${successUrl}?checkout=success&orderId=${encodeURIComponent(orderId)}&provider=vipps`;
      result = await createVippsPayment({
        orderId,
        computed,
        customer,
        returnUrl,
      });
    }

    const record: OrderRecord = {
      orderId,
      provider: result.provider,
      providerRef: result.providerRef,
      amountOre: computed.amountOre,
      currency: 'NOK',
      status: 'pending',
      customerEmail: customer.email,
      customerName: customer.name,
      createdAt: now,
      updatedAt: now,
      meta: {
        mode: computed.mode,
        postalCode: computed.postalCode,
        phone: customer.phone,
        address: customer.address || '',
        orderInbox: ORDER_INBOX_PRIMARY,
        orderInboxFallback: ORDER_INBOX_FALLBACK,
      },
    };
    saveOrder(record);

    return res.status(200).json({
      redirectUrl: result.redirectUrl,
      orderId,
      provider: result.provider,
      amountOre: computed.amountOre,
      breakdown: {
        vareOre: computed.vareOre,
        pantOre: computed.pantOre,
        fraktOre: computed.fraktOre,
      },
    });
  } catch (err) {
    console.error('[create-payment]', err);
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return res.status(500).json({ error: 'Kunne ikke starte betaling', detail: message });
  }
}
