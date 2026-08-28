import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { ArrowRight, QrCode, Zap, ShieldCheck, Smartphone, CheckCircle, ChevronRight, Globe, Lock } from 'lucide-react';
import { formatCurrency, formatUSDC } from '../services/rates';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, login } = useAuth();
  const { wallet, requestTestnetFunds } = useWallet();
  const [demoFare, setDemoFare] = useState(1500);

  const handleQuickDemoRider = async () => {
    await login('musa.rider@okadapay.africa', 'rider');
    onNavigate('rider-dashboard');
  };

  const handleQuickDemoPassenger = async () => {
    await login('amaka.passenger@gmail.com', 'passenger');
    onNavigate('passenger-pay-direct');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden text-center px-4">
        {/* Stellar Testnet Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6 animate-pulse-glow">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Powered by Stellar Blockchain & Soroban Smart Contracts</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Fast payments for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">every ride</span>.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal">
          OKADA helps commercial motorcycle and bike riders in West Africa request, receive, and confirm digital payments in seconds.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={handleQuickDemoRider}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center space-x-2 transition transform active:scale-95"
          >
            <span>Launch Rider Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleQuickDemoPassenger}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition"
          >
            <span>Pay a Ride</span>
            <QrCode className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Cash Hassle</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>3-Second Settlement</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stellar Testnet</span>
          </span>
        </div>
      </section>

      {/* Interactive Live Ride Simulation Card */}
      <section className="max-w-xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏍️</span>
              <div>
                <h3 className="text-sm font-bold text-white">Live Ride Payment Preview</h3>
                <p className="text-[11px] text-slate-400">See how fare converts to Stellar USDC</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              Instant
            </span>
          </div>

          {/* Interactive Fare Slider / Selector */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Trip Fare:</span>
                <span className="font-bold text-white text-base font-mono">{formatCurrency(demoFare, 'NGN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={demoFare}
                onChange={e => setDemoFare(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Conversion Result Box */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Passenger Pays (NGN)</span>
                <span className="text-sm font-extrabold text-white">{formatCurrency(demoFare, 'NGN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Stellar Settlement</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {formatUSDC(demoFare / 1500)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                login('musa.rider@okadapay.africa', 'rider');
                onNavigate('create-payment');
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center space-x-1.5 transition"
            >
              <span>Generate OKADA QR Code</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How OKADA Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simple 4-step ride payment workflow for West Africa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Rider Enters Fare</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rider enters fare in Nigerian Naira (₦) or local West African currency with a single tap.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-sm text-white mb-1">QR Code Generated</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Soroban smart contract initializes the payment record and creates a live QR code and link.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Passenger Scans & Pays</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Passenger scans QR code on phone, verifies fare, and approves with their Stellar wallet.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Instant Settlement</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Payment settles in ~3 seconds on Stellar. Rider screen alerts immediately with audio & receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <Zap className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="font-bold text-sm text-white mb-1">Lightning Fast Settlement</h4>
            <p className="text-xs text-slate-400">
              Transactions settle in seconds on Stellar with minimal fees (fractions of a cent).
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="font-bold text-sm text-white mb-1">Soroban Smart Contracts</h4>
            <p className="text-xs text-slate-400">
              Guarantees ride fare authenticity, prevents double spending, and creates immutable ride receipts.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <Globe className="w-6 h-6 text-teal-400 mb-3" />
            <h4 className="font-bold text-sm text-white mb-1">West Africa Ready</h4>
            <p className="text-xs text-slate-400">
              Built for Nigerian Naira (NGN), Ghanaian Cedi (GHS), CFA Franc (XOF), and Leone (SLE).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
