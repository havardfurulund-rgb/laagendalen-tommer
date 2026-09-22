import React, { useMemo, useState } from 'react';
import { X, Minus, Plus, MapPin, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { getDeliveryQuote, DeliveryMode } from '../lib/delivery';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
}: CartSidebarProps) {
  const [postalCode, setPostalCode] = useState('');
  const [mode, setMode] = useState<DeliveryMode>('home');

  const vareTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const pantTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.pant * item.quantity, 0),
    [items]
  );

  const delivery = useMemo(
    () => getDeliveryQuote(postalCode, mode),
    [postalCode, mode]
  );

  const frakt = delivery.cost;
  const totalt = vareTotal + pantTotal + frakt;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="display-font text-3xl font-bold italic">Handlekurv</h2>
          <button type="button" onClick={onClose} aria-label="Lukk">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Kurven er tom.</p>
          ) : (
            <>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center border p-4 rounded-2xl">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.price},- / {item.unitLabel}
                        {item.pant > 0 ? ` · pant ${item.pant},-` : ''}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.volumeLiters} L · {item.lengthCm} cm
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label="Reduser"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label="Øk"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Truck size={14} /> Levering
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('home')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      mode === 'home' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Hjemlevering
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('pickup')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      mode === 'pickup' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Hent selv
                  </button>
                </div>

                {mode === 'home' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      <MapPin className="inline mr-1" size={12} />
                      Postnummer
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="f.eks. 3260"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500 mt-2">{delivery.label}</p>
                  </div>
                )}

                {mode === 'pickup' && (
                  <p className="text-xs text-gray-500">{delivery.label}</p>
                )}
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t bg-gray-50 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Vare</span>
                <span className="font-semibold">{vareTotal},-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Pant
                  {pantTotal > 0 && (
                    <span className="block text-[10px] font-normal text-gray-400">
                      refunderes ved retur
                    </span>
                  )}
                </span>
                <span className="font-semibold">{pantTotal},-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frakt</span>
                <span className="font-semibold">{frakt},-</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <span className="text-xs font-bold text-gray-400 uppercase">Totalt</span>
                <span className="text-4xl font-bold italic">{totalt},-</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              Bestill-CTA kommer snart — betaling er ikke aktivert ennå.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
