import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { CONTACT } from '../constants';

/** Site footer — contact display only. Primary order path remains cart + mailto. */
export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="display-font text-2xl font-bold italic mb-3">Lågendalen Tømmer</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Premium ved til Vestfold, Telemark og Oslo-området. Bestill via nettbutikken —
            vi følger opp ordrene dine.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Depot</p>
          <p className="text-sm text-[#1a241e] flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#8E9B90]" aria-hidden />
            <span>
              {CONTACT.depotStreet}
              <br />
              {CONTACT.depotPostal}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Kontakt</p>
          <a
            href={`tel:${CONTACT.phoneTel}`}
            className="text-sm text-[#1a241e] flex items-center gap-2 hover:underline"
          >
            <Phone size={16} className="shrink-0 text-[#8E9B90]" aria-hidden />
            {CONTACT.phoneDisplay}
          </a>
          <p className="text-xs text-gray-500 mt-3">
            Bestilling skjer i handlekurven på nettsiden. Telefon er for kontakt, ikke
            hovedvei for ordre.
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-[11px] text-gray-400 tracking-wide">
        © {new Date().getFullYear()} Lågendalen Tømmer
      </div>
    </footer>
  );
}
