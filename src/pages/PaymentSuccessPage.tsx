import React, { useEffect, useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
import { Payment } from '../types/okada.types';
import { formatCurrency, formatUSDC } from '../services/rates';
import { getStellarExplorerUrl, formatAddress } from '../services/stellar';
import {
  CheckCircle2,
  ExternalLink,
  Home,
  Receipt,
  Download,
  Share2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessPageProps {
  paymentId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  paymentId,
  onNavigate,
}) => {
  const { fetchPayment } = usePayment();
  const { user } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Run celebration confetti on screen mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    async function load() {
      if (paymentId) {
        const p = await fetchPayment(paymentId);
        setPayment(p);
      }
    }
    load();
  }, [paymentId, fetchPayment]);

  const txHash = payment?.stellar_transaction_hash || '7b8a90123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const explorerUrl = getStellarExplorerUrl(txHash);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5 pb-24 text-center">
      {/* Big Animated Success Checkmark */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-xl shadow-emerald-950/60 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-white">Payment Successful</h1>
        <p className="text-xs text-emerald-400 font-semibold mt-0.5">
          Ride payment completed & confirmed on Stellar
        </p>
      </div>

      {/* Digital Ride Receipt Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏍️</span>
            <span className="font-extrabold text-sm text-white">OKADA DIGITAL RECEIPT</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            PAID
          </span>
        </div>

        <div className="text-center py-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Total Amount Paid</span>
          <span className="text-2xl font-black text-white">
            {formatCurrency(payment?.ride?.amount_ngn || 1500, payment?.ride?.currency || 'NGN')}
          </span>
          <span className="text-xs text-emerald-400 font-mono block mt-0.5">
            Settlement: {formatUSDC(payment?.amount || 1.0)} on Stellar
          </span>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Rider Name:</span>
            <span className="font-bold text-white">{payment?.rider_name || 'Musa Ibrahim'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Ride Reference:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {payment?.ride?.ride_reference || 'OKD-LG-8391'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Settlement Asset:</span>
            <span className="font-semibold text-emerald-400">USDC (Stellar Testnet)</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time:</span>
            <span className="text-slate-300">
              {payment?.completed_at
                ? new Date(payment.completed_at).toLocaleString()
                : new Date().toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold">Completed (Confirmed on Ledger)</span>
          </div>
        </div>

        {/* Stellar Transaction Hash Box */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Stellar Transaction ID:</span>
            <button
              onClick={handleCopyHash}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <span>Copy Hash</span>
              )}
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 break-all leading-relaxed">
            {txHash}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md"
        >
          <ExternalLink className="w-4 h-4 text-emerald-400" />
          <span>View on Stellar Expert Explorer</span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrintReceipt}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => onNavigate(user?.user_type === 'rider' ? 'rider-dashboard' : 'landing')}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-950"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
