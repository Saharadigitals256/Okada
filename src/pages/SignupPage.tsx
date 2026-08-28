import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserType, CurrencyCode } from '../types/okada.types';
import { CurrencySelector } from '../components/payment/CurrencySelector';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('rider');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    await signup(fullName, email, phone, userType, currency);
    onNavigate(userType === 'rider' ? 'rider-dashboard' : 'passenger-pay-direct');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950">
            🏍️
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join OKADA</h2>
          <p className="text-xs text-slate-400 mt-1">
            Fast, secure ride payments on Stellar blockchain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selector */}
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">I am registering as:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType('rider')}
                className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center space-y-1 ${
                  userType === 'rider'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">🏍️</span>
                <span className="text-xs font-bold">Rider / Driver</span>
                <span className="text-[10px] text-emerald-400">Accept ride payments</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('passenger')}
                className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center space-y-1 ${
                  userType === 'passenger'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">🚶</span>
                <span className="text-xs font-bold">Passenger</span>
                <span className="text-[10px] text-teal-400">Scan & pay for rides</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Musa Ibrahim"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="musa@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
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

          <CurrencySelector selected={currency} onChange={setCurrency} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition mt-2"
          >
            <span>{isLoading ? 'Creating Profile...' : 'Complete Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-emerald-400 font-bold hover:underline"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
