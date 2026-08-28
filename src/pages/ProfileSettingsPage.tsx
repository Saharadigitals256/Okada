import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { CurrencySelector } from '../components/payment/CurrencySelector';
import { formatAddress, getStellarExplorerUrl } from '../services/stellar';
import { DEFAULT_CONTRACT_ID, SOROBAN_RPC_URL } from '../services/soroban';
import {
  ArrowLeft,
  User,
  Wallet,
  Zap,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Settings,
  Code,
  Save,
} from 'lucide-react';

interface ProfileSettingsPageProps {
  onNavigate: (page: string) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ onNavigate }) => {
  const { user, updateProfile, switchRole } = useAuth();
  const {
    wallet,
    connectFreighterWallet,
    connectInAppWallet,
    requestTestnetFunds,
    refreshBalances,
    isFreighterInstalled,
    isLoading: walletLoading,
  } = useWallet();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState('');
  const [contractId, setContractId] = useState(DEFAULT_CONTRACT_ID);

  const handleCopyAddr = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleFund = async () => {
    setFaucetMessage('Requesting 10,000 Testnet XLM from Friendbot...');
    const success = await requestTestnetFunds();
    if (success) {
      setFaucetMessage('✓ Account successfully funded with 10,000 Testnet XLM!');
    } else {
      setFaucetMessage('Friendbot request completed. Refreshing balances...');
    }
    setTimeout(() => setFaucetMessage(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate(user?.user_type === 'rider' ? 'rider-dashboard' : 'landing')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-white">Profile & Settings</h1>
          <p className="text-xs text-slate-400">Manage account, Stellar wallet, and Soroban contract</p>
        </div>
      </div>

      {/* User Information Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-emerald-950">
            {user?.user_type === 'rider' ? '🏍️' : '🚶'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{user?.full_name || 'OKADA User'}</h2>
            <p className="text-xs text-slate-400">{user?.email || 'user@okadapay.africa'}</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-300 font-medium block">Active Account Role</span>
            <span className="text-[11px] text-slate-500">
              Current: <strong className="text-emerald-400 uppercase">{user?.user_type}</strong>
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => switchRole('rider')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                user?.user_type === 'rider'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              🏍️ Rider
            </button>
            <button
              onClick={() => switchRole('passenger')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                user?.user_type === 'passenger'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              🚶 Passenger
            </button>
          </div>
        </div>
      </div>

      {/* Stellar Wallet Integration Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Stellar Blockchain Wallet</h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
            TESTNET
          </span>
        </div>

        {/* Address Banner */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Public Key (Address):</span>
            <button
              onClick={handleCopyAddr}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              {copiedAddr ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-white break-all leading-relaxed">
            {wallet.address || 'No wallet address linked'}
          </p>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Stellar XLM</span>
              <span className="font-bold text-white font-mono">{wallet.balanceXLM.toLocaleString()} XLM</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">USDC Settlement</span>
              <span className="font-bold text-emerald-400 font-mono">${wallet.balanceUSDC.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Faucet Button */}
        {faucetMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            {faucetMessage}
          </div>
        )}

        <button
          onClick={handleFund}
          disabled={walletLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center space-x-2 transition"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{walletLoading ? 'Contacting Friendbot...' : 'Fund Account with +10,000 Testnet XLM'}</span>
        </button>

        {/* Connect External Freighter Wallet */}
        {isFreighterInstalled && (
          <button
            onClick={connectFreighterWallet}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Connect Freighter Browser Extension</span>
          </button>
        )}
      </div>

      {/* Soroban Smart Contract Architecture Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Soroban Smart Contract Configuration</h3>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Contract ID</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={contractId}
              onChange={e => setContractId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleCopyContract}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Copy Contract ID"
            >
              {copiedContract ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
          <div>RPC: <span className="text-slate-300">{SOROBAN_RPC_URL}</span></div>
          <div>Horizon: <span className="text-slate-300">https://horizon-testnet.stellar.org</span></div>
        </div>
      </div>
    </div>
  );
};
