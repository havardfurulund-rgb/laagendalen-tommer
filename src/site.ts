import { CONTACT } from './constants';

/** Canonical contact aliases — values live in CONTACT (Havard GO 2026-09-23). */
export const CONTACT_PHONE = CONTACT.phoneDisplay;
export const CONTACT_PHONE_HREF = `tel:${CONTACT.phoneTel}`;
export const DEPOT_ADDRESS = CONTACT.depotAddress;

// Merge-clean refresh: ordering stays web/mailto, not phone-first.
