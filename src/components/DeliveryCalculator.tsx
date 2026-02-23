import React, { useState } from 'react';
import { Truck, MapPin, Phone } from 'lucide-react';

export default function DeliveryCalculator() {
  const [postalCode, setPostalCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<{ cost: number; days: string } | null>(null);

  const calculateDelivery = () => {
    if (!postalCode) return;
    
    // Simplified calculation logic
    const code = parseInt(postalCode);
    let cost = 500; // Base delivery
    let days = '3-5';

    // Vestfold, Telemark, Oslo area
    if ((code >= 3100 && code <= 3900) || (code >= 3900 && code <= 3999)) {
      cost = 450;
      days = '2-3';
    } else if (code >= 3000 && code <= 3099) {
      cost = 500;
      days = '3-5';
    }

    // Add quantity surcharge
    if (quantity > 2) {
      cost += (quantity - 2) * 50;
    }

    setResult({ cost, days });
  };

  return (
    <section className="py-20">
      <h2 className="display-font text-5xl font-bold mb-8 italic">Fraktberegning</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Calculator */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
                <MapPin className="inline mr-2" size={16} />
                Postnummer
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="f.eks 3041"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-gray-500 mt-2">Vi leverer i Vestfold, Telemark og Oslo-området</p>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
                Antall sekker
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      quantity === num
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculateDelivery}
              className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-opacity-90 transition-all"
            >
              Kalkuler frakt
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          {!result ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Truck size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Fyll inn postnummer for å beregne frakt</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Fraktpris</p>
                <p className="text-5xl font-bold italic">{result.cost},-</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Leveringstid</p>
                <p className="text-3xl font-bold">{result.days} dager</p>
              </div>

              <div className="p-6 bg-[#8E9B90] bg-opacity-10 rounded-2xl border border-[#8E9B90]">
                <p className="text-sm text-[#1a241e] font-semibold">
                  ✓ Kranbil til oppkjørsel<br/>
                  ✓ Leveres direkte på endring
                </p>
              </div>

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
