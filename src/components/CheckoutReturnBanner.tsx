import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';

type Status = 'loading' | 'paid' | 'pending' | 'cancelled' | 'failed' | 'unknown' | 'error';

/**
 * Handles ?checkout=success|cancel&session_id=&orderId=
 * Never claims «betalt» without order-status verification.
 */
export default function CheckoutReturnBanner() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Takk — vi bekrefter betalingen');
  const [checkout, setCheckout] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('checkout');
    if (!c) return;
    setCheckout(c);
    setVisible(true);

    if (c === 'cancel') {
      setStatus('cancelled');
      setMessage('Betalingen ble avbrutt. Du kan prøve igjen fra handlekurven.');
      return;
    }

    if (c !== 'success') return;

    const sessionId = params.get('session_id') || '';
    const orderId = params.get('orderId') || '';
    const provider = params.get('provider') || '';

    const qs = new URLSearchParams();
    if (orderId) qs.set('orderId', orderId);
    if (sessionId) qs.set('session_id', sessionId);
    if (provider) qs.set('provider', provider);

    setStatus('loading');
    setMessage('Takk — vi bekrefter betalingen');

    fetch(`/api/order-status?${qs.toString()}`)
      .then(async res => {
        const data = (await res.json().catch(() => ({}))) as {
          status?: string;
          message?: string;
          verified?: boolean;
        };
        const s = (data.status || 'unknown') as Status;
        if (s === 'paid' && data.verified) {
          setStatus('paid');
          setMessage(data.message || 'Betaling bekreftet hos betalingsleverandør.');
        } else if (s === 'cancelled' || s === 'failed') {
          setStatus(s);
          setMessage(data.message || 'Betalingen er ikke fullført.');
        } else {
          setStatus('pending');
          setMessage(data.message || 'Takk — vi bekrefter betalingen');
        }
      })
      .catch(() => {
        setStatus('pending');
        setMessage('Takk — vi bekrefter betalingen');
      });
  }, []);

  const dismiss = () => {
    setVisible(false);
    const url = new URL(window.location.href);
    ['checkout', 'session_id', 'orderId', 'provider'].forEach(k => url.searchParams.delete(k));
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  if (!visible) return null;

  const tone =
    status === 'paid'
      ? 'border-[#8E9B90] bg-[#8E9B90]/bg-opacity-15'
      : status === 'cancelled' || status === 'failed' || status === 'error'
        ? 'border-red-200 bg-red-50'
        : 'border-gray-200 bg-white';

  return (
    <div className={`fixed bottom-6 left-1/2 z-[300] w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border shadow-xl p-5 ${tone}`}>
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 shrink-0">
          {status === 'loading' && <Loader2 className="animate-spin text-gray-500" size={22} />}
          {status === 'paid' && <CheckCircle2 className="text-[#1a241e]" size={22} />}
          {(status === 'cancelled' || status === 'failed' || status === 'error') && (
            <XCircle className="text-red-600" size={22} />
          )}
          {(status === 'pending' || status === 'unknown') && (
            <CheckCircle2 className="text-gray-400" size={22} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">
            {checkout === 'cancel' ? 'Avbrutt' : status === 'paid' ? 'Bekreftet' : 'Ordre mottatt'}
          </p>
          <p className="text-xs text-gray-600 mt-1">{message}</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Lukk" className="text-gray-400 hover:text-black">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
