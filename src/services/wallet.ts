import { isConnected, getPublicKey } from '@stellar/freighter-api';
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
    const connected = await isConnected();
    return !!connected;
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter Wallet extension
 */
export async function connectFreighter(): Promise<{ publicKey: string } | null> {
  try {
    const connected = await isConnected();
    if (!connected) return null;
    const publicKey = await getPublicKey();
    return publicKey ? { publicKey } : null;
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
