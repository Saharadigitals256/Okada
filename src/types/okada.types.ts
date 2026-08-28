export type UserType = 'rider' | 'passenger';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type CurrencyCode = 'NGN' | 'GHS' | 'XOF' | 'SLE';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  rateToUsd: number; // e.g. 1500 NGN = 1.00 USD
  minFare: number;
  popularFares: number[];
}

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  phone_number?: string;
  wallet_address?: string;
  user_type: UserType;
  currency_preference: CurrencyCode;
  avatar_url?: string;
  created_at: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  passenger_id?: string | null;
  amount_ngn: number;
  settlement_amount: number;
  settlement_asset: string;
  currency: CurrencyCode;
  passenger_name?: string;
  ride_reference: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  ride_id: string;
  payment_id: string;
  rider_wallet_address: string;
  passenger_wallet_address?: string | null;
  amount: number;
  asset: string;
  stellar_transaction_hash?: string | null;
  soroban_transaction_hash?: string | null;
  status: PaymentStatus;
  created_at: string;
  completed_at?: string | null;
  // Enriched ride details if joined
  ride?: Ride;
  rider_name?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceXLM: number;
  balanceUSDC: number;
  network: 'TESTNET' | 'PUBLIC';
  walletType: 'freighter' | 'in_app_testnet' | null;
  secretKey?: string | null; // only present for in-app testnet wallet
}

export interface PaymentRequestPayload {
  fareAmount: number;
  currency: CurrencyCode;
  passengerName?: string;
  rideReference?: string;
}
