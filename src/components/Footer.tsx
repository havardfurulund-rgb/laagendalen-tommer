import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_PHONE_HREF, DEPOT_ADDRESS } from '../site';

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#1a241e] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <p className="display-font text-3xl font-bold italic">Lågendalen Tømmer</p>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Tørr ved fra Lågendalen — bestill enkelt i nettbutikken.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">Kontakt</h2>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline"
            href={CONTACT_PHONE_HREF}
          >
            <Phone size={15} />
            {CONTACT_PHONE}
          </a>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">Hent selv</h2>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/90">
            <MapPin className="mt-0.5 shrink-0" size={15} />
            <span>{DEPOT_ADDRESS}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
