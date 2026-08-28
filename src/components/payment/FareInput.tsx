import React from 'react';
import { CurrencyCode } from '../../types/okada.types';
import { CURRENCIES, calculateSettlementAmount, formatUSDC } from '../../services/rates';
import { Zap } from 'lucide-react';

interface FareInputProps {
  amount: number;
  currency: CurrencyCode;
  onChange: (amount: number) => void;
}

export const FareInput: React.FC<FareInputProps> = ({ amount, currency, onChange }) => {
  const config = CURRENCIES[currency] || CURRENCIES.NGN;
  const usdcEquivalent = calculateSettlementAmount(amount, currency);

  const handleQuickSelect = (val: number) => {
    onChange(val);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="space-y-4">
      {/* Main Large Fare Display */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center shadow-inner relative overflow-hidden">
        <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-center space-x-1">
          <span>Enter Ride Fare</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">{config.name}</span>
        </div>

        <div className="flex items-center justify-center space-x-2 my-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{config.symbol}</span>
          <input
            type="number"
            value={amount || ''}
            onChange={handleDirectInput}
            placeholder="0"
            className="text-4xl sm:text-5xl font-black bg-transparent text-white focus:outline-none w-48 text-center placeholder-slate-700 tracking-tight"
            min="0"
            step="100"
          />
        </div>

        {/* Live Stellar Settlement Conversion */}
        <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Settles as</span>
          <span className="font-bold text-white font-mono">{formatUSDC(usdcEquivalent)}</span>
          <span className="text-[10px] text-slate-400">(Testnet)</span>
        </div>
      </div>

      {/* Quick Amount Preset Pills */}
      <div>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2 px-1">
          Quick Preset Amounts
        </span>
        <div className="grid grid-cols-3 gap-2">
          {config.popularFares.map(fare => {
            const isSelected = amount === fare;
            return (
              <button
                key={fare}
                type="button"
                onClick={() => handleQuickSelect(fare)}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex flex-col items-center ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span>
                  {config.symbol}
                  {fare.toLocaleString()}
                </span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  ${calculateSettlementAmount(fare, currency).toFixed(2)} USDC
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
