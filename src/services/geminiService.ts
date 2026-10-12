// Ved-Leif: regelbasert FAQ-bot (gratis, ingen ekstern API, ingen nøkkel i nettleseren).
// Erstatter Gemini-kallet som viste «API-nøkkel er ikke konfigurert» til kunder i prod.
import { INITIAL_PRODUCTS, CONTACT } from '../constants';

const prisliste = INITIAL_PRODUCTS.map(p => `• ${p.name}: ${p.price} kr`).join('\n');

const SVAR: { ord: string[]; tekst: string }[] = [
  { ord: ['pris', 'koster', 'kost', 'billig', 'kr'], tekst: `Prisene våre:\n${prisliste}\n\nLegg i handlekurven under «Butikk» for å bestille.` },
  { ord: ['bestill', 'kjøpe', 'kjøp', 'ordre', 'handle'], tekst: 'Bestilling skjer kun på nettsiden: velg ved under «Butikk», legg i handlekurven og fullfør bestillingen. Vi tar ikke imot bestillinger på telefon.' },
  { ord: ['lever', 'frakt', 'kjør', 'hjem', 'område'], tekst: 'Se «Frakt» i menyen for å regne ut levering til din adresse. Du kan også hente selv på depot: ' + CONTACT.depotAddress + '.' },
  { ord: ['hent', 'depot', 'adresse', 'hvor'], tekst: `Depot/henting: ${CONTACT.depotAddress}. Bestill på nett først, så avtaler vi henting.` },
  { ord: ['tørr', 'fukt', 'kvalitet'], tekst: 'Veden er tørket og klar til fyring. Bjørk gir mest varme og jevn glød, blandingsved er rimelig hverdagsved, og furu tenner raskt – fin til opptenning.' },
  { ord: ['bjørk', 'blanding', 'furu', 'hvilken', 'anbefal', 'peis', 'ovn'], tekst: 'Til peis og ovn: bjørk 40/60 L for kos og varme. Fyrer du mye: storsekk bjørk 1000 L eller blandingsved 1500 L gir best pris per liter. Furu 60 L er perfekt til opptenning.' },
  { ord: ['storsekk', 'sekk', 'liter', 'mengde', 'hvor mye'], tekst: 'Vi har sekker på 40 L og 60 L, og storsekk på 1000 L (bjørk) og 1500 L (blandingsved). En storsekk holder typisk lenge for en vanlig peis-sesong.' },
  { ord: ['betal', 'vipps', 'kort', 'faktura'], tekst: 'Du betaler trygt i kassen på nettsiden når du bestiller.' },
  { ord: ['kontakt', 'mail', 'e-post', 'spørsmål', 'hjelp', 'telefon', 'ring'], tekst: `Skriv til oss på ${CONTACT.email}, så svarer vi så fort vi kan. Bestillinger tas kun på nettsiden.` },
];

export const getProfessionalAdvice = async (prompt: string) => {
  const q = prompt.toLowerCase();
  const treff = SVAR.find(s => s.ord.some(o => q.includes(o)));
  return {
    text: treff?.tekst ?? `Godt spørsmål! Jeg kan svare på pris, bestilling, levering, henting og vedtyper. For andre spørsmål: skriv til ${CONTACT.email}.`,
    sources: [] as unknown[],
  };
};
