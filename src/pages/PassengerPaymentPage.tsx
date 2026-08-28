import React, { useEffect, useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import { Payment } from '../types/okada.types';
import { formatCurrency, formatUSDC } from '../services/rates';
import { formatAddress } from '../services/stellar';
import { PaymentStatusBadge } from '../components/payment/PaymentStatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Wallet,
  ShieldCheck,
  Zap,
  User,
  Hash,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PassengerPaymentPageProps {
  paymentId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const PassengerPaymentPage: React.FC<PassengerPaymentPageProps> = ({
  paymentId,
  onNavigate,
}) => {
  const { fetchPayment, processAndSubmitPayment } = usePayment();
  const { wallet, requestTestnetFunds } = useWallet();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<'ready' | 'signing' | 'submitting' | 'recording' | 'done'>('ready');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      if (!paymentId) {
        // Look for most recent pending payment if direct access
        setLoading(false);
        return;
      }
      const p = await fetchPayment(paymentId);
      setPayment(p);
      setLoading(false);
    }
    load();
  }, [paymentId, fetchPayment]);

  const handlePayNow = async () => {
    if (!payment) return;
    setPaying(true);
    setErrorMsg('');

    try {
      // Step 1: Signing
      setCurrentStep('signing');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Submitting on Stellar Testnet
      setCurrentStep('submitting');
      const result = await processAndSubmitPayment(payment.payment_id);

      // Step 3: Soroban Record
      setCurrentStep('recording');
      await new Promise(r => setTimeout(r, 600));

      // Step 4: Done
      setCurrentStep('done');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onNavigate('payment-success', { paymentId: payment.payment_id });
      }, 1000);
    } catch (err: any) {
      console.error('Payment failure:', err);
      setErrorMsg(err?.message || 'Failed to complete Stellar payment. Please try again.');
      setCurrentStep('ready');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-sm text-slate-400">Loading ride checkout...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-white">Ride Payment Request Not Found</h2>
        <p className="text-xs text-slate-400">
          The payment QR code may have expired or was invalid. Please ask your rider to generate a new QR code.
        </p>
        <button
          onClick={() => onNavigate('landing')}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const fiatFormatted = formatCurrency(payment.ride?.amount_ngn || 0, payment.ride?.currency || 'NGN');
  const usdcFormatted = formatUSDC(payment.amount);

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-xs">
            🏍️
          </div>
          <span className="font-extrabold text-sm text-white">OKADA PAY</span>
        </div>
        <div className="w-8"></div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Payment Checkout Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="text-center">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Ride Payment Checkout
          </span>
          <h1 className="text-3xl font-black text-white">{fiatFormatted}</h1>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            Settlement Amount: <span className="text-emerald-400 font-bold">{usdcFormatted}</span>
          </div>
        </div>

        {/* Ride Details Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rider / Driver:</span>
            </span>
            <span className="font-bold text-white">{payment.rider_name || 'Musa Ibrahim'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-teal-400" />
              <span>Ride Reference:</span>
            </span>
            <span className="font-mono text-slate-300 font-semibold">
              {payment.ride?.ride_reference || payment.payment_id}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">Rider Wallet:</span>
            <span className="font-mono text-emerald-400 text-[11px]">
              {formatAddress(payment.rider_wallet_address)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Payment Status:</span>
            <PaymentStatusBadge status={payment.status} size="sm" />
          </div>
        </div>

        {/* Connected Passenger Wallet Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold text-white">Passenger Wallet</div>
              <div className="text-[10px] font-mono text-slate-400">
                {wallet.address ? formatAddress(wallet.address) : 'Auto-connected Testnet Wallet'}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Testnet Ready
          </span>
        </div>

        {/* Live Stepper when submitting */}
        {paying && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>
                {currentStep === 'signing' && 'Preparing & signing Stellar transaction...'}
                {currentStep === 'submitting' && 'Broadcasting to Stellar Testnet ledger...'}
                {currentStep === 'recording' && 'Updating Soroban smart contract state...'}
                {currentStep === 'done' && 'Payment confirmed!'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width:
                    currentStep === 'signing'
                      ? '30%'
                      : currentStep === 'submitting'
                      ? '65%'
                      : currentStep === 'recording'
                      ? '90%'
                      : '100%',
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Primary Action Button: Pay Now */}
        <button
          onClick={handlePayNow}
          disabled={paying || payment.status === 'completed'}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50"
        >
          {paying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : payment.status === 'completed' ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-950" />
              <span>Payment Already Completed</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Pay {fiatFormatted} ({usdcFormatted})</span>
            </>
          )}
        </button>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by Stellar & Soroban smart contracts</span>
        </div>
      </div>
    </div>
  );
};
