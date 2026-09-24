import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import {
  getOrder,
  getOrderByProviderRef,
  markOrderPaid,
  saveOrder,
} from '../_lib/orders';

/**
 * Vipps MobilePay Webhooks API scaffold.
 * Verify Authorization / HMAC when VIPPS_WEBHOOK_SECRET is set.
 * Paid status is also confirmed via GET /api/order-status polling the ePayment API.
 */
function verifyVippsSignature(req: VercelRequest, rawBody: string): boolean {
  const secret = process.env.VIPPS_WEBHOOK_SECRET;
  if (!secret) {
    // No secret yet — accept but log (scaffold). Tighten before prod.
    console.warn('[webhooks/vipps] VIPPS_WEBHOOK_SECRET mangler — hoppet over signaturjekk');
    return true;
  }

  const auth = req.headers['authorization'] || req.headers['x-vipps-signature'] || '';
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (!header) return false;

  // Support plain shared-secret bearer or HMAC-SHA256 hex of body
  if (header === secret || header === `Bearer ${secret}`) return true;

  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = header.replace(/^sha256=/i, '').trim();
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(provided));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});

    if (!verifyVippsSignature(req, rawBody)) {
      return res.status(401).json({ error: 'Ugyldig webhook-signatur' });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const reference =
      payload.reference ||
      payload.paymentReference ||
      payload.orderId ||
      payload?.payment?.reference;
    const name = String(payload.name || payload.eventName || payload.type || '').toUpperCase();

    const paidEvent =
      name.includes('AUTHORIZED') ||
      name.includes('CAPTURED') ||
      name.includes('PAYMENT.AUTHORIZED') ||
      payload.state === 'AUTHORIZED' ||
      payload.state === 'CAPTURED';

    if (reference && paidEvent) {
      const existing =
        getOrder(String(reference)) || getOrderByProviderRef('vipps', String(reference));
      if (existing) {
        markOrderPaid(existing.orderId, 'paid');
      } else {
        const now = new Date().toISOString();
        saveOrder({
          orderId: String(reference),
          provider: 'vipps',
          providerRef: String(reference),
          amountOre: Number(payload.amount?.value || 0),
          currency: 'NOK',
          status: 'paid',
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    console.info('[webhooks/vipps] processed', name || 'event', reference);
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhooks/vipps]', err);
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return res.status(400).json({ error: 'Webhook feilet', detail: message });
  }
}
