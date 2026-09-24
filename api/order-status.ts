import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getOrder,
  markOrderPaid,
  type OrderPaidStatus,
} from './_lib/orders';
import {
  fetchStripeSessionStatus,
  fetchVippsPaymentStatus,
  stripeConfigured,
  vippsConfigured,
} from './_lib/providers';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orderId = String(req.query.orderId || '');
    const sessionId = String(req.query.session_id || req.query.sessionId || '');
    const providerHint = String(req.query.provider || '').toLowerCase();

    if (!orderId && !sessionId) {
      return res.status(400).json({ error: 'orderId eller session_id er påkrevd' });
    }

    const cached = orderId ? getOrder(orderId) : undefined;

    // Prefer live provider status — do not claim "betalt" from cache alone
    if (sessionId && stripeConfigured()) {
      const live = await fetchStripeSessionStatus(sessionId);
      if (orderId && live.status === 'paid') {
        markOrderPaid(orderId, 'paid');
      }
      return res.status(200).json({
        orderId: orderId || cached?.orderId || null,
        provider: 'stripe',
        status: live.status as OrderPaidStatus,
        amountOre: live.amountOre ?? cached?.amountOre ?? null,
        providerRaw: live.raw,
        verified: true,
        message:
          live.status === 'paid'
            ? 'Betaling bekreftet hos Stripe'
            : 'Takk — vi bekrefter betalingen',
      });
    }

    const vippsRef = cached?.providerRef || orderId;
    if (
      (providerHint === 'vipps' || cached?.provider === 'vipps' || (!sessionId && vippsConfigured())) &&
      vippsRef &&
      vippsConfigured()
    ) {
      const live = await fetchVippsPaymentStatus(vippsRef);
      if (orderId && live.status === 'paid') {
        markOrderPaid(orderId, 'paid');
      }
      return res.status(200).json({
        orderId: orderId || null,
        provider: 'vipps',
        status: live.status as OrderPaidStatus,
        amountOre: live.amountOre ?? cached?.amountOre ?? null,
        providerRaw: live.raw,
        verified: true,
        message:
          live.status === 'paid'
            ? 'Betaling bekreftet hos Vipps'
            : 'Takk — vi bekrefter betalingen',
      });
    }

    if (cached) {
      return res.status(200).json({
        orderId: cached.orderId,
        provider: cached.provider,
        status: cached.status,
        amountOre: cached.amountOre,
        verified: false,
        message: 'Takk — vi bekrefter betalingen',
      });
    }

    return res.status(200).json({
      orderId: orderId || null,
      status: 'unknown',
      verified: false,
      message: 'Takk — vi bekrefter betalingen',
    });
  } catch (err) {
    console.error('[order-status]', err);
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return res.status(500).json({
      error: 'Kunne ikke hente status',
      detail: message,
      message: 'Takk — vi bekrefter betalingen',
      status: 'unknown',
      verified: false,
    });
  }
}
