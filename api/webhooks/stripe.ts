import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getOrder,
  getOrderByProviderRef,
  markOrderPaid,
  saveOrder,
} from '../_lib/orders';
import { getStripe } from '../_lib/providers';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[webhooks/stripe] STRIPE_WEBHOOK_SECRET mangler');
    return res.status(503).json({ error: 'Webhook ikke konfigurert' });
  }

  try {
    const stripe = getStripe();
    const rawBody = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) {
      return res.status(400).json({ error: 'Mangler stripe-signature' });
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as {
        id: string;
        payment_status?: string;
        client_reference_id?: string | null;
        metadata?: { orderId?: string };
      };
      const orderId =
        session.metadata?.orderId || session.client_reference_id || undefined;
      const paid = session.payment_status === 'paid' || event.type.includes('succeeded');

      if (orderId && paid) {
        const existing = getOrder(orderId) || getOrderByProviderRef('stripe', session.id);
        if (existing) {
          markOrderPaid(orderId, 'paid');
        } else {
          const now = new Date().toISOString();
          saveOrder({
            orderId,
            provider: 'stripe',
            providerRef: session.id,
            amountOre: 0,
            currency: 'NOK',
            status: 'paid',
            createdAt: now,
            updatedAt: now,
          });
        }
      }
      console.info('[webhooks/stripe] processed', event.type, orderId, session.id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhooks/stripe]', err);
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return res.status(400).json({ error: 'Webhook-verifisering feilet', detail: message });
  }
}
