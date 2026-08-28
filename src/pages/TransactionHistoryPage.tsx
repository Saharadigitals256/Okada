import React, { useState, useMemo } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
import { PaymentStatusBadge } from '../components/payment/PaymentStatusBadge';
import { formatCurrency, formatUSDC } from '../services/rates';
import { formatAddress, getStellarExplorerUrl } from '../services/stellar';
import {
  ArrowLeft,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Receipt,
  Calendar,
} from 'lucide-react';

interface TransactionHistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ onNavigate }) => {
  const { transactions, refreshTransactions } = usePayment();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        (t.ride?.ride_reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ride?.passenger_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.payment_id || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'completed'
          ? t.status === 'completed'
          : t.status === 'pending' || t.status === 'processing';

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, filterStatus]);

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate(user?.user_type === 'rider' ? 'rider-dashboard' : 'landing')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-white">Ride Payment History</h1>
            <p className="text-xs text-slate-400">All recorded transactions on Stellar & Soroban</p>
          </div>
        </div>

        <button
          onClick={refreshTransactions}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by ride reference or passenger name..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          {(['all', 'completed', 'pending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition ${
                filterStatus === tab
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab === 'all' ? 'All Rides' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No transactions found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(payment => (
            <div
              key={payment.id}
              onClick={() => {
                if (payment.status === 'completed') {
                  onNavigate('payment-success', { paymentId: payment.payment_id });
                } else {
                  onNavigate('qr-payment', { paymentId: payment.payment_id });
                }
              }}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer flex items-center justify-between group"
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
                    <span className="text-[10px] font-mono text-slate-400">
                      {payment.ride?.ride_reference}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                    </span>
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
  );
};
