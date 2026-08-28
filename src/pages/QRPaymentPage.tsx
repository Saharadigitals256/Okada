import React, { useEffect, useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { QRCodeDisplay } from '../components/payment/QRCodeDisplay';
import { PaymentStatusBadge } from '../components/payment/PaymentStatusBadge';
import { Payment } from '../types/okada.types';
import { formatCurrency, formatUSDC } from '../services/rates';
import { ArrowLeft, Loader2, RefreshCw, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRPaymentPageProps {
  paymentId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const QRPaymentPage: React.FC<QRPaymentPageProps> = ({ paymentId, onNavigate }) => {
  const { fetchPayment, processAndSubmitPayment } = usePayment();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Poll / Listen for payment status update
  useEffect(() => {
    let intervalId: any;

    async function checkStatus() {
      if (!paymentId) return;
      const data = await fetchPayment(paymentId);
      if (data) {
        setPayment(data);
        if (data.status === 'completed') {
          // Play celebration confetti!
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });

          // Redirect to success screen after brief pause
          setTimeout(() => {
            onNavigate('payment-success', { paymentId: data.payment_id });
          }, 1200);
        }
      }
      setLoading(false);
    }

    checkStatus();
    intervalId = setInterval(checkStatus, 1500);

    const handleSync = () => checkStatus();
    window.addEventListener('storage', handleSync);
    window.addEventListener('okada_db_sync', handleSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('okada_db_sync', handleSync);
    };
  }, [paymentId, onNavigate, fetchPayment]);

  const handleSimulateInstantPay = async () => {
    if (!payment) return;
    setSimulating(true);
    try {
      await processAndSubmitPayment(payment.payment_id);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenPassengerTab = () => {
    onNavigate('passenger-pay', { paymentId });
  };

  if (loading || !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-sm text-slate-400">Loading payment request from Soroban...</p>
      </div>
    );
  }

  const fiatFormatted = formatCurrency(payment.ride?.amount_ngn || 0, payment.ride?.currency || 'NGN');
  const usdcFormatted = formatUSDC(payment.amount);

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 text-center">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('rider-dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">Listening for Payment...</span>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Amount & Status Summary */}
      <div>
        <div className="text-xs text-slate-400 font-medium">Show QR Code to Passenger</div>
        <div className="text-3xl font-black text-white mt-1 tracking-tight">{fiatFormatted}</div>
        <div className="text-xs text-emerald-400 font-mono font-semibold mt-0.5">
          Settlement: {usdcFormatted} on Stellar
        </div>
        <div className="mt-2">
          <PaymentStatusBadge status={payment.status} size="sm" />
        </div>
      </div>

      {/* High Quality QR Frame */}
      <QRCodeDisplay
        paymentUrl={`/pay/${payment.payment_id}`}
        amountFiat={fiatFormatted}
        amountUSDC={usdcFormatted}
        rideReference={payment.ride?.ride_reference || payment.payment_id}
        onSimulatePassengerScan={handleOpenPassengerTab}
      />

      {/* One-Click Demo Passenger Funder & Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Mode: Single-Device Simulator</span>
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
            Stellar Testnet
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Want to test the passenger payment without opening a second phone? Click below to instantly simulate the passenger signing and confirming on Stellar:
        </p>
        <button
          onClick={handleSimulateInstantPay}
          disabled={simulating || payment.status === 'completed'}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 flex items-center justify-center space-x-1.5 transition"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting to Stellar Testnet...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Instant Passenger Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
