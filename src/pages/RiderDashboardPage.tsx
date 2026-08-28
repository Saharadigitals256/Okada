import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { usePayment } from '../context/PaymentContext';
import { PaymentStatusBadge } from '../components/payment/PaymentStatusBadge';
import { formatCurrency, formatUSDC } from '../services/rates';
import { formatAddress, getStellarExplorerUrl } from '../services/stellar';
import {
  PlusCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface RiderDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RiderDashboardPage: React.FC<RiderDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { wallet, refreshBalances } = useWallet();
  const { transactions, refreshTransactions } = usePayment();

  // Metrics calculation
  const metrics = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'completed');
    const pending = transactions.filter(t => t.status === 'pending' || t.status === 'processing');

    const totalNgn = completed.reduce((acc, curr) => acc + (curr.ride?.amount_ngn || 0), 0);
    const totalUsdc = completed.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalNgn,
      totalUsdc,
      completedCount: completed.length,
      pendingCount: pending.length,
    };
  }, [transactions]);

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Rider Header & Welcome */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1 flex items-center justify-center text-xl shadow-lg shadow-emerald-950">
            🏍️
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-extrabold text-white leading-tight">
                {user?.full_name || 'Rider Dashboard'}
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                RIDER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {wallet.address ? formatAddress(wallet.address) : 'Wallet ready'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            refreshTransactions();
            refreshBalances();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Refresh stats"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Today's Earnings Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-xs text-emerald-300 font-medium mb-1">
          <span className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Today's Total Fare Earnings</span>
          </span>
          <span className="font-mono text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">
            Stellar Settled
          </span>
        </div>

        <div className="my-2">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatCurrency(metrics.totalNgn, user?.currency_preference || 'NGN')}
          </div>
          <div className="text-xs text-emerald-400 font-mono font-semibold mt-0.5">
            ≈ {formatUSDC(metrics.totalUsdc)} on Stellar Testnet
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed</span>
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {metrics.completedCount} <span className="text-xs font-normal text-slate-400">rides</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending</span>
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {metrics.pendingCount} <span className="text-xs font-normal text-slate-400">requests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Primary Action: Request Payment */}
      <button
        onClick={() => onNavigate('create-payment')}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-between transition-all transform active:scale-[0.98] group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/15 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="leading-tight">Request Payment</div>
            <div className="text-[11px] font-semibold text-slate-900/80">Generate QR code for passenger</div>
          </div>
        </div>
        <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Recent Transactions Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Recent Ride Payments</h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-emerald-400 hover:underline font-semibold flex items-center space-x-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-2">🏍️</div>
            <h3 className="text-sm font-bold text-white">No ride payments yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Tap "Request Payment" to create your first ride QR code for your passenger.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map(payment => (
              <div
                key={payment.id}
                onClick={() => {
                  if (payment.status === 'pending') {
                    onNavigate('qr-payment', { paymentId: payment.payment_id });
                  } else {
                    onNavigate('payment-success', { paymentId: payment.payment_id });
                  }
                }}
                className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-2xl transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      payment.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {payment.status === 'completed' ? '✓' : '...'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white truncate">
                        {payment.ride?.passenger_name || 'Passenger Ride'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 truncate">
                        {payment.ride?.ride_reference}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{formatUSDC(payment.amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end space-y-1">
                  <span className="font-black text-sm text-white">
                    {formatCurrency(payment.ride?.amount_ngn || 0, payment.ride?.currency || 'NGN')}
                  </span>
                  <PaymentStatusBadge status={payment.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
