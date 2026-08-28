import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import { CurrencyCode } from '../types/okada.types';
import { FareInput } from '../components/payment/FareInput';
import { CurrencySelector } from '../components/payment/CurrencySelector';
import { ArrowLeft, QrCode, User, Hash, Loader2, Sparkles } from 'lucide-react';

interface CreatePaymentPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CreatePaymentPage: React.FC<CreatePaymentPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { createPayment, isLoading } = usePayment();

  const [fareAmount, setFareAmount] = useState<number>(1500);
  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency_preference || 'NGN');
  const [passengerName, setPassengerName] = useState<string>('');
  const [customRef, setCustomRef] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fareAmount || fareAmount <= 0) {
      setErrorMsg('Please enter a valid trip fare amount.');
      return;
    }

    try {
      setErrorMsg('');
      const result = await createPayment({
        fareAmount,
        currency,
        passengerName: passengerName.trim() || undefined,
        rideReference: customRef.trim() || undefined,
      });

      // Navigate to the live QR payment display page
      onNavigate('qr-payment', { paymentId: result.payment.payment_id });
    } catch (err: any) {
      console.error('Payment creation error:', err);
      setErrorMsg(err?.message || 'Failed to create payment request. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('rider-dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-white">Create Fare Request</h1>
          <p className="text-xs text-slate-400">Generate QR code for passenger checkout</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Currency Switcher */}
        <CurrencySelector selected={currency} onChange={setCurrency} />

        {/* Big Fare Keypad & Converter */}
        <FareInput amount={fareAmount} currency={currency} onChange={setFareAmount} />

        {/* Optional Metadata: Passenger Name & Ride Reference */}
        <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Optional Trip Details
          </span>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Passenger Name / Note</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                placeholder="e.g. Passenger at Ikeja Underbridge"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Custom Ride Reference</label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={customRef}
                onChange={e => setCustomRef(e.target.value)}
                placeholder="Leave blank for auto-generated ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Generate QR CTA Button */}
        <button
          type="submit"
          disabled={isLoading || fareAmount <= 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Recording on Soroban & Creating QR...</span>
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              <span>Generate Passenger QR Code</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
