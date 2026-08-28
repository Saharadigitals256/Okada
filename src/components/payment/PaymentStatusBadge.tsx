import React from 'react';
import { PaymentStatus } from '../../types/okada.types';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'completed':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : size === 'lg'
              ? 'px-3.5 py-1.5 text-sm'
              : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>Confirmed on Stellar</span>
        </span>
      );

    case 'processing':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : size === 'lg'
              ? 'px-3.5 py-1.5 text-sm'
              : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Loader2 className={`animate-spin ${size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
          <span>Processing on Chain</span>
        </span>
      );

    case 'failed':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-red-500/15 border border-red-500/30 text-red-400 ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : size === 'lg'
              ? 'px-3.5 py-1.5 text-sm'
              : 'px-2.5 py-1 text-xs'
          }`}
        >
          <XCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>Payment Failed</span>
        </span>
      );

    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : size === 'lg'
              ? 'px-3.5 py-1.5 text-sm'
              : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>Waiting for Passenger</span>
        </span>
      );
  }
};
