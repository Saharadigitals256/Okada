import { createClient } from '@supabase/supabase-js';
import { Profile, Ride, Payment, PaymentStatus, CurrencyCode } from '../types/okada.types';
import { calculateSettlementAmount } from './rates';
import { createPaymentRequestOnContract, confirmPaymentOnContract } from './soroban';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ==============================================================================
// Reactive Local Database Layer for Instant Full-Stack MVP Functionality
// ==============================================================================

const DB_KEYS = {
  PROFILES: 'okada_db_profiles',
  RIDES: 'okada_db_rides',
  PAYMENTS: 'okada_db_payments',
  ACTIVE_USER: 'okada_db_active_user',
};

// Initial Seed Data for Demo West African Riders & Passengers
const SEED_PROFILES: Profile[] = [
  {
    id: 'user_rider_musa',
    email: 'musa.rider@okadapay.africa',
    full_name: 'Musa Ibrahim',
    phone_number: '+234 803 123 4567',
    wallet_address: 'GAK3MUSA54OKADARIDERTESTNETWALLETADDRESS99',
    user_type: 'rider',
    currency_preference: 'NGN',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'user_passenger_amaka',
    email: 'amaka.passenger@gmail.com',
    full_name: 'Amaka Okafor',
    phone_number: '+234 809 987 6543',
    wallet_address: 'GB7AMAKA98OKADAPASSENGERTESTNETWALLET2026',
    user_type: 'passenger',
    currency_preference: 'NGN',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const SEED_RIDES: Ride[] = [
  {
    id: 'ride_001',
    rider_id: 'user_rider_musa',
    passenger_id: 'user_passenger_amaka',
    amount_ngn: 2000,
    settlement_amount: 1.3333,
    settlement_asset: 'USDC',
    currency: 'NGN',
    passenger_name: 'Amaka Okafor',
    ride_reference: 'OKD-LG-8391',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'ride_002',
    rider_id: 'user_rider_musa',
    passenger_id: null,
    amount_ngn: 1500,
    settlement_amount: 1.0000,
    settlement_asset: 'USDC',
    currency: 'NGN',
    passenger_name: 'Dayo (Lekki Phase 1)',
    ride_reference: 'OKD-LG-9104',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

const SEED_PAYMENTS: Payment[] = [
  {
    id: 'pay_rec_001',
    ride_id: 'ride_001',
    payment_id: 'PAY_OKD_8391',
    rider_wallet_address: 'GAK3MUSA54OKADARIDERTESTNETWALLETADDRESS99',
    passenger_wallet_address: 'GB7AMAKA98OKADAPASSENGERTESTNETWALLET2026',
    amount: 1.3333,
    asset: 'USDC',
    stellar_transaction_hash: '3f5a89e17b8240f9c2d1e0a456789bcef123456789abcdef0123456789abcdef',
    soroban_transaction_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 3 + 12000).toISOString(),
  },
  {
    id: 'pay_rec_002',
    ride_id: 'ride_002',
    payment_id: 'PAY_OKD_9104',
    rider_wallet_address: 'GAK3MUSA54OKADARIDERTESTNETWALLETADDRESS99',
    amount: 1.0000,
    asset: 'USDC',
    stellar_transaction_hash: '4c8e1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    soroban_transaction_hash: '8f7e6d5c4b3a2019f8e7d6c5b4a3210fe9d8c7b6a50419283746501928374650',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 1 + 8000).toISOString(),
  }
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('okada_db_sync', { detail: { key, val } }));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

// Ensure default seeds exist
export function initializeLocalDatabase() {
  if (!localStorage.getItem(DB_KEYS.PROFILES)) {
    setStored(DB_KEYS.PROFILES, SEED_PROFILES);
  }
  if (!localStorage.getItem(DB_KEYS.RIDES)) {
    setStored(DB_KEYS.RIDES, SEED_RIDES);
  }
  if (!localStorage.getItem(DB_KEYS.PAYMENTS)) {
    setStored(DB_KEYS.PAYMENTS, SEED_PAYMENTS);
  }
}

// ----------------------------------------------------------------------------
// API: Profiles & Authentication
// ----------------------------------------------------------------------------

export async function dbGetProfile(userId: string): Promise<Profile | null> {
  initializeLocalDatabase();
  const profiles = getStored<Profile[]>(DB_KEYS.PROFILES, SEED_PROFILES);
  return profiles.find(p => p.id === userId) || null;
}

export async function dbSaveProfile(profile: Profile): Promise<Profile> {
  initializeLocalDatabase();
  const profiles = getStored<Profile[]>(DB_KEYS.PROFILES, SEED_PROFILES);
  const index = profiles.findIndex(p => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  setStored(DB_KEYS.PROFILES, profiles);
  return profile;
}

// ----------------------------------------------------------------------------
// API: Rides & Payments
// ----------------------------------------------------------------------------

export async function createPaymentRequest(params: {
  riderId: string;
  fareAmount: number;
  currency: CurrencyCode;
  passengerName?: string;
  rideReference?: string;
  riderWalletAddress: string;
}): Promise<{ ride: Ride; payment: Payment; paymentUrl: string }> {
  initializeLocalDatabase();

  const settlementAmount = calculateSettlementAmount(params.fareAmount, params.currency);
  const rideRef = params.rideReference || `OKD-${Date.now().toString(36).substring(3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const newRide: Ride = {
    id: `ride_${Date.now()}`,
    rider_id: params.riderId,
    amount_ngn: params.fareAmount,
    settlement_amount: settlementAmount,
    settlement_asset: 'USDC',
    currency: params.currency,
    passenger_name: params.passengerName || 'Passenger',
    ride_reference: rideRef,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const newPayment: Payment = {
    id: `pay_${Date.now()}`,
    ride_id: newRide.id,
    payment_id: paymentId,
    rider_wallet_address: params.riderWalletAddress,
    amount: settlementAmount,
    asset: 'USDC',
    status: 'pending',
    created_at: new Date().toISOString(),
    ride: newRide,
  };

  // 1. Record on Soroban contract
  await createPaymentRequestOnContract({
    paymentId,
    riderAddress: params.riderWalletAddress,
    amount: settlementAmount,
    asset: 'USDC',
    rideReference: rideRef,
  });

  // 2. Save in database
  const rides = getStored<Ride[]>(DB_KEYS.RIDES, []);
  rides.unshift(newRide);
  setStored(DB_KEYS.RIDES, rides);

  const payments = getStored<Payment[]>(DB_KEYS.PAYMENTS, []);
  payments.unshift(newPayment);
  setStored(DB_KEYS.PAYMENTS, payments);

  return {
    ride: newRide,
    payment: newPayment,
    paymentUrl: `/pay/${paymentId}`,
  };
}

export async function getPaymentByPaymentId(paymentId: string): Promise<Payment | null> {
  initializeLocalDatabase();
  const payments = getStored<Payment[]>(DB_KEYS.PAYMENTS, []);
  const payment = payments.find(p => p.payment_id === paymentId);
  if (!payment) return null;

  const rides = getStored<Ride[]>(DB_KEYS.RIDES, []);
  const ride = rides.find(r => r.id === payment.ride_id);

  const profiles = getStored<Profile[]>(DB_KEYS.PROFILES, []);
  const riderProfile = ride ? profiles.find(p => p.id === ride.rider_id) : null;

  return {
    ...payment,
    ride,
    rider_name: riderProfile?.full_name || 'OKADA Rider',
  };
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  stellarTxHash?: string,
  passengerWalletAddress?: string
): Promise<Payment | null> {
  initializeLocalDatabase();
  const payments = getStored<Payment[]>(DB_KEYS.PAYMENTS, []);
  const paymentIndex = payments.findIndex(p => p.payment_id === paymentId);
  if (paymentIndex === -1) return null;

  const payment = payments[paymentIndex];
  payment.status = status;
  if (stellarTxHash) payment.stellar_transaction_hash = stellarTxHash;
  if (passengerWalletAddress) payment.passenger_wallet_address = passengerWalletAddress;
  if (status === 'completed') {
    payment.completed_at = new Date().toISOString();
    payment.soroban_transaction_hash = stellarTxHash;

    // Confirm on Soroban contract
    await confirmPaymentOnContract(paymentId, stellarTxHash || '0xTESTNETSTRLR');

    // Also update associated ride
    const rides = getStored<Ride[]>(DB_KEYS.RIDES, []);
    const rideIndex = rides.findIndex(r => r.id === payment.ride_id);
    if (rideIndex !== -1) {
      rides[rideIndex].status = 'completed';
      setStored(DB_KEYS.RIDES, rides);
    }
  }

  payments[paymentIndex] = payment;
  setStored(DB_KEYS.PAYMENTS, payments);
  return payment;
}

export async function getRiderTransactions(riderId: string): Promise<Payment[]> {
  initializeLocalDatabase();
  const rides = getStored<Ride[]>(DB_KEYS.RIDES, []);
  const riderRides = rides.filter(r => r.rider_id === riderId);
  const rideIds = new Set(riderRides.map(r => r.id));

  const payments = getStored<Payment[]>(DB_KEYS.PAYMENTS, []);
  return payments
    .filter(p => rideIds.has(p.ride_id))
    .map(p => ({
      ...p,
      ride: riderRides.find(r => r.id === p.ride_id),
    }));
}
