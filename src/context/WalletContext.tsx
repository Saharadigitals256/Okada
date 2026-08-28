import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types/okada.types';
import { getOrCreateInAppWallet, connectFreighter, checkFreighterAvailable } from '../services/wallet';
import { getAccountBalances, fundWithFriendbot } from '../services/stellar';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: WalletState;
  isFreighterInstalled: boolean;
  isLoading: boolean;
  connectInAppWallet: () => Promise<void>;
  connectFreighterWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  requestTestnetFunds: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balanceXLM: 0,
    balanceUSDC: 0,
    network: 'TESTNET',
    walletType: null,
    secretKey: null,
  });

  // Check if Freighter is installed on mount
  useEffect(() => {
    checkFreighterAvailable().then(setIsFreighterInstalled);
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!wallet.address) return;
    try {
      const balances = await getAccountBalances(wallet.address);
      setWallet(prev => ({
        ...prev,
        balanceXLM: balances.xlm,
        balanceUSDC: balances.usdc,
      }));
    } catch (e) {
      console.warn('Balance refresh failed:', e);
    }
  }, [wallet.address]);

  // Connect default in-app testnet wallet automatically
  const connectInAppWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const inApp = getOrCreateInAppWallet();
      const balances = await getAccountBalances(inApp.publicKey);

      setWallet({
        isConnected: true,
        address: inApp.publicKey,
        balanceXLM: balances.xlm,
        balanceUSDC: balances.usdc,
        network: 'TESTNET',
        walletType: 'in_app_testnet',
        secretKey: inApp.secretKey,
      });

      if (user && user.wallet_address !== inApp.publicKey) {
        updateProfile({ wallet_address: inApp.publicKey });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, updateProfile]);

  const connectFreighterWallet = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await connectFreighter();
      if (!result) return false;

      const balances = await getAccountBalances(result.publicKey);
      setWallet({
        isConnected: true,
        address: result.publicKey,
        balanceXLM: balances.xlm,
        balanceUSDC: balances.usdc,
        network: 'TESTNET',
        walletType: 'freighter',
        secretKey: null,
      });

      if (user) {
        updateProfile({ wallet_address: result.publicKey });
      }
      return true;
    } catch (e) {
      console.error('Failed to connect Freighter:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balanceXLM: 0,
      balanceUSDC: 0,
      network: 'TESTNET',
      walletType: null,
      secretKey: null,
    });
  };

  const requestTestnetFunds = async (): Promise<boolean> => {
    if (!wallet.address) return false;
    setIsLoading(true);
    try {
      const funded = await fundWithFriendbot(wallet.address);
      if (funded) {
        // Wait 2 seconds for ledger to record
        await new Promise(r => setTimeout(r, 2000));
        await refreshBalances();
      }
      return funded;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize wallet on load
  useEffect(() => {
    connectInAppWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isFreighterInstalled,
        isLoading,
        connectInAppWallet,
        connectFreighterWallet,
        disconnectWallet,
        requestTestnetFunds,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
