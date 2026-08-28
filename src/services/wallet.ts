import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
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
    const res = await isConnected();
    if (typeof res === 'object' && res !== null && 'isConnected' in res) {
      return Boolean(res.isConnected);
    }
    return Boolean(res);
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter Wallet extension and request access
 */
export async function connectFreighter(): Promise<{ publicKey: string } | null> {
  try {
    const available = await checkFreighterAvailable();
    if (!available) return null;

    // Request access from user via Freighter popup
    const accessRes = await requestAccess();
    if (accessRes && 'address' in accessRes && accessRes.address) {
      return { publicKey: accessRes.address };
    }

    // Fallback to getAddress if already permitted
    const addrRes = await getAddress();
    if (addrRes && 'address' in addrRes && addrRes.address) {
      return { publicKey: addrRes.address };
    }

    return null;
  } catch (err) {
    console.warn('Freighter connect error:', err);
    return null;
  }
}

/**
 * Sign a transaction using Freighter wallet
 */
export async function signWithFreighter(
  xdr: string,
  networkPassphrase?: string
): Promise<string | null> {
  try {
    const result = await signTransaction(xdr, {
      networkPassphrase,
    });
    if (result && 'signedTxXdr' in result && result.signedTxXdr) {
      return result.signedTxXdr;
    }
    return null;
  } catch (err) {
    console.error('Freighter transaction signing error:', err);
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
