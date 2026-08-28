import * as freighter from '@stellar/freighter-api';
import { generateTestnetKeypair, fundWithFriendbot, getAccountBalances } from './stellar';
import { WalletState } from '../types/okada.types';

const IN_APP_WALLET_KEY = 'okada_in_app_wallet';

/**
 * Load or initialize an in-app testnet wallet
 */
export function getOrCreateInAppWallet(): { publicKey: string; secretKey: string } {
  try {
    const raw = localStorage.getItem(IN_APP_WALLET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.publicKey && parsed.secretKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading in-app wallet:', e);
  }

  // Generate new testnet keypair
  const newWallet = generateTestnetKeypair();
  try {
    localStorage.setItem(IN_APP_WALLET_KEY, JSON.stringify(newWallet));
    // Trigger initial friendbot funding in background
    fundWithFriendbot(newWallet.publicKey);
  } catch (e) {
    console.error('Failed to store in-app wallet:', e);
  }

  return newWallet;
}

/**
 * Check if Freighter Wallet extension is available in the user's browser
 */
export async function checkFreighterAvailable(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (typeof freighter.isConnected === 'function') {
      const res: any = await freighter.isConnected();
      if (typeof res === 'boolean') return res;
      if (res && typeof res.isConnected === 'boolean') return res.isConnected;
    }
    return !!(window as any).freighter;
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter Wallet extension
 */
export async function connectFreighter(): Promise<{ publicKey: string } | null> {
  try {
    const isAvailable = await checkFreighterAvailable();
    if (!isAvailable) return null;

    let pubKey = '';
    if (typeof freighter.getPublicKey === 'function') {
      const res: any = await freighter.getPublicKey();
      if (typeof res === 'string') {
        pubKey = res;
      } else if (res && res.publicKey) {
        pubKey = res.publicKey;
      } else if (res && res.address) {
        pubKey = res.address;
      }
    }

    if (!pubKey && typeof freighter.requestAccess === 'function') {
      const access: any = await freighter.requestAccess();
      if (typeof access === 'string') pubKey = access;
      else if (access && access.address) pubKey = access.address;
    }

    return pubKey ? { publicKey: pubKey } : null;
  } catch (err) {
    console.warn('Freighter connect error:', err);
    return null;
  }
}

/**
 * Refresh full wallet state (address, balances, network)
 */
export async function refreshWalletState(current: WalletState): Promise<WalletState> {
  if (!current.address) return current;

  const balances = await getAccountBalances(current.address);
  return {
    ...current,
    balanceXLM: balances.xlm,
    balanceUSDC: balances.usdc,
  };
}
