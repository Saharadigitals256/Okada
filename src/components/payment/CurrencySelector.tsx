import React from 'react';
import { CurrencyCode } from '../../types/okada.types';
import { CURRENCIES } from '../../services/rates';

interface CurrencySelectorProps {
  selected: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selected, onChange }) => {
  const currencies = Object.values(CURRENCIES);

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block px-1">
        Local Currency
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {currencies.map(curr => {
          const isSelected = selected === curr.code;
          return (
            <button
              key={curr.code}
              type="button"
              onClick={() => onChange(curr.code)}
              className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <span className="text-xl">{curr.flag}</span>
              <div className="overflow-hidden">
                <div className="text-xs font-bold leading-none text-white">{curr.code}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{curr.symbol}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
