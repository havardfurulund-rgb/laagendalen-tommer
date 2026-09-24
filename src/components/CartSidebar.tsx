import React, { useMemo, useState } from 'react';
import { X, Minus, Plus, MapPin, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { getDeliveryQuote, DeliveryMode } from '../lib/delivery';
import { DEPOT_ADDRESS } from '../site';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
}

type CartStep = 'cart' | 'order';

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const EMPTY_FORM: OrderForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

/**
 * Stub mottaker til Bestill-CTA er koblet til ekte betaling.
 *
 * P0 FORBUDT: fake Vipps / setTimeout → «Takk for handelen» / vipps-pending mock.
 * Live Vercel var stuck på 23f3ddc med mock; denne filen skal aldri reintrodusere det.
 */
const ORDER_MAILTO = 'bestilling@laagendalen-tommer.no';

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onRemove,
  onUpdateQuantity,
  onClearCart,
}: CartSidebarProps) {
  const [step, setStep] = useState<CartStep>('cart');
  const [postalCode, setPostalCode] = useState('');
  const [mode, setMode] = useState<DeliveryMode>('home');
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [submittedNote, setSubmittedNote] = useState<string | null>(null);

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

  const updateForm = (field: keyof OrderForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const buildOrderBody = () => {
    const lines = [
      'BESTILLING — Lågendalen Tømmer (PoC stub)',
      '',
      `Navn: ${form.name}`,
      `Telefon: ${form.phone}`,
      `E-post: ${form.email}`,
      mode === 'home'
        ? `Leveringsadresse: ${form.address}`
        : `Levering: Hent selv på ${DEPOT_ADDRESS}`,
      `Postnummer: ${postalCode || '(ikke oppgitt)'}`,
      `Leveringsmåte: ${mode === 'home' ? 'Hjemlevering' : 'Hent selv'}`,
      `Fraktsone: ${delivery.zone ?? 'n/a'} — ${delivery.label}`,
      '',
      'VARER:',
      ...items.map(
        item =>
          `- ${item.quantity}× ${item.name} (${item.volumeLiters}L / ${item.lengthCm}cm) @ ${item.price},-` +
          (item.pant > 0 ? ` + pant ${item.pant},-` : '')
      ),
      '',
      `Vare: ${vareTotal},-`,
      `Pant (refunderes ved retur): ${pantTotal},-`,
      `Frakt: ${frakt},-`,
      `Totalt: ${totalt},-`,
    ];
    return lines.join('\n');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) return;
    if (mode === 'home' && !form.address.trim()) return;

    const subject = encodeURIComponent(`Bestilling Lågendalen Tømmer — ${form.name}`);
    const body = encodeURIComponent(buildOrderBody());
    const mailto = `mailto:${ORDER_MAILTO}?subject=${subject}&body=${body}`;

    // Stub: åpne mailto + logg lokalt. Ingen mock Vipps / betalingssuksess.
    console.info('[PoC bestilling stub]', {
      form,
      postalCode,
      mode,
      vareTotal,
      pantTotal,
      frakt,
      totalt,
      items,
    });
    window.location.href = mailto;
    setSubmittedNote(
      'Bestillingen er klargjort som e-postutkast (mailto-stub). Betaling er IKKE gjennomført — ingen Vipps/kort ennå.'
    );
  };

  const handleClose = () => {
    setStep('cart');
    setSubmittedNote(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="display-font text-3xl font-bold italic">
            {step === 'order' ? 'Bestill' : 'Handlekurv'}
          </h2>
          <button type="button" onClick={handleClose} aria-label="Lukk">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Kurven er tom.</p>
          ) : step === 'cart' ? (
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
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label="Fjern"
                        className="text-gray-400 hover:text-black"
                      >
                        <X size={14} />
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
                  <div className="flex gap-3 items-start rounded-xl border border-[#8E9B90] bg-[#8E9B90] bg-opacity-10 p-4">
                    <MapPin className="mt-0.5 shrink-0 text-[#1a241e]" size={14} />
                    <p className="text-xs text-[#1a241e]">
                      <span className="font-bold">Hent selv på depotet</span>
                      <br />
                      {DEPOT_ADDRESS}
                      <br />
                      <span className="text-gray-600">Frakt: 0,-</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <form id="bestill-form" onSubmit={handleSubmitOrder} className="space-y-4">
              <p className="text-xs text-gray-500">
                Fyll inn kontaktdetaljer. Bestilling sendes som e-postutkast (mailto-stub) — ingen Vipps-mock og ingen betalingssuksess før ekte checkout er live.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Navn *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Telefon *
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  E-post *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

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
                    Leveringsadresse *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.address}
                    onChange={e => updateForm('address', e.target.value)}
                    placeholder="Gateadresse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              {mode === 'pickup' && (
                <div className="flex gap-3 items-start rounded-xl border border-[#8E9B90] bg-[#8E9B90] bg-opacity-10 p-4">
                  <MapPin className="mt-0.5 shrink-0 text-[#1a241e]" size={14} />
                  <p className="text-xs text-[#1a241e]">
                    <span className="font-bold">Hent selv på depotet</span>
                    <br />
                    {DEPOT_ADDRESS}
                    <br />
                    <span className="text-gray-600">Frakt: 0,-</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  <MapPin className="inline mr-1" size={12} />
                  Postnummer {mode === 'home' ? '*' : ''}
                </label>
                <input
                  required={mode === 'home'}
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

              <div className="bg-gray-50 border rounded-2xl p-4 space-y-2 text-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Ordresammendrag
                </p>
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
                <div className="flex justify-between items-end pt-2 border-t">
                  <span className="text-xs font-bold text-gray-400 uppercase">Totalt</span>
                  <span className="text-2xl font-bold italic">{totalt},-</span>
                </div>
              </div>

              {submittedNote && (
                <p className="text-xs text-gray-600 bg-gray-100 rounded-xl p-3">{submittedNote}</p>
              )}
            </form>
          )}
        </div>

        {items.length > 0 && step === 'cart' && (
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
            <button
              type="button"
              onClick={() => {
                setSubmittedNote(null);
                setStep('order');
              }}
              className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all"
            >
              Bestill
            </button>
          </div>
        )}

        {items.length > 0 && step === 'order' && (
          <div className="p-8 border-t bg-gray-50 space-y-3">
            <button
              type="submit"
              form="bestill-form"
              className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all"
            >
              Send bestilling
            </button>
            <button
              type="button"
              onClick={() => setStep('cart')}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black"
            >
              Tilbake til kurv
            </button>
            {submittedNote && (
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setForm(EMPTY_FORM);
                  setPostalCode('');
                  setMode('home');
                  setSubmittedNote(null);
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider text-gray-400"
              >
                Tøm kurv og lukk
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
