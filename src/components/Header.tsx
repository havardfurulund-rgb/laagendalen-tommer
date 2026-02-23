import React from 'react';
import Logo from './Logo';
export default ({ onNavigate, currentView, cartCount, onOpenCart }: any) => (
  <header className="h-24 bg-white/90 backdrop-blur-xl border-b sticky top-0 z-50 px-8 flex items-center justify-between">
    <div onClick={() => onNavigate('home')} className="cursor-pointer transition hover:opacity-80"><Logo /></div>
    <nav className="hidden lg:flex gap-10">
      {['home', 'shop', 'delivery', 'studio'].map(id => (
        <button key={id} onClick={() => onNavigate(id)} className={`text-[11px] font-bold uppercase tracking-widest ${currentView === id ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          {id === 'home' ? 'Hjem' : id === 'shop' ? 'Butikk' : id === 'delivery' ? 'Frakt' : 'AI Studio'}
        </button>
      ))}
    </nav>
    <div className="flex items-center gap-6">
      <button onClick={onOpenCart} className="relative p-2">
        <span className="text-xl">🛒</span>
        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#8E9B90] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
      </button>
    </div>
  </header>
);
