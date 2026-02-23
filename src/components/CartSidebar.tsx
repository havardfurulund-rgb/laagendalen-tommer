import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Smartphone, CheckCircle2, Loader2 } from 'lucide-react';

export default ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onClearCart }: any) => {
  const [step, setStep] = useState('cart');
  const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (step === 'vipps-pending') {
      const timer = setTimeout(() => setStep('success'), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="display-font text-3xl font-bold italic">{step === 'success' ? 'Bekreftelse' : 'Handlekurv'}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {step === 'cart' && (
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center border p-4 rounded-2xl">
                  <div className="flex-1">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-xs text-gray-400">{item.price},-</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(item.id, -1)}><Minus size={14}/></button>
                    <span className="font-bold">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'vipps-pending' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-[#ff5b24] rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
                <Smartphone color="white" size={40} />
              </div>
              <h3 className="text-xl font-bold">Venter på Vipps...</h3>
              <p className="text-sm text-gray-500">Fullfør betalingen i appen på din telefon.</p>
              <Loader2 className="animate-spin text-[#ff5b24]" />
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <CheckCircle2 size={60} className="text-[#8E9B90]" />
              <h3 className="text-3xl font-bold italic display-font">Takk for handelen!</h3>
              <p className="text-sm text-gray-500">Din ved er nå bestilt. Vi kontakter deg for levering.</p>
              <button onClick={() => { onClearCart(); setStep('cart'); onClose(); }} className="px-8 py-3 bg-black text-white rounded-xl font-bold uppercase text-[10px]">Lukk</button>
            </div>
          )}
        </div>

        {step === 'cart' && items.length > 0 && (
          <div className="p-8 border-t bg-gray-50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase">Totalt</span>
              <span className="text-4xl font-bold italic">{total},-</span>
            </div>
            <button onClick={() => setStep('vipps-pending')} className="w-full py-5 bg-[#ff5b24] text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3">
              <Smartphone size={18} /> Betal med Vipps
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
