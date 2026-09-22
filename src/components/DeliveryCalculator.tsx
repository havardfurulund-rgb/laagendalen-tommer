import React, { useMemo, useState } from 'react';
import { Truck, MapPin, Phone } from 'lucide-react';
import { getDeliveryQuote, DeliveryMode } from '../lib/delivery';

export default function DeliveryCalculator() {
  const [postalCode, setPostalCode] = useState('');
  const [mode, setMode] = useState<DeliveryMode>('home');

  const quote = useMemo(
    () => getDeliveryQuote(postalCode, mode),
    [postalCode, mode]
  );

  const hasQuote =
    mode === 'pickup' ||
    (postalCode.replace(/\D/g, '').length >= 4 && quote.zone !== null);

  return (
    <section className="py-20">
      <h2 className="display-font text-5xl font-bold mb-8 italic">Fraktberegning</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="space-y-6">
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
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
                  <MapPin className="inline mr-2" size={16} />
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
                <p className="text-xs text-gray-500 mt-2">
                  Stub-soner A/B/C (350/550/850) til Drift GO. Leverer Vestfold, Telemark og Oslo-området.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          {!hasQuote && mode === 'home' ? (
            <div className="flex items-center justify-center h-full text-center min-h-[200px]">
              <div>
                <Truck size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">{quote.label}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Fraktpris</p>
                <p className="text-5xl font-bold italic">{quote.cost},-</p>
                <p className="text-sm text-gray-500 mt-2">{quote.label}</p>
              </div>

              {quote.zone && quote.zone !== 'pickup' && (
                <div className="bg-gray-50 p-6 rounded-2xl border">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Sone</p>
                  <p className="text-3xl font-bold">{quote.zone}</p>
                </div>
              )}

              {mode === 'home' && quote.zone && (
                <div className="p-6 bg-[#8E9B90] bg-opacity-10 rounded-2xl border border-[#8E9B90]">
                  <p className="text-sm text-[#1a241e] font-semibold">
                    ✓ Kranbil til oppkjørsel<br />
                    ✓ Leveres direkte på endring
                  </p>
                </div>
              )}

              {mode === 'home' && !quote.zone && postalCode.replace(/\D/g, '').length >= 4 && (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-sm text-amber-900 font-semibold">{quote.label}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Phone size={18} />
                  <span>Kontakt oss for detaljer:</span>
                </div>
                <p className="text-2xl font-bold">+47 XXX XX XXX</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
