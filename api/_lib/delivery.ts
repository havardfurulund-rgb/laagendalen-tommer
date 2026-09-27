/** Server copy of fraktregler — must stay aligned with src/lib/delivery.ts */

export type DeliveryMode = 'home' | 'pickup';
export type DeliveryZone = 'A' | 'B' | 'C' | 'pickup' | null;

export interface DeliveryQuote {
  cost: number;
  zone: DeliveryZone;
  label: string;
}

const ZONE_A_COST = 350;
const ZONE_B_COST = 550;
const ZONE_C_COST = 850;

function inRange(code: number, from: number, to: number): boolean {
  return code >= from && code <= to;
}

function zoneForPostalCode(
  code: number
): { zone: 'A' | 'B' | 'C'; cost: number; label: string } | null {
  if (inRange(code, 3250, 3299)) {
    return { zone: 'A', cost: ZONE_A_COST, label: `Sone A (0–15 km) — ${ZONE_A_COST},-` };
  }
  if (inRange(code, 3100, 3249) || inRange(code, 3300, 3499)) {
    return { zone: 'B', cost: ZONE_B_COST, label: `Sone B (15–30 km) — ${ZONE_B_COST},-` };
  }
  if (inRange(code, 3000, 3099) || inRange(code, 3500, 3999) || inRange(code, 1, 1299)) {
    return { zone: 'C', cost: ZONE_C_COST, label: `Sone C (30–50 km) — ${ZONE_C_COST},-` };
  }
  return null;
}

export function getDeliveryQuote(postalCode: string, mode: DeliveryMode): DeliveryQuote {
  if (mode === 'pickup') {
    return { cost: 0, zone: 'pickup', label: 'Hent selv — 0,-' };
  }

  const digits = postalCode.replace(/\D/g, '');
  if (!digits || digits.length < 4) {
    return { cost: 0, zone: null, label: 'Oppgi postnummer for fraktpris' };
  }

  const code = parseInt(digits.slice(0, 4), 10);
  if (Number.isNaN(code)) {
    return { cost: 0, zone: null, label: 'Oppgi postnummer for fraktpris' };
  }

  const match = zoneForPostalCode(code);
  if (!match) {
    return { cost: 0, zone: null, label: 'Utenfor leveringssone' };
  }

  return { cost: match.cost, zone: match.zone, label: match.label };
}
