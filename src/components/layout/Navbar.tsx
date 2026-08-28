import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../services/stellar';
import { Wallet, ShieldCheck, User, LogOut, ChevronDown, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, switchRole, logout } = useAuth();
  const { wallet, requestTestnetFunds, isLoading: walletLoading } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);

  const handleFundWallet = async () => {
    const ok = await requestTestnetFunds();
    if (ok) {
      setFaucetSuccess(true);
      setTimeout(() => setFaucetSuccess(false), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate(user?.user_type === 'rider' ? 'rider-dashboard' : 'landing')}
          className="flex items-center space-x-2.5 focus:outline-none group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <span className="text-xl">🏍️</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">OKADA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PAY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
              Fast payments for every ride
            </p>
          </div>
        </button>

        {/* Center: Stellar Testnet Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">Stellar Testnet</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono text-[11px]">Soroban Contract</span>
        </div>

        {/* Right Actions: Wallet & Profile */}
        <div className="flex items-center space-x-2">
          {/* Quick Role Toggle (For effortless testing) */}
          {user && (
            <button
              onClick={() => switchRole(user.user_type === 'rider' ? 'passenger' : 'rider')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center space-x-1"
              title="Click to toggle between Rider and Passenger modes"
            >
              <span>{user.user_type === 'rider' ? '🏍️ Rider' : '🚶 Passenger'}</span>
            </button>
          )}

          {/* Wallet / Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50 transition text-xs font-medium"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">
                {wallet.isConnected ? formatAddress(wallet.address) : 'Connect Wallet'}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-400/80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
                <div className="border-b border-slate-800 pb-2.5 mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Connected Wallet</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      Testnet
                    </span>
                  </div>
                  <p className="font-mono text-xs text-emerald-400 font-semibold truncate">
                    {wallet.address || 'No wallet linked'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">XLM Balance</span>
                      <span className="font-bold text-white">{wallet.balanceXLM.toLocaleString()} XLM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">USDC Settlement</span>
                      <span className="font-bold text-emerald-400">${wallet.balanceUSDC.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Faucet Funder Action */}
                <button
                  onClick={handleFundWallet}
                  disabled={walletLoading}
                  className="w-full mb-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{faucetSuccess ? 'Funded +10,000 XLM!' : 'Get Free Testnet XLM (Friendbot)'}</span>
                </button>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('history');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Transaction History</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      onNavigate('landing');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-xs flex items-center space-x-2 text-red-400"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
