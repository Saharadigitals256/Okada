import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const role = email.includes('passenger') ? 'passenger' : 'rider';
    await login(email, role);
    onNavigate(role === 'rider' ? 'rider-dashboard' : 'passenger-pay-direct');
  };

  const handleDemoRider = async () => {
    await login('musa.rider@okadapay.africa', 'rider');
    onNavigate('rider-dashboard');
  };

  const handleDemoPassenger = async () => {
    await login('amaka.passenger@gmail.com', 'passenger');
    onNavigate('passenger-pay-direct');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950">
            🏍️
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome to OKADA</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your rider or passenger account</p>
        </div>

        {/* 1-Click Demo Accounts for Rapid Evaluation */}
        <div className="mb-6 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            ⚡ Quick 1-Click Demo Sign-in:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoRider}
              className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <span>🏍️ Musa (Rider)</span>
            </button>
            <button
              type="button"
              onClick={handleDemoPassenger}
              className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-300 hover:bg-teal-900/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <span>🚶 Amaka (Passenger)</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rider@okadapay.africa"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition"
          >
            <span>{isLoading ? 'Signing In...' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-emerald-400 font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
