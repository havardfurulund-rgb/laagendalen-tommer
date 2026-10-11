/**
 * Trusted server-side catalog — prices must match src/constants.tsx.
 * Never trust client-submitted price/pant; look up by product id.
 */

export interface TrustedProduct {
  id: string;
  name: string;
  /** NOK inkl. mva */
  price: number;
  pant: number;
  unitLabel: string;
}

export const TRUSTED_PRODUCTS: TrustedProduct[] = [
  { id: '1', name: 'Bjørkeved 40 L', price: 89, pant: 0, unitLabel: 'sekk' },
  { id: '2', name: 'Bjørkeved 60 L', price: 129, pant: 0, unitLabel: 'sekk' },
  { id: '3', name: 'Blandingsved 40 L', price: 69, pant: 0, unitLabel: 'sekk' },
  { id: '4', name: 'Bjørkeved storsekk 1000 L', price: 1890, pant: 300, unitLabel: 'storsekk' },
  { id: '5', name: 'Blandingsved storsekk 1500 L', price: 2190, pant: 300, unitLabel: 'storsekk' },
  { id: '6', name: 'Furu 60 L', price: 99, pant: 0, unitLabel: 'sekk' },
];

export function getTrustedProduct(id: string): TrustedProduct | undefined {
  return TRUSTED_PRODUCTS.find(p => p.id === id);
}

/** Prefer bestilling@ if it exists/forwards; fallback aina@ for inbox. */
export const ORDER_INBOX_PRIMARY = 'bestilling@laagendalen-tommer.no';
export const ORDER_INBOX_FALLBACK = 'aina@skmsecure.no';
