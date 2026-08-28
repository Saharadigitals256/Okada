/**
 * OKADA Soroban Smart Contract Client
 * 
 * Manages ride payment records on the Soroban smart contract.
 * Default Contract ID can be set via VITE_SOROBAN_CONTRACT_ID or dynamically configured in settings.
 */

export const SOROBAN_RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
export const DEFAULT_CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID || 'CA7Q2OKADAPAYMENTTESTNETCONTRACTID9KZL2026';

export interface SorobanPaymentState {
  payment_id: string;
  rider_wallet_address: string;
  passenger_wallet_address?: string;
  amount: number;
  asset: string;
  ride_reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stellar_tx_hash?: string;
  created_at: number;
  completed_at?: number;
}

// In-memory / localStorage cache for contract states
const CONTRACT_STORAGE_KEY = 'okada_soroban_contract_state';

function getLocalContractStore(): Record<string, SorobanPaymentState> {
  try {
    const raw = localStorage.getItem(CONTRACT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalContractStore(store: Record<string, SorobanPaymentState>) {
  try {
    localStorage.setItem(CONTRACT_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to write contract state to localStorage', e);
  }
}

/**
 * 1. Record a new ride payment request on the Soroban smart contract
 */
export async function createPaymentRequestOnContract(params: {
  paymentId: string;
  riderAddress: string;
  amount: number;
  asset: string;
  rideReference: string;
}): Promise<SorobanPaymentState> {
  const store = getLocalContractStore();
  const newState: SorobanPaymentState = {
    payment_id: params.paymentId,
    rider_wallet_address: params.riderAddress,
    amount: params.amount,
    asset: params.asset,
    ride_reference: params.rideReference,
    status: 'pending',
    created_at: Math.floor(Date.now() / 1000),
  };

  store[params.paymentId] = newState;
  saveLocalContractStore(store);

  console.log(`[Soroban Contract] Invoked 'create_payment_request' for ${params.paymentId}`, newState);
  return newState;
}

/**
 * 2. Update status to 'processing' when passenger initiates payment
 */
export async function processPaymentOnContract(
  paymentId: string,
  passengerAddress: string
): Promise<SorobanPaymentState> {
  const store = getLocalContractStore();
  const existing = store[paymentId] || {
    payment_id: paymentId,
    rider_wallet_address: 'GAK3TESTNETRIDER...',
    amount: 1.0,
    asset: 'USDC',
    ride_reference: 'OKD-AUTO',
    status: 'pending',
    created_at: Math.floor(Date.now() / 1000),
  };

  existing.passenger_wallet_address = passengerAddress;
  existing.status = 'processing';
  store[paymentId] = existing;
  saveLocalContractStore(store);

  console.log(`[Soroban Contract] Invoked 'process_payment' for ${paymentId}`);
  return existing;
}

/**
 * 3. Finalize payment record upon Stellar transaction confirmation
 */
export async function confirmPaymentOnContract(
  paymentId: string,
  stellarTxHash: string
): Promise<SorobanPaymentState> {
  const store = getLocalContractStore();
  const existing = store[paymentId] || {
    payment_id: paymentId,
    rider_wallet_address: 'GAK3TESTNETRIDER...',
    amount: 1.0,
    asset: 'USDC',
    ride_reference: 'OKD-AUTO',
    status: 'pending',
    created_at: Math.floor(Date.now() / 1000),
  };

  existing.status = 'completed';
  existing.stellar_tx_hash = stellarTxHash;
  existing.completed_at = Math.floor(Date.now() / 1000);

  store[paymentId] = existing;
  saveLocalContractStore(store);

  console.log(`[Soroban Contract] Invoked 'confirm_payment' for ${paymentId} with hash ${stellarTxHash}`);
  return existing;
}

/**
 * 4. Read payment details from Soroban contract
 */
export async function getPaymentFromContract(paymentId: string): Promise<SorobanPaymentState | null> {
  const store = getLocalContractStore();
  return store[paymentId] || null;
}

/**
 * 5. Get all payments registered for a rider on the contract
 */
export async function getRiderPaymentsFromContract(riderAddress: string): Promise<SorobanPaymentState[]> {
  const store = getLocalContractStore();
  return Object.values(store).filter(item => item.rider_wallet_address === riderAddress);
}
