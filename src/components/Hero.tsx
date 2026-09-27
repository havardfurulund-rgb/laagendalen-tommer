import React from 'react';

interface HeroProps {
  onCtaClick: () => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
  return (
    <section className="h-[70vh] flex flex-col items-center justify-center text-center py-20">
      <h1 className="display-font text-6xl md:text-7xl lg:text-8xl font-bold mb-8 italic text-[#1a241e]">
        Ekte norsk varme.
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl">
        Forhåndsbestill ved — hent på gården eller få utkjøring. Premium ved til Vestfold, Telemark og Oslo-området.
      </p>
      <p className="inline-block mb-10 px-4 py-2 rounded-full bg-[#8E9B90]/20 text-xs font-bold uppercase tracking-widest text-[#1a241e]">
        Forhåndsbestilling åpen — hent selv eller utkjøring
      </p>
      <button
        onClick={onCtaClick}
        className="px-12 py-5 bg-[#1a241e] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
      >
        Forhåndsbestill ved
      </button>
    </section>
  );
}
