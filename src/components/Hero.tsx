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
      <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl">
        Lågendalen Tømmer leverer premium ved av høyeste kvalitet til hele Vestfold, Telemark og Oslo-området.
      </p>
      <button
        onClick={onCtaClick}
        className="px-12 py-5 bg-[#1a241e] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
      >
        Se utvalget
      </button>
    </section>
  );
}
