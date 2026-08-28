import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Payment, PaymentRequestPayload, CurrencyCode } from '../types/okada.types';
import {
  createPaymentRequest,
  getPaymentByPaymentId,
  updatePaymentStatus,
  getRiderTransactions,
} from '../services/supabase';
import { submitStellarPayment } from '../services/stellar';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

interface PaymentContextType {
  transactions: Payment[];
  activePayment: Payment | null;
  isLoading: boolean;
  createPayment: (payload: PaymentRequestPayload) => Promise<{ payment: Payment; paymentUrl: string }>;
  fetchPayment: (paymentId: string) => Promise<Payment | null>;
  processAndSubmitPayment: (paymentId: string) => Promise<{ success: boolean; hash: string; payment?: Payment }>;
  refreshTransactions: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { wallet, refreshBalances } = useWallet();
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getRiderTransactions(user.id);
      setTransactions(list);
    } catch (e) {
      console.error('Failed to load transactions:', e);
    }
  }, [user]);

  // Sync transactions whenever user changes or on cross-tab storage event
  useEffect(() => {
    refreshTransactions();

    const handleStorageSync = () => {
      refreshTransactions();
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('okada_db_sync', handleStorageSync);

    return () => {
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('okada_db_sync', handleStorageSync);
    };
  }, [refreshTransactions]);

  const createPayment = async (payload: PaymentRequestPayload) => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);
    try {
      const riderWallet = wallet.address || user.wallet_address || 'GAK3TESTNETRIDERWALLETADDRESS';
      const result = await createPaymentRequest({
        riderId: user.id,
        fareAmount: payload.fareAmount,
        currency: payload.currency,
        passengerName: payload.passengerName,
        rideReference: payload.rideReference,
        riderWalletAddress: riderWallet,
      });

      setActivePayment(result.payment);
      await refreshTransactions();
      return {
        payment: result.payment,
        paymentUrl: result.paymentUrl,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayment = async (paymentId: string): Promise<Payment | null> => {
    setIsLoading(true);
    try {
      const p = await getPaymentByPaymentId(paymentId);
      return p;
    } finally {
      setIsLoading(false);
    }
  };

  const processAndSubmitPayment = async (
    paymentId: string
  ): Promise<{ success: boolean; hash: string; payment?: Payment }> => {
    setIsLoading(true);
    try {
      const payment = await getPaymentByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Step 1: Update status to processing
      await updatePaymentStatus(paymentId, 'processing', undefined, wallet.address || undefined);

      // Step 2: Submit Stellar transaction
      let txResult: { success: boolean; hash: string };
      
      if (wallet.secretKey) {
        // Use in-app testnet wallet secret key for automated real transaction
        txResult = await submitStellarPayment({
          sourceSecretKey: wallet.secretKey,
          destinationPublicKey: payment.rider_wallet_address,
          amount: payment.amount,
          memoText: payment.ride?.ride_reference || 'OKADA Ride Pay',
        });
      } else {
        // Simulated or external wallet hash
        const simulatedHash = `8a${Array.from({ length: 62 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        txResult = { success: true, hash: simulatedHash };
      }

      // Step 3: Confirm payment on database and Soroban
      const updated = await updatePaymentStatus(
        paymentId,
        'completed',
        txResult.hash,
        wallet.address || 'GB7PASSENGERTESTNETADDRESS'
      );

      await refreshBalances();
      await refreshTransactions();

      return {
        success: true,
        hash: txResult.hash,
        payment: updated || undefined,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        activePayment,
        isLoading,
        createPayment,
        fetchPayment,
        processAndSubmitPayment,
        refreshTransactions,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
