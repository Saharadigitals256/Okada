import { CurrencyCode, CurrencyConfig } from '../types/okada.types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    rateToUsd: 1500, // ₦1,500 = 1.00 USDC
    minFare: 200,
    popularFares: [500, 1000, 1500, 2000, 3000, 5000],
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    flag: '🇬🇭',
    rateToUsd: 15.5, // 15.5 GHS = 1.00 USDC
    minFare: 5,
    popularFares: [10, 20, 30, 50, 80, 100],
  },
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    flag: '🇨🇮',
    rateToUsd: 610, // 610 XOF = 1.00 USDC
    minFare: 250,
    popularFares: [500, 1000, 1500, 2500, 5000],
  },
  SLE: {
    code: 'SLE',
    name: 'Sierra Leonean Leone',
    symbol: 'NLe',
    flag: '🇸🇱',
    rateToUsd: 22.8, // 22.8 SLE = 1.00 USDC
    minFare: 10,
    popularFares: [20, 50, 100, 150, 200],
  },
};

/**
 * Converts local fiat fare to Stellar settlement amount (USDC)
 */
export function calculateSettlementAmount(amount: number, currency: CurrencyCode): number {
  const config = CURRENCIES[currency] || CURRENCIES.NGN;
  if (!amount || amount <= 0) return 0;
  const usdc = amount / config.rateToUsd;
  // Round to 4 decimal places for precision
  return Math.round(usdc * 10000) / 10000;
}

/**
 * Formats local currency amount with appropriate symbol
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'NGN'): string {
  const config = CURRENCIES[currency] || CURRENCIES.NGN;
  return `${config.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats USDC settlement amount
 */
export function formatUSDC(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}
