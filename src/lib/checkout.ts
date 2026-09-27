import { DeliveryMode } from './delivery';

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface CheckoutLine {
  id: string;
  quantity: number;
}

export async function startCheckout(params: {
  items: CheckoutLine[];
  mode: DeliveryMode;
  postalCode: string;
  customer: CheckoutCustomer;
}): Promise<{ redirectUrl: string } | { error: string }> {
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/$/, '') || '';
  const base = `${origin}${path}`;
  const successUrl = `${base}?checkout=success`;
  const cancelUrl = `${base}?checkout=cancel`;

  try {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: params.items,
        mode: params.mode,
        postalCode: params.postalCode,
        customer: params.customer,
        successUrl,
        cancelUrl,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      redirectUrl?: string;
      error?: string;
      detail?: string;
    };
    if (!res.ok || !data.redirectUrl) {
      return {
        error:
          data.error ||
          data.detail ||
          'Betaling ikke konfigurert — mangler env',
      };
    }
    return { redirectUrl: data.redirectUrl };
  } catch (err) {
    console.error('[checkout]', err);
    return { error: 'Kunne ikke starte betaling. Prøv igjen eller kontakt oss.' };
  }
}
