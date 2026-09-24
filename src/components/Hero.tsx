import React from 'react';

interface HeroProps {
  onCtaClick: () => void;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1724931498964-a1f392ba9ace?w=1920&q=70&auto=format&fit=crop';

const USPS = [
  'Lokal ved fra Lågendalen',
  'Hent selv i Kvelde',
  'Hjemlevering med fast sonepris',
];

export default function Hero({ onCtaClick }: HeroProps) {
  return (
    <section className="relative w-full min-h-[78vh] flex items-center overflow-hidden bg-[#1a241e]">
      <img
        src={HERO_IMAGE}
        alt="Vedovn med tørr ved i en nordisk stue"
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a241e]/90 via-[#1a241e]/65 to-[#1a241e]/10" />
      <div className="relative max-w-7xl mx-auto px-6 w-full py-24">
        <div className="max-w-xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9d1c6] mb-6">
            Tørr ved fra Lågendalen
          </p>
          <h1 className="display-font text-5xl md:text-7xl font-bold italic mb-6 leading-[1.05]">
            Ekte norsk varme.
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-10">
            Bjørk, furu og blandingsved – hent selv i Kvelde eller få det levert i Vestfold, Telemark og Oslo-området.
          </p>
          <button
            onClick={onCtaClick}
            className="px-10 py-4 bg-white text-[#1a241e] rounded-2xl font-bold uppercase tracking-widest hover:bg-[#f0ece4] transition-all shadow-lg"
          >
            Se utvalget
          </button>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/90">
            {USPS.map((u) => (
              <li key={u} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c9d1c6]" aria-hidden="true" />
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
